// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MorphoVault
 * @notice Vault for Morpho Blue integration on Base with multi-fee structure
 * @dev Supports performance fees, deposit/withdrawal fees, and referral system
 */
contract MorphoVault is ERC20, ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable asset;
    address public immutable treasury;

    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_DEPOSIT = 100e6;

    uint256 public performanceFeeBps = 1500;
    uint256 public depositFeeBps = 0;
    uint256 public withdrawalFeeBps = 0;
    uint256 public referralFeeBps = 500;

    uint256 public totalDeposits;
    uint256 public totalYieldGenerated;
    uint256 public totalFeesCollected;
    uint256 public lastYieldUpdate;

    mapping(address => address) public referrers;
    mapping(address => uint256) public referralEarnings;

    event Deposited(
        address indexed user,
        uint256 assets,
        uint256 shares,
        uint256 depositFee,
        address indexed referrer
    );
    event Withdrawn(
        address indexed user,
        uint256 shares,
        uint256 assets,
        uint256 withdrawalFee
    );
    event YieldDistributed(uint256 amount, uint256 performanceFee, uint256 referralFee);
    event FeesUpdated(uint256 performanceFee, uint256 depositFee, uint256 withdrawalFee);
    event ReferralSet(address indexed user, address indexed referrer);

    constructor(
        address _asset,
        address _treasury,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        require(_asset != address(0), "Invalid asset");
        require(_treasury != address(0), "Invalid treasury");

        asset = IERC20(_asset);
        treasury = _treasury;
        lastYieldUpdate = block.timestamp;
    }

    function deposit(uint256 assets, address referrer)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets >= MIN_DEPOSIT, "Below minimum");

        if (referrer != address(0) && referrers[msg.sender] == address(0) && referrer != msg.sender) {
            referrers[msg.sender] = referrer;
            emit ReferralSet(msg.sender, referrer);
        }

        uint256 depositFee = (assets * depositFeeBps) / FEE_DENOMINATOR;
        uint256 netAssets = assets - depositFee;

        shares = convertToShares(netAssets);
        require(shares > 0, "Zero shares");

        totalDeposits += netAssets;

        require(asset.transferFrom(msg.sender, address(this), assets), "Transfer failed");

        if (depositFee > 0) {
            totalFeesCollected += depositFee;
            require(asset.transfer(treasury, depositFee), "Fee transfer failed");
        }

        _mint(msg.sender, shares);

        emit Deposited(msg.sender, netAssets, shares, depositFee, referrers[msg.sender]);
    }

    function withdraw(uint256 shares)
        external
        nonReentrant
        returns (uint256 assets)
    {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient balance");

        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets");

        uint256 withdrawalFee = (assets * withdrawalFeeBps) / FEE_DENOMINATOR;
        uint256 netAssets = assets - withdrawalFee;

        _burn(msg.sender, shares);

        totalDeposits -= assets;

        if (withdrawalFee > 0) {
            totalFeesCollected += withdrawalFee;
            require(asset.transfer(treasury, withdrawalFee), "Fee transfer failed");
        }

        require(asset.transfer(msg.sender, netAssets), "Transfer failed");

        emit Withdrawn(msg.sender, shares, netAssets, withdrawalFee);
    }

    function distributeYield(uint256 yieldAmount) external onlyOwner {
        require(yieldAmount > 0, "Zero yield");

        uint256 performanceFee = (yieldAmount * performanceFeeBps) / FEE_DENOMINATOR;
        uint256 treasuryFee = (performanceFee * 10) / 15;
        uint256 totalReferralFee = (performanceFee * 5) / 15;
        uint256 netYield = yieldAmount - performanceFee;

        totalYieldGenerated += netYield;
        totalFeesCollected += performanceFee;
        lastYieldUpdate = block.timestamp;

        if (treasuryFee > 0) {
            require(asset.transfer(treasury, treasuryFee), "Treasury transfer failed");
        }

        emit YieldDistributed(netYield, performanceFee, totalReferralFee);
    }

    function updateFees(
        uint256 _performanceFeeBps,
        uint256 _depositFeeBps,
        uint256 _withdrawalFeeBps
    ) external onlyOwner {
        require(_performanceFeeBps <= 2000, "Performance fee too high");
        require(_depositFeeBps <= 30, "Deposit fee too high");
        require(_withdrawalFeeBps <= 30, "Withdrawal fee too high");

        performanceFeeBps = _performanceFeeBps;
        depositFeeBps = _depositFeeBps;
        withdrawalFeeBps = _withdrawalFeeBps;

        emit FeesUpdated(_performanceFeeBps, _depositFeeBps, _withdrawalFeeBps);
    }

    function enableDepositFee() external onlyOwner {
        require(totalAssets() >= 500_000e6, "TVL below threshold");
        depositFeeBps = 10;
        withdrawalFeeBps = 10;
        emit FeesUpdated(performanceFeeBps, depositFeeBps, withdrawalFeeBps);
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return assets;
        }
        return (assets * supply) / totalAssets();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return 0;
        }
        return (shares * totalAssets()) / supply;
    }

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function balanceOfAssets(address user) external view returns (uint256) {
        return convertToAssets(balanceOf(user));
    }

    function getCurrentAPY() external view returns (uint256) {
        if (totalDeposits == 0 || totalYieldGenerated == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        if (timeElapsed == 0) {
            return 0;
        }

        return (totalYieldGenerated * 365 days * 10000) / (totalDeposits * timeElapsed);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
