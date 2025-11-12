// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StableVault
 * @notice ERC4626-style vault for stablecoin yield generation
 * @dev Implements deposit/withdraw functionality with share-based accounting
 */
contract StableVault is ERC20, ReentrancyGuard, Pausable, Ownable {
    IERC20 public immutable asset;
    address public immutable treasury;

    uint256 public constant PERFORMANCE_FEE = 1000; // 10% performance fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_DEPOSIT = 100e6; // $100 minimum deposit (6 decimals for USDC/USDT)

    uint256 public totalDeposits;
    uint256 public totalYieldGenerated;
    uint256 public lastYieldUpdate;

    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 shares, uint256 assets);
    event YieldDistributed(uint256 amount, uint256 fee);

    /**
     * @notice Initialize the vault
     * @param _asset The underlying stablecoin token (USDC/USDT)
     * @param _treasury Treasury address to receive performance fees
     * @param _name Vault token name
     * @param _symbol Vault token symbol
     */
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

    /**
     * @notice Deposit assets into the vault
     * @param assets Amount of assets to deposit
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets) external nonReentrant whenNotPaused returns (uint256 shares) {
        require(assets >= MIN_DEPOSIT, "Deposit below minimum");

        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        totalDeposits += assets;

        require(asset.transferFrom(msg.sender, address(this), assets), "Transfer failed");

        _mint(msg.sender, shares);

        emit Deposited(msg.sender, assets, shares);
    }

    /**
     * @notice Withdraw assets from the vault
     * @param shares Amount of shares to burn
     * @return assets Amount of assets returned
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
     * @notice Distribute yield to vault (called by yield generation strategy)
     * @param yieldAmount Amount of yield generated
     */
    function distributeYield(uint256 yieldAmount) external onlyOwner {
        require(yieldAmount > 0, "Zero yield");

        uint256 fee = (yieldAmount * PERFORMANCE_FEE) / FEE_DENOMINATOR;
        uint256 netYield = yieldAmount - fee;

        totalYieldGenerated += netYield;
        lastYieldUpdate = block.timestamp;

        if (fee > 0) {
            require(asset.transfer(treasury, fee), "Fee transfer failed");
        }

        emit YieldDistributed(netYield, fee);
    }

    /**
     * @notice Convert assets to shares
     * @param assets Amount of assets
     * @return shares Equivalent shares
     */
    function convertToShares(uint256 assets) public view returns (uint256 shares) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return assets;
        }
        return (assets * supply) / totalAssets();
    }

    /**
     * @notice Convert shares to assets
     * @param shares Amount of shares
     * @return assets Equivalent assets
     */
    function convertToAssets(uint256 shares) public view returns (uint256 assets) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return 0;
        }
        return (shares * totalAssets()) / supply;
    }

    /**
     * @notice Get total assets in vault
     * @return Total asset balance
     */
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /**
     * @notice Get user's asset balance
     * @param user User address
     * @return Asset balance
     */
    function balanceOfAssets(address user) external view returns (uint256) {
        return convertToAssets(balanceOf(user));
    }

    /**
     * @notice Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Get current APY estimate
     * @return APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        if (totalDeposits == 0 || totalYieldGenerated == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        if (timeElapsed == 0) {
            return 0;
        }

        // Annualized yield rate
        uint256 annualizedYield = (totalYieldGenerated * 365 days * 10000) / (totalDeposits * timeElapsed);
        return annualizedYield;
    }
}
