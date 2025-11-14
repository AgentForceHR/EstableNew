// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MorphoVault (fixed)
 * @notice Vault with Morpho strategy integration, safe ERC20 handling, accurate accounting, and referral rewards.
 * @dev This contract is a focused rewrite of the earlier MorphoVault with several safety and accounting fixes.
 *      - Uses SafeERC20 for token operations (handles non-standard tokens like USDT)
 *      - Aggregates on-contract balance + strategy assets in totalAssets()
 *      - Harvests compute real yield by checking pre/post totalAssets instead of accepting owner-supplied numbers
 *      - Referral rewards distributed via a reward-per-share mechanism (no loops)
 *      - MIN_DEPOSIT is configurable at construction (supports different stablecoin decimals)
 *      - Keeps performanceFeeBps cap behavior unchanged as requested
 */
contract MorphoVault is ERC20, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    /* ========== IMMUTABLES ========== */
    IERC20 public immutable asset;
    address public immutable treasury;

    /* ========== CONSTANTS ========== */
    uint256 public constant FEE_DENOMINATOR = 10000;

    /* ========== CONFIGURABLE FEES ========== */
    uint256 public performanceFeeBps = 1500; // allowed to be updated up to cap in updateFees
    uint256 public depositFeeBps = 0;
    uint256 public withdrawalFeeBps = 0;
    uint256 public referralFeeBps = 500; // percent of performance fee assigned to referrals

    /* ========== STRATEGY ========== */
    /// @notice Strategy adapter that interfaces with Morpho (or any strategy implementing IStrategy)
    address public strategy;

    /* ========== ACCOUNTING ========== */
    // totalYieldGenerated accumulates net yield (after performance fees) that has been credited to holders
    uint256 public totalYieldGenerated;

    // timestamp of last yield-related update (used for APY calculation)
    uint256 public lastYieldUpdate;

    /* ========== REFERRAL / REWARDS ========== */
    // referrer of each user (immutable after first set)
    mapping(address => address) public referrers;

    // referral "shares" tracked per referrer: number of vault shares attributable to referred users
    mapping(address => uint256) public referrerShares;

    // Reward-per-share accounting for referrals (scaled by 1e30)
    uint256 public referralRewardPerShare;
    uint256 private constant REWARD_PER_SHARE_PRECISION = 1e30;

    // reward debt per referrer to allow accruing lazily
    mapping(address => uint256) public referralRewardDebt;

    // referral earnings claimable (in asset units)
    mapping(address => uint256) public referralEarnings;

    /* ========== PARAMETERS ========== */
    uint256 public minDeposit; // configurable in constructor

    /* ========== EVENTS ========== */
    event Deposited(address indexed user, uint256 assets, uint256 shares, uint256 depositFee, address indexed referrer);
    event Withdrawn(address indexed user, uint256 shares, uint256 assets, uint256 withdrawalFee);
    event YieldHarvested(uint256 totalYield, uint256 performanceFee, uint256 referralPortion);
    event FeesUpdated(uint256 performanceFee, uint256 depositFee, uint256 withdrawalFee);
    event ReferralSet(address indexed user, address indexed referrer);
    event ReferralClaimed(address indexed referrer, uint256 amount);
    event StrategySet(address indexed strategy);

    /* ========== INTERFACES ========== */
    /// @dev Minimal strategy adapter interface expected from strategy contracts
    interface IStrategy {
        function totalAssets() external view returns (uint256);
        function invest(uint256 amount) external;
        function withdraw(uint256 amount) external returns (uint256);
        function harvest() external returns (uint256);
    }

    /* ========== CONSTRUCTOR ========== */
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

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Set strategy adapter address (onlyOwner)
    function setStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");
        strategy = _strategy;
        emit StrategySet(_strategy);
    }

    /// @notice Deposit assets into the vault. Optionally provide a referrer on first deposit.
    function deposit(uint256 assets, address referrer)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets >= minDeposit, "Below minimum");

        // set referrer if provided and not previously set
        if (referrer != address(0) && referrers[msg.sender] == address(0) && referrer != msg.sender) {
            referrers[msg.sender] = referrer;
            emit ReferralSet(msg.sender, referrer);
        }

        uint256 depositFee = (assets * depositFeeBps) / FEE_DENOMINATOR;
        uint256 netAssets = assets - depositFee;

        // compute shares to mint based on current totalAssets
        shares = convertToShares(netAssets);
        require(shares > 0, "Zero shares");

        // transfer asset from user
        asset.safeTransferFrom(msg.sender, address(this), assets);

        // transfer deposit fee immediately to treasury
        if (depositFee > 0) {
            asset.safeTransfer(treasury, depositFee);
        }

        // mint shares to user
        _mint(msg.sender, shares);

        // if user has a referrer, increase the referrer's referred-shares accounting
        address r = referrers[msg.sender];
        if (r != address(0)) {
            // settle any pending referrer rewards before changing share amounts
            _updateReferrerReward(r);
            referrerShares[r] += shares;
            // update reward debt after changing referred shares
            referralRewardDebt[r] = (referralRewardPerShare * referrerShares[r]) / REWARD_PER_SHARE_PRECISION;
        }

        // attempt to invest netAssets into strategy (if set)
        if (strategy != address(0)) {
            // transfer netAssets to strategy via invest call. Strategy is expected to pull from vault or assume vault holds funds.
            // We keep funds in vault balance and call invest which should transfer from vault to protocol.
            // If strategy expects tokens already in its possession, adapter should be written accordingly.
            asset.safeApprove(strategy, 0);
            asset.safeApprove(strategy, netAssets);
            try IStrategy(strategy).invest(netAssets) {
                // invested
            } catch {
                // if invest fails, leave funds in vault (do not revert deposit) — caller can withdraw later
                asset.safeApprove(strategy, 0);
            }
            asset.safeApprove(strategy, 0);
        }

        emit Deposited(msg.sender, netAssets, shares, depositFee, referrers[msg.sender]);
    }

    /// @notice Withdraw given share amount and receive assets (may trigger withdrawal from strategy)
    function withdraw(uint256 shares) external nonReentrant returns (uint256 assetsOut) {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient balance");

        // compute underlying assets for shares
        assetsOut = convertToAssets(shares);
        require(assetsOut > 0, "Zero assets");

        // burn shares first to avoid reentrancy issues with reward accounting
        _burn(msg.sender, shares);

        // if user had a referrer, reduce referrerShares and update reward debt
        address r = referrers[msg.sender];
        if (r != address(0)) {
            _updateReferrerReward(r);
            // reduce referred shares (cap to avoid underflow due to mismatch)
            if (referrerShares[r] >= shares) {
                referrerShares[r] -= shares;
            } else {
                referrerShares[r] = 0;
            }
            referralRewardDebt[r] = (referralRewardPerShare * referrerShares[r]) / REWARD_PER_SHARE_PRECISION;
        }

        uint256 withdrawalFee = (assetsOut * withdrawalFeeBps) / FEE_DENOMINATOR;
        uint256 netAssets = assetsOut - withdrawalFee;

        // ensure vault has enough on-hand liquidity, otherwise request from strategy
        uint256 vaultBalance = asset.balanceOf(address(this));
        if (vaultBalance < netAssets) {
            uint256 shortfall = netAssets - vaultBalance;
            if (strategy != address(0)) {
                // attempt to withdraw required shortfall from strategy
                try IStrategy(strategy).withdraw(shortfall) returns (uint256 withdrawn) {
                    // withdrawn amount returned by strategy adapter
                    // nothing further required — the vault's asset balance should have increased
                } catch {
                    // if withdraw from strategy fails, revert to be safe
                    revert("Insufficient liquidity and withdraw from strategy failed");
                }
            } else {
                revert("Insufficient liquidity");
            }
        }

        // transfer withdrawal fee to treasury
        if (withdrawalFee > 0) {
            asset.safeTransfer(treasury, withdrawalFee);
        }

        // transfer net assets to user
        asset.safeTransfer(msg.sender, netAssets);

        emit Withdrawn(msg.sender, shares, netAssets, withdrawalFee);
    }

    /// @notice Harvest real yield from strategy and distribute performance fee + referral fee
    /// @dev Computes yield by taking a pre/post totalAssets snapshot to avoid owner-supplied fake yields
    function harvestAndDistribute() external onlyOwner nonReentrant {
        require(strategy != address(0), "No strategy set");

        // snapshot before
        uint256 before = totalAssets();

        // call strategy.harvest(), which is expected to realize yield and transfer gains to the vault (or increase strategy accounting)
        uint256 harvested = 0;
        try IStrategy(strategy).harvest() returns (uint256 h) {
            harvested = h;
        } catch {
            // If harvest doesn't return amount, we compute delta after call
        }

        // snapshot after
        uint256 after = totalAssets();

        uint256 yieldAmount = 0;
        if (after > before) {
            yieldAmount = after - before;
        } else if (harvested > 0) {
            // fallback to returned value (if strategy reports it)
            yieldAmount = harvested;
        }

        require(yieldAmount > 0, "Zero yield");

        // performance fee computed on gross yield
        uint256 performanceFee = (yieldAmount * performanceFeeBps) / FEE_DENOMINATOR;

        // split performance fee into treasury portion and referral portion
        uint256 referralPortion = (performanceFee * referralFeeBps) / FEE_DENOMINATOR; // portion of performance fee for referrals
        uint256 treasuryPortion = performanceFee - referralPortion;

        // net yield credited to holders
        uint256 netYield = yieldAmount - performanceFee;
        totalYieldGenerated += netYield;
        lastYieldUpdate = block.timestamp;

        // transfer treasury portion
        if (treasuryPortion > 0) {
            asset.safeTransfer(treasury, treasuryPortion);
        }

        // distribute referralPortion to referrers using reward-per-share mechanism
        if (referralPortion > 0 && totalSupply() > 0) {
            // increment global reward per share (scaled)
            referralRewardPerShare += (referralPortion * REWARD_PER_SHARE_PRECISION) / totalSupply();
        }

        emit YieldHarvested(yieldAmount, performanceFee, referralPortion);
    }

    /// @notice Claim accumulated referral earnings for the caller (referrer)
    function claimReferralEarnings() external nonReentrant {
        _updateReferrerReward(msg.sender);
        uint256 amount = referralEarnings[msg.sender];
        require(amount > 0, "No earnings");
        referralEarnings[msg.sender] = 0;
        asset.safeTransfer(msg.sender, amount);
        emit ReferralClaimed(msg.sender, amount);
    }

    /* ========== INTERNAL HELPERS ========== */

    /// @dev Update the pending referral earnings for a referrer (lazy accrual)
    function _updateReferrerReward(address referrer) internal {
        uint256 shares = referrerShares[referrer];
        if (shares == 0) return;

        uint256 accumulated = (referralRewardPerShare * shares) / REWARD_PER_SHARE_PRECISION;
        uint256 pending = 0;
        if (accumulated > referralRewardDebt[referrer]) {
            pending = accumulated - referralRewardDebt[referrer];
            referralEarnings[referrer] += pending;
        }
        // update debt to current
        referralRewardDebt[referrer] = (referralRewardPerShare * shares) / REWARD_PER_SHARE_PRECISION;
    }

    /* ========== ADMIN / GOV ========== */

    function updateFees(
        uint256 _performanceFeeBps,
        uint256 _depositFeeBps,
        uint256 _withdrawalFeeBps
    ) external onlyOwner {
        // NOTE: as requested, we keep the existing performance fee cap behavior unchanged
        require(_performanceFeeBps <= 2000, "Performance fee too high");
        require(_depositFeeBps <= 30, "Deposit fee too high");
        require(_withdrawalFeeBps <= 30, "Withdrawal fee too high");

        performanceFeeBps = _performanceFeeBps;
        depositFeeBps = _depositFeeBps;
        withdrawalFeeBps = _withdrawalFeeBps;

        emit FeesUpdated(_performanceFeeBps, _depositFeeBps, _withdrawalFeeBps);
    }

    function enableDepositFee() external onlyOwner {
        // require TVL threshold — use totalAssets to account for invested funds
        require(totalAssets() >= 500_000e6, "TVL below threshold");
        depositFeeBps = 10;
        withdrawalFeeBps = 10;
        emit FeesUpdated(performanceFeeBps, depositFeeBps, withdrawalFeeBps);
    }

    /* ========== VIEW / ACCOUNTING ========== */

    /// @notice Total assets of the vault = on-contract balance + assets reported by strategy
    function totalAssets() public view returns (uint256) {
        uint256 onHand = asset.balanceOf(address(this));
        if (strategy == address(0)) return onHand;
        uint256 stratAssets = 0;
        try IStrategy(strategy).totalAssets() returns (uint256 s) {
            stratAssets = s;
        } catch {
            stratAssets = 0; // if strategy call fails, ignore (safe fallback)
        }
        return onHand + stratAssets;
    }

    /// @notice Convert underlying assets amount to vault shares (ERC4626-style)
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return assets; // 1:1 starting behavior
        }
        uint256 total = totalAssets();
        if (total == 0) return 0;
        return (assets * supply) / total;
    }

    /// @notice Convert shares to underlying assets
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (shares * totalAssets()) / supply;
    }

    /// @notice Returns user's current vault assets value
    function balanceOfAssets(address user) external view returns (uint256) {
        return convertToAssets(balanceOf(user));
    }

    /// @notice Simple APY approximation based on lastYieldUpdate and totalYieldGenerated
    function getCurrentAPY() external view returns (uint256) {
        // if no yield recorded, return 0
        if (totalYieldGenerated == 0) return 0;
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        if (timeElapsed == 0) return 0;
        // APY scaled to basis points (10000 = 100%)
        // APY = (totalYieldGenerated / totalUnderlyingAtLastUpdate) * (365 days / timeElapsed)
        uint256 totalAtSnapshot = totalAssets();
        if (totalAtSnapshot == 0) return 0;
        return (totalYieldGenerated * 365 days * FEE_DENOMINATOR) / (totalAtSnapshot * timeElapsed);
    }

    /* ========== PAUSE / UNPAUSE ========== */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
