// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StableVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VaultFactory
 * @notice Factory contract for deploying and managing StableVaults
 */
contract VaultFactory is Ownable {
    address public immutable treasury;

    address[] public vaults;
    mapping(address => bool) public isVault;
    mapping(address => address) public assetToVault; // asset => vault mapping

    event VaultCreated(
        address indexed vault,
        address indexed asset,
        string name,
        string symbol
    );

    event VaultRemoved(address indexed vault);

    /**
     * @notice Initialize the factory
     * @param _treasury Treasury address for performance fees
     */
    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /**
     * @notice Create a new vault
     * @param asset The underlying stablecoin token
     * @param name Vault token name
     * @param symbol Vault token symbol
     * @return vault Address of the created vault
     */
    function createVault(
        address asset,
        string memory name,
        string memory symbol
    ) external onlyOwner returns (address vault) {
        require(asset != address(0), "Invalid asset");
        require(assetToVault[asset] == address(0), "Vault exists for asset");

        StableVault newVault = new StableVault(asset, treasury, name, symbol);
        vault = address(newVault);

        vaults.push(vault);
        isVault[vault] = true;
        assetToVault[asset] = vault;

        emit VaultCreated(vault, asset, name, symbol);
    }

    /**
     * @notice Get all vaults
     * @return Array of vault addresses
     */
    function getAllVaults() external view returns (address[] memory) {
        return vaults;
    }

    /**
     * @notice Get number of vaults
     * @return Count of vaults
     */
    function getVaultCount() external view returns (uint256) {
        return vaults.length;
    }

    /**
     * @notice Get vault for a specific asset
     * @param asset Asset address
     * @return vault Vault address
     */
    function getVaultForAsset(address asset) external view returns (address vault) {
        return assetToVault[asset];
    }
}
