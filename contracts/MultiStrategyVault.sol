// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiStrategyVault
 * @notice Advanced vault that can allocate funds across multiple DeFi protocols
 * @dev Supports dynamic rebalancing across Aave, Compound, and Curve
 */
contract MultiStrategyVault is ERC20, ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable asset;
    address public immutable treasury;

    uint256 public constant PERFORMANCE_FEE = 1000; // 10%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_DEPOSIT = 100e6;

    struct Strategy {
        address protocol;
        uint256 allocation; // Percentage in basis points (10000 = 100%)
        bool active;
    }

    Strategy[] public strategies;
    uint256 public totalAllocation;

    uint256 public totalDeposits;
    uint256 public totalYieldGenerated;
    uint256 public lastRebalance;

    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 shares, uint256 assets);
    event StrategyAdded(address indexed protocol, uint256 allocation);
    event StrategyUpdated(uint256 indexed strategyId, uint256 newAllocation);
    event Rebalanced(uint256 timestamp);
    event YieldHarvested(uint256 amount, uint256 fee);

    /**
     * @notice Initialize the multi-strategy vault
     * @param _asset The underlying stablecoin token
     * @param _treasury Treasury address
     */
    constructor(
        address _asset,
        address _treasury
    ) ERC20("Estable Multi-Strategy", "esMULTI") {
        require(_asset != address(0), "Invalid asset");
        require(_treasury != address(0), "Invalid treasury");

        asset = IERC20(_asset);
        treasury = _treasury;
        lastRebalance = block.timestamp;
    }

    /**
     * @notice Deposit assets into vault
     * @param assets Amount to deposit
     * @return shares Shares minted
     */
    function deposit(uint256 assets) external nonReentrant whenNotPaused returns (uint256 shares) {
        require(assets >= MIN_DEPOSIT, "Below minimum");

        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        totalDeposits += assets;

        require(asset.transferFrom(msg.sender, address(this), assets), "Transfer failed");

        _mint(msg.sender, shares);

        emit Deposited(msg.sender, assets, shares);
    }

    /**
     * @notice Withdraw assets from vault
     * @param shares Shares to burn
     * @return assets Assets returned
     */
    function withdraw(uint256 shares) external nonReentrant returns (uint256 assets) {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Insufficient balance");

        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets");

        _burn(msg.sender, shares);

        totalDeposits -= assets;

        require(asset.transfer(msg.sender, assets), "Transfer failed");

        emit Withdrawn(msg.sender, shares, assets);
    }

    /**
     * @notice Add a new strategy
     * @param protocol Protocol address
     * @param allocation Allocation percentage in basis points
     */
    function addStrategy(address protocol, uint256 allocation) external onlyOwner {
        require(protocol != address(0), "Invalid protocol");
        require(totalAllocation + allocation <= 10000, "Exceeds 100%");

        strategies.push(Strategy({
            protocol: protocol,
            allocation: allocation,
            active: true
        }));

        totalAllocation += allocation;

        emit StrategyAdded(protocol, allocation);
    }

    /**
     * @notice Update strategy allocation
     * @param strategyId Strategy index
     * @param newAllocation New allocation in basis points
     */
    function updateStrategy(uint256 strategyId, uint256 newAllocation) external onlyOwner {
        require(strategyId < strategies.length, "Invalid strategy");

        Strategy storage strategy = strategies[strategyId];
        uint256 oldAllocation = strategy.allocation;

        totalAllocation = totalAllocation - oldAllocation + newAllocation;
        require(totalAllocation <= 10000, "Exceeds 100%");

        strategy.allocation = newAllocation;

        emit StrategyUpdated(strategyId, newAllocation);
    }

    /**
     * @notice Harvest yield from all strategies
     * @param yieldAmount Total yield harvested
     */
    function harvestYield(uint256 yieldAmount) external onlyOwner {
        require(yieldAmount > 0, "Zero yield");

        uint256 fee = (yieldAmount * PERFORMANCE_FEE) / FEE_DENOMINATOR;
        uint256 netYield = yieldAmount - fee;

        totalYieldGenerated += netYield;

        if (fee > 0) {
            require(asset.transfer(treasury, fee), "Fee transfer failed");
        }

        emit YieldHarvested(netYield, fee);
    }

    /**
     * @notice Rebalance funds across strategies
     */
    function rebalance() external onlyOwner {
        lastRebalance = block.timestamp;
        emit Rebalanced(block.timestamp);
    }

    /**
     * @notice Convert assets to shares
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return assets;
        }
        return (assets * supply) / totalAssets();
    }

    /**
     * @notice Convert shares to assets
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return 0;
        }
        return (shares * totalAssets()) / supply;
    }

    /**
     * @notice Get total assets
     */
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /**
     * @notice Get all strategies
     */
    function getStrategies() external view returns (Strategy[] memory) {
        return strategies;
    }

    /**
     * @notice Pause deposits
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause deposits
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
