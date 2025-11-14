// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StableVaultTimelock.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VaultFactory
 * @notice Deploys StableVaultTimelock vaults with transparent timelock governance
 * @dev Factory temporarily becomes owner → configures vault → transfers to final owner
 */
contract VaultFactory is Ownable {
    address public immutable treasury;
    address public timelock;                     // global timelock used for all vaults
    uint256 public defaultMinDeposit = 100e6;    // default $100 min deposit

    address[] public vaults;
    mapping(address => bool) public isVault;
    mapping(address => address) public assetToVault;

    event VaultCreated(
        address indexed vault,
        address indexed asset,
        uint256 minDeposit,
        string name,
        string symbol
    );

    event VaultRemoved(address indexed vault);
    event TimelockUpdated(address indexed oldTimelock, address indexed newTimelock);
    event DefaultMinDepositUpdated(uint256 oldAmount, uint256 newAmount);

    constructor(address _treasury, address _timelock) {
        require(_treasury != address(0), "Invalid treasury");
        require(_timelock != address(0), "Invalid timelock");

        treasury = _treasury;
        timelock = _timelock;
    }

    /**
     * @notice Deploy a new StableVaultTimelock
     * @param asset Stablecoin address (USDC/USDT/DAI)
     * @param minDeposit Minimum deposit for this vault
     * @param name Vault token name
     * @param symbol Vault token symbol
     */
    function createVault(
        address asset,
        uint256 minDeposit,
        string memory name,
        string memory symbol
    ) external onlyOwner returns (address vault) {
        require(asset != address(0), "Invalid asset");
        require(assetToVault[asset] == address(0), "Vault exists");

        // Deploy vault (factory temporarily owns it)
        StableVaultTimelock newVault = new StableVaultTimelock(
            asset,
            treasury,
            minDeposit,
            name,
            symbol
        );

        vault = address(newVault);

        // Mark vault
        vaults.push(vault);
        isVault[vault] = true;
        assetToVault[asset] = vault;

        // Configure timelock
        newVault.setTimelock(timelock);

        // Transfer control from factory → final owner
        newVault.transferOwnership(msg.sender);

        emit VaultCreated(vault, asset, minDeposit, name, symbol);
    }

    /**
     * @notice Create using default minDeposit
     */
    function createVaultDefault(
        address asset,
        string memory name,
        string memory symbol
    ) external onlyOwner returns (address vault) {
        return createVault(asset, defaultMinDeposit, name, symbol);
    }

    /**
     * @notice Update global timelock for future vaults
     */
    function setTimelock(address newTimelock) external onlyOwner {
        require(newTimelock != address(0), "Invalid timelock");
        emit TimelockUpdated(timelock, newTimelock);
        timelock = newTimelock;
    }

    /**
     * @notice Update default minimum deposit
     */
    function setDefaultMinDeposit(uint256 newMin) external onlyOwner {
        require(newMin > 0, "Invalid amount");
        emit DefaultMinDepositUpdated(defaultMinDeposit, newMin);
        defaultMinDeposit = newMin;
    }

    /**
     * @notice Get all vaults
     */
    function getAllVaults() external view returns (address[] memory) {
        return vaults;
    }

    /**
     * @notice Number of vaults deployed
     */
    function getVaultCount() external view returns (uint256) {
        return vaults.length;
    }

    /**
     * @notice Get vault linked to a stablecoin
     */
    function getVaultForAsset(address asset) external view returns (address vault) {
        return assetToVault[asset];
    }
}
