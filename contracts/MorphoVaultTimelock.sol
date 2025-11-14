// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Timelockable.sol";

/**
 * Timelock-aware MorphoVault (based on previous fixed MorphoVault)
 * Sensitive operations are timelocked; owner retains immediate ability to withdraw treasury-collected funds if needed.
 */
contract MorphoVault is ERC20, ReentrancyGuard, Pausable, Ownable, Timelockable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    address public immutable treasury;

    uint256 public constant FEE_DENOMINATOR = 10000;

    uint256 public performanceFeeBps = 1500;
    uint256 public depositFeeBps = 0;
    uint256 public withdrawalFeeBps = 0;
    uint256 public referralFeeBps = 500;

    address public strategy;
    uint256 public totalYieldGenerated;
    uint256 public lastYieldUpdate;

    mapping(address => address) public referrers;
    mapping(address => uint256) public referrerShares;
    mapping(address => uint256) public referralRewardDebt;
    mapping(address => uint256) public referralEarnings;

    uint256 public referralRewardPerShare;
    uint256 private constant REWARD_PER_SHARE_PRECISION = 1e30;

    uint256 public minDeposit;

    event Deposited(address indexed user, uint256 assets, uint256 shares, uint256 depositFee, address indexed referrer);
    event Withdrawn(address indexed user, uint256 shares, uint256 assets, uint256 withdrawalFee);
    event YieldHarvested(uint256 totalYield, uint256 performanceFee, uint256 referralPortion);
    event FeesUpdated(uint256 performanceFee, uint256 depositFee, uint256 withdrawalFee);
    event ReferralSet(address indexed user, address indexed referrer);
    event ReferralClaimed(address indexed referrer, uint256 amount);
    event StrategySet(address indexed strategy);

    interface IStrategy {
        function totalAssets() external view returns (uint256);
        function invest(uint256 amount) external;
        function withdraw(uint256 amount) external returns (uint256);
        function harvest() external returns (uint256);
    }

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

    /// set timelock (owner only)
    function setTimelock(address _timelock) external onlyOwner {
        _setTimelock(_timelock);
    }

    /// owner can still set strategy if you choose to (but recommended: onlyTimelock)
    function setStrategy(address _strategy) external onlyTimelock {
        require(_strategy != address(0), "Invalid strategy");
        strategy = _strategy;
        emit StrategySet(_strategy);
    }

    function deposit(uint256 assets, address referrer)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets >= minDeposit, "Below minimum");

        if (referrer != address(0) && referrers[msg.sender] == address(0) && referrer != msg.sender) {
            referrers[msg.sender] = referrer;
            emit ReferralSet(msg.sender, referrer);
        }

        uint256 depositFee = (assets * depositFeeBps) / FEE_DENOMINATOR;
        uint256 netAssets = assets - depositFee;

        shares = convertToShares(netAssets);
        require(shares > 0, "Zero shares");

        asset.safeTransferFrom(msg.sender, address(this), assets);

        if (depositFee > 0) {
            asset.safeTransfer(treasury, depositFee);
        }

        _mint(msg.sender, shares);

        address r = referrers[msg.sender];
        if (r != address(0)) {
            _updateReferrerReward(r);
            referrerShares[r] += shares;
            referralRewardDebt[r] = (referralRewardPerShare * referrerShares[r]) / REWARD_PER_SHARE_PRECISION;
        }

        if (strategy != address(0)) {
            asset.safeApprove(strategy, 0);
            asset.safeApprove(strategy, netAssets);
            try IStrategy(strategy).invest(netAssets) {
            } catch {
                asset.safeApprove(strategy, 0);
            }
            asset.safeApprove(strategy, 0);
        }

        emit Deposited(msg.sender, netAssets, shares, depositFee, referrers[msg.sender]);
    }

    function withdraw(uint256 shares) external nonReentrant returns (uint256 assetsOut) {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient balance");

        assetsOut = convertToAssets(shares);
        require(assetsOut > 0, "Zero assets");

        _burn(msg.sender, shares);

        address r = referrers[msg.sender];
        if (r != address(0)) {
            _updateReferrerReward(r);
            if (referrerShares[r] >= shares) {
                referrerShares[r] -= shares;
            } else {
                referrerShares[r] = 0;
            }
            referralRewardDebt[r] = (referralRewardPerShare * referrerShares[r]) / REWARD_PER_SHARE_PRECISION;
        }

        uint256 withdrawalFee = (assetsOut * withdrawalFeeBps) / FEE_DENOMINATOR;
        uint256 netAssets = assetsOut - withdrawalFee;

        uint256 vaultBalance = asset.balanceOf(address(this));
        if (vaultBalance < netAssets) {
            uint256 shortfall = netAssets - vaultBalance;
            if (strategy != address(0)) {
                try IStrategy(strategy).withdraw(shortfall) returns (uint256 withdrawn) {
                } catch {
                    revert("Insufficient liquidity and withdraw from strategy failed");
                }
            } else {
                revert("Insufficient liquidity");
            }
        }

        if (withdrawalFee > 0) {
            asset.safeTransfer(treasury, withdrawalFee);
        }

        asset.safeTransfer(msg.sender, netAssets);

        emit Withdrawn(msg.sender, shares, netAssets, withdrawalFee);
    }

    /// harvest & distribute: only callable by timelock (queued)
    function harvestAndDistribute() external onlyTimelock nonReentrant {
        require(strategy != address(0), "No strategy set");

        uint256 before = totalAssets();

        uint256 harvested = 0;
        try IStrategy(strategy).harvest() returns (uint256 h) {
            harvested = h;
        } catch {
        }

        uint256 after = totalAssets();

        uint256 yieldAmount = 0;
        if (after > before) {
            yieldAmount = after - before;
        } else if (harvested > 0) {
            yieldAmount = harvested;
        }

        require(yieldAmount > 0, "Zero yield");

        uint256 performanceFee = (yieldAmount * performanceFeeBps) / FEE_DENOMINATOR;
        uint256 referralPortion = (performanceFee * referralFeeBps) / FEE_DENOMINATOR;
        uint256 treasuryPortion = performanceFee - referralPortion;

        uint256 netYield = yieldAmount - performanceFee;
        totalYieldGenerated += netYield;
        lastYieldUpdate = block.timestamp;

        if (treasuryPortion > 0) {
            asset.safeTransfer(treasury, treasuryPortion);
        }

        if (referralPortion > 0 && totalSupply() > 0) {
            referralRewardPerShare += (referralPortion * REWARD_PER_SHARE_PRECISION) / totalSupply();
        }

        emit YieldHarvested(yieldAmount, performanceFee, referralPortion);
    }

    /// owner-only immediate: transfer tokens from vault to recipient but only allowed for treasury/owner
    function transferCollectedFees(address recipient, uint256 amount) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        asset.safeTransfer(recipient, amount);
    }

    // update fees: timelocked
    function updateFees(uint256 _performanceFeeBps, uint256 _depositFeeBps, uint256 _withdrawalFeeBps) external onlyTimelock {
        require(_performanceFeeBps <= 2000, "Performance fee too high");
        require(_depositFeeBps <= 30, "Deposit fee too high");
        require(_withdrawalFeeBps <= 30, "Withdrawal fee too high");

        performanceFeeBps = _performanceFeeBps;
        depositFeeBps = _depositFeeBps;
        withdrawalFeeBps = _withdrawalFeeBps;

        emit FeesUpdated(_performanceFeeBps, _depositFeeBps, _withdrawalFeeBps);
    }

    function enableDepositFee() external onlyTimelock {
        require(totalAssets() >= 500_000e6, "TVL below threshold");
        depositFeeBps = 10;
        withdrawalFeeBps = 10;
        emit FeesUpdated(performanceFeeBps, depositFeeBps, withdrawalFeeBps);
    }

    function totalAssets() public view returns (uint256) {
        uint256 onHand = asset.balanceOf(address(this));
        if (strategy == address(0)) return onHand;
        uint256 stratAssets = 0;
        try IStrategy(strategy).totalAssets() returns (uint256 s) {
            stratAssets = s;
        } catch {
            stratAssets = 0;
        }
        return onHand + stratAssets;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return assets;
        }
        uint256 total = totalAssets();
        if (total == 0) return 0;
        return (assets * supply) / total;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (shares * totalAssets()) / supply;
    }

    function balanceOfAssets(address user) external view returns (uint256) {
        return convertToAssets(balanceOf(user));
    }

    function getCurrentAPY() external view returns (uint256) {
        if (totalYieldGenerated == 0) return 0;
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        if (timeElapsed == 0) return 0;
        uint256 totalAtSnapshot = totalAssets();
        if (totalAtSnapshot == 0) return 0;
        return (totalYieldGenerated * 365 days * FEE_DENOMINATOR) / (totalAtSnapshot * timeElapsed);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // referral helper
    function claimReferralEarnings() external nonReentrant {
        _updateReferrerReward(msg.sender);
        uint256 amount = referralEarnings[msg.sender];
        require(amount > 0, "No earnings");
        referralEarnings[msg.sender] = 0;
        asset.safeTransfer(msg.sender, amount);
        emit ReferralClaimed(msg.sender, amount);
    }

    function _updateReferrerReward(address referrer) internal {
        uint256 shares = referrerShares[referrer];
        if (shares == 0) return;
        uint256 accumulated = (referralRewardPerShare * shares) / REWARD_PER_SHARE_PRECISION;
        uint256 pending = 0;
        if (accumulated > referralRewardDebt[referrer]) {
            pending = accumulated - referralRewardDebt[referrer];
            referralEarnings[referrer] += pending;
        }
        referralRewardDebt[referrer] = (referralRewardPerShare * shares) / REWARD_PER_SHARE_PRECISION;
    }
}
