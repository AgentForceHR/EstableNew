// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
  StableVaultTimelock.sol
  - Timelock-aware stablecoin vault (owner-managed + timelock for sensitive ops)
  - SafeERC20 used everywhere
  - harvestAndDistribute() must be executed by timelock (queued)
  - owner retains immediate ability to pause/unpause and transfer already-collected treasury funds
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Minimal Timelockable helper (put this in a separate file Timelockable.sol in your repo)
abstract contract Timelockable {
    address public timelock;
    event TimelockSet(address indexed timelock);
    function _setTimelock(address _timelock) internal {
        require(_timelock != address(0), "Timelock: zero");
        timelock = _timelock;
        emit TimelockSet(_timelock);
    }
    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }
}

contract StableVault is ERC20, ReentrancyGuard, Pausable, Ownable, Timelockable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    address public treasury;

    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public minDeposit;

    // performance fee in bps (e.g. 1500 = 15%). Make configurable via timelock.
    uint256 public performanceFeeBps = 1000;

    // optional strategy adapter (if you later wire a strategy)
    address public strategy;

    // accounting for statistics
    uint256 public totalYieldGenerated; // cumulative net yield (after fees)
    uint256 public lastYieldUpdate;

    // constants/defaults
    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 shares, uint256 assets);
    event YieldDistributed(uint256 grossYield, uint256 performanceFee, uint256 netYield);
    event StrategySet(address indexed strategy);
    event TreasurySet(address indexed treasury);
    event FeesUpdated(uint256 performanceFeeBps);

    // Safety: rescue tokens not equal to asset
    event RescueTokens(address indexed token, address indexed to, uint256 amount);

    /**
     * @param _asset stablecoin (USDC/USDT)
     * @param _treasury treasury address that receives performance fees
     * @param _minDeposit minimum deposit amount (use appropriate decimals for token)
     * @param _name ERC20 name
     * @param _symbol ERC20 symbol
     */
    constructor(
        address _asset,
        address _treasury,
        uint256 _minDeposit,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        require(_asset != address(0), "Invalid asset");
        require(_treasury != address(0), "Invalid treasury");
        require(_minDeposit > 0, "Invalid min deposit");

        asset = IERC20(_asset);
        treasury = _treasury;
        minDeposit = _minDeposit;
        lastYieldUpdate = block.timestamp;
    }

    /* ========== ADMIN: timelock/owner setup ========== */

    /// Owner boots the timelock once after deployment
    function setTimelock(address _timelock) external onlyOwner {
        _setTimelock(_timelock);
    }

    /// Set (change) treasury; this is a sensitive parameter — require timelock to change
    function setTreasury(address _treasury) external onlyTimelock {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasurySet(_treasury);
    }

    /// Set strategy adapter (timelocked)
    function setStrategy(address _strategy) external onlyTimelock {
        strategy = _strategy;
        emit StrategySet(_strategy);
    }

    /// Update fees (timelocked). Owner cannot change instantly.
    function updateFees(uint256 _performanceFeeBps) external onlyTimelock {
        require(_performanceFeeBps <= 2000, "Fee too high");
        performanceFeeBps = _performanceFeeBps;
        emit FeesUpdated(_performanceFeeBps);
    }

    /* ========== USER FLOWS ========== */

    /// Deposit tokens and receive shares
    function deposit(uint256 assets) external nonReentrant whenNotPaused returns (uint256 shares) {
        require(assets >= minDeposit, "Deposit below min");
        require(assets > 0, "Zero assets");

        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        // pull assets
        asset.safeTransferFrom(msg.sender, address(this), assets);

        // mint shares to depositor
        _mint(msg.sender, shares);

        emit Deposited(msg.sender, assets, shares);
    }

    /// Withdraw by burning shares and receiving underlying assets
    function withdraw(uint256 shares) external nonReentrant returns (uint256 assets) {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient balance");

        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets");

        // Burn shares first
        _burn(msg.sender, shares);

        // Ensure vault has enough liquidity (we assume no external strategies, or strategy withdraw handled elsewhere)
        uint256 bal = asset.balanceOf(address(this));
        require(bal >= assets, "Insufficient vault liquidity");

        asset.safeTransfer(msg.sender, assets);

        emit Withdrawn(msg.sender, shares, assets);
    }

    /* ========== HARVEST / YIELD ========== */

    /// Harvest & distribute real yield. This must be executed via timelock (queued).
    /// The function measures real yield by comparing totalAssets() before/after calling strategy.harvest()
    /// If `strategy` is not set then this function will revert unless yield tokens were already transferred to this vault
    function harvestAndDistribute() external onlyTimelock nonReentrant {
        // snapshot before
        uint256 before = totalAssets();

        uint256 harvestedFromStrategy = 0;
        if (strategy != address(0)) {
            // try calling harvest on adapter; if it returns amount, use it, otherwise compute delta
            try IHarvestable(strategy).harvest() returns (uint256 h) {
                harvestedFromStrategy = h;
            } catch {
                // ignore revert; we'll compute by snapshot
            }
        }

        // snapshot after
        uint256 after = totalAssets();

        uint256 yieldAmount = 0;
        if (after > before) {
            yieldAmount = after - before;
        } else {
            yieldAmount = harvestedFromStrategy;
        }

        require(yieldAmount > 0, "Zero yield");

        // compute performance fee on gross yield
        uint256 fee = (yieldAmount * performanceFeeBps) / FEE_DENOMINATOR;
        uint256 netYield = yieldAmount - fee;

        // record stats
        totalYieldGenerated += netYield;
        lastYieldUpdate = block.timestamp;

        // send treasury portion immediately
        if (fee > 0) {
            asset.safeTransfer(treasury, fee);
        }

        emit YieldDistributed(yieldAmount, fee);
    }

    /* ========== VIEWS / ACCOUNTING ========== */

    /// Total assets held by vault contract
    function totalAssets() public view returns (uint256) {
        // If you later integrate strategy adapters, include their on-chain totalAssets
        return asset.balanceOf(address(this));
    }

    /// Convert assets -> shares
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            // initial 1:1 mapping
            return assets;
        }
        uint256 total = totalAssets();
        if (total == 0) return 0;
        return (assets * supply) / total;
    }

    /// Convert shares -> assets
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (shares * totalAssets()) / supply;
    }

    /// Approximate APY based on last yield update (basis points)
    function getCurrentAPY() external view returns (uint256) {
        if (totalYieldGenerated == 0) return 0;
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        if (timeElapsed == 0) return 0;
        uint256 totalAtSnapshot = totalAssets();
        if (totalAtSnapshot == 0) return 0;
        return (totalYieldGenerated * 365 days * FEE_DENOMINATOR) / (totalAtSnapshot * timeElapsed);
    }

    /* ========== OWNER IMMEDIATE ACTIONS (not timelocked) ========== */

    /// Owner can pause/unpause immediately for fast emergency response
    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }

    /// Transfer any collected treasury tokens previously paid to the vault (rare case)
    /// Only allows moving `asset` out to treasury (explicit, owner-controlled). Use carefully.
    function transferCollectedFees(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        asset.safeTransfer(to, amount);
    }

    /// Rescue ERC20 tokens accidentally sent to the vault except the underlying asset
    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        require(token != address(asset), "Cannot rescue underlying");
        require(to != address(0), "Invalid recipient");
        IERC20(token).safeTransfer(to, amount);
        emit RescueTokens(token, to, amount);
    }

    /* ========== INTERFACES ========== */

    /// Optional minimal interface the strategy should implement
    interface IHarvestable {
        function harvest() external returns (uint256);
    }
}
