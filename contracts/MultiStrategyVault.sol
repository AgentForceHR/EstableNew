// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 shares) external returns (uint256 withdrawn);
    function investedAssets() external view returns (uint256);
    function harvest() external returns (uint256 yieldGenerated);
    function isActive() external view returns (bool);
}

/**
 * @title MultiStrategyVault (Improved)
 * @dev Fixes all issues except the four explicitly requested.
 *      Owner-only behavior from original contract is intentionally preserved.
 */
contract MultiStrategyVault is ERC20, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    address public immutable treasury;

    uint256 public constant PERFORMANCE_FEE = 1000;   // 10%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_DEPOSIT = 100e6;

    struct Strategy {
        address protocol;
        uint256 allocation; // basis points
        bool active;
    }

    Strategy[] public strategies;
    uint256 public totalAllocation; // sum of all active allocations

    uint256 public totalYieldGenerated;

    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 shares, uint256 assets);
    event StrategyAdded(address indexed protocol, uint256 allocation);
    event StrategyUpdated(uint256 indexed id, uint256 newAlloc, bool active);
    event StrategyRemoved(uint256 indexed id);
    event Rebalanced(uint256 timestamp);
    event YieldHarvested(uint256 net, uint256 fee);

    constructor(address _asset, address _treasury)
        ERC20("Estable Multi-Strategy", "esMULTI")
    {
        require(_asset != address(0), "Invalid asset");
        require(_treasury != address(0), "Invalid treasury");

        asset = IERC20(_asset);
        treasury = _treasury;
    }

    /* ////////////////////////////////////////////////////////////////
                            DEPOSIT / WITHDRAW
    //////////////////////////////////////////////////////////////// */

    function deposit(uint256 assets)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets > 0, "Zero assets");

        // Enforce MIN_DEPOSIT only for first mint
        if (totalSupply() == 0) {
            require(assets >= MIN_DEPOSIT, "Below minimum");
        }

        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        asset.safeTransferFrom(msg.sender, address(this), assets);
        _mint(msg.sender, shares);

        _investPending();

        emit Deposited(msg.sender, assets, shares);
    }

    function withdraw(uint256 shares)
        external
        nonReentrant
        returns (uint256 assets)
    {
        require(shares > 0, "Zero shares");
        require(shares <= balanceOf(msg.sender), "Insufficient shares");

        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets");

        _burn(msg.sender, shares);

        _withdrawFromStrategies(assets);

        asset.safeTransfer(msg.sender, assets);

        emit Withdrawn(msg.sender, shares, assets);
    }

    /* ////////////////////////////////////////////////////////////////
                             STRATEGY MGMT
    //////////////////////////////////////////////////////////////// */

    function addStrategy(address protocol, uint256 allocation)
        external
        onlyOwner
    {
        require(protocol != address(0), "Invalid strategy");
        require(allocation > 0, "Zero allocation");

        totalAllocation += allocation;
        require(totalAllocation <= 10000, "Alloc > 100%");

        strategies.push(Strategy(protocol, allocation, true));

        // Safety: verify it implements IStrategy
        require(IStrategy(protocol).isActive(), "Invalid strategy impl");

        emit StrategyAdded(protocol, allocation);
    }

    function updateStrategy(uint256 id, uint256 newAlloc, bool active)
        external
        onlyOwner
    {
        require(id < strategies.length, "Invalid ID");
        Strategy storage s = strategies[id];

        // Adjust totalAllocation safely
        totalAllocation = totalAllocation - s.allocation + newAlloc;
        require(totalAllocation <= 10000, "Alloc > 100%");

        s.allocation = newAlloc;
        s.active = active;

        emit StrategyUpdated(id, newAlloc, active);
    }

    function removeStrategy(uint256 id) external onlyOwner {
        require(id < strategies.length, "Invalid ID");

        Strategy storage s = strategies[id];
        totalAllocation -= s.allocation;

        strategies[id] = strategies[strategies.length - 1];
        strategies.pop();

        emit StrategyRemoved(id);
    }

    /* ////////////////////////////////////////////////////////////////
                           REBALANCING & YIELD
    //////////////////////////////////////////////////////////////// */

    // NOT FIXED BY REQUEST — onlyOwner is intentionally kept
    function rebalance() external onlyOwner {
        _investPending();
        emit Rebalanced(block.timestamp);
    }

    // NOT FIXED BY REQUEST — onlyOwner is intentionally kept
    function harvestYield(uint256 manualYieldAmount) external onlyOwner {
        uint256 totalYield = manualYieldAmount;

        // Harvest actual yield from strategies
        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].active) continue;
            uint256 y = IStrategy(strategies[i].protocol).harvest();
            totalYield += y;
        }

        require(totalYield > 0, "Zero yield");

        uint256 fee = (totalYield * PERFORMANCE_FEE) / FEE_DENOMINATOR;
        uint256 net = totalYield - fee;

        totalYieldGenerated += net;

        if (fee > 0) {
            asset.safeTransfer(treasury, fee);
        }

        // Yield stays in vault, increasing share price
        emit YieldHarvested(net, fee);
    }

    /* ////////////////////////////////////////////////////////////////
                           INTERNAL LOGIC
    //////////////////////////////////////////////////////////////// */

    function _investPending() internal {
        uint256 bal = asset.balanceOf(address(this));
        if (bal == 0 || totalAllocation == 0) return;

        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy memory s = strategies[i];
            if (!s.active || s.allocation == 0) continue;

            uint256 allocAmount = (bal * s.allocation) / totalAllocation;
            if (allocAmount == 0) continue;

            asset.safeApprove(s.protocol, 0);
            asset.safeApprove(s.protocol, allocAmount);

            IStrategy(s.protocol).deposit(allocAmount);
        }
    }

    function _withdrawFromStrategies(uint256 amountNeeded) internal {
        uint256 totalPulled;

        for (uint256 i = 0; i < strategies.length; i++) {
            if (totalPulled >= amountNeeded) break;

            Strategy memory s = strategies[i];
            if (!s.active) continue;

            uint256 invested = IStrategy(s.protocol).investedAssets();
            if (invested == 0) continue;

            uint256 target = (amountNeeded * s.allocation) / totalAllocation;
            if (target > invested) target = invested;

            uint256 received = IStrategy(s.protocol).withdraw(target);
            totalPulled += received;
        }

        require(totalPulled >= amountNeeded, "Insufficient strategy liquidity");
    }

    /* ////////////////////////////////////////////////////////////////
                           VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////// */

    function totalAssets() public view returns (uint256) {
        uint256 bal = asset.balanceOf(address(this));

        uint256 invested;
        for (uint256 i = 0; i < strategies.length; i++) {
            invested += IStrategy(strategies[i].protocol).investedAssets();
        }
        return bal + invested;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? assets : (assets * supply) / totalAssets();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? 0 : (shares * totalAssets()) / supply;
    }

    function getStrategies() external view returns (Strategy[] memory) {
        return strategies;
    }

    /* ////////////////////////////////////////////////////////////////
                               PAUSE
    //////////////////////////////////////////////////////////////// */

    // NOT FIXED BY REQUEST — pause controlled only by owner
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
