# Estable.app Smart Contracts

## Overview

Estable.app smart contracts provide secure, auditable vault infrastructure for stablecoin yield generation.

## Contracts

### StableVault.sol
ERC4626-style vault for single-asset yield generation (USDC or USDT).

**Features:**
- Deposit/withdraw functionality with share-based accounting
- 10% performance fee on yield
- Minimum deposit: $100
- Emergency pause capability
- APY tracking

**Key Functions:**
- `deposit(uint256 assets)` - Deposit stablecoins, receive shares
- `withdraw(uint256 shares)` - Burn shares, receive stablecoins
- `distributeYield(uint256 yieldAmount)` - Distribute earned yield (owner only)
- `getCurrentAPY()` - Get current annualized yield rate

### VaultFactory.sol
Factory contract for deploying and managing StableVaults.

**Features:**
- Deploy vaults for different stablecoins
- Track all deployed vaults
- Centralized treasury management

**Key Functions:**
- `createVault(address asset, string name, string symbol)` - Deploy new vault
- `getAllVaults()` - Get all vault addresses
- `getVaultForAsset(address asset)` - Find vault for specific token

### MultiStrategyVault.sol
Advanced vault supporting multiple DeFi protocols simultaneously.

**Features:**
- Allocate funds across Aave, Compound, Curve
- Dynamic rebalancing
- Strategy management
- Higher yield potential (18% APY target)

**Key Functions:**
- `deposit(uint256 assets)` - Deposit stablecoins
- `withdraw(uint256 shares)` - Withdraw stablecoins
- `addStrategy(address protocol, uint256 allocation)` - Add new strategy
- `updateStrategy(uint256 strategyId, uint256 newAllocation)` - Update allocations
- `harvestYield(uint256 yieldAmount)` - Harvest yield from strategies
- `rebalance()` - Rebalance funds across strategies

## Treasury Address

**Treasury:** `0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE`

All performance fees (10% of yield) are sent to this address.

## Deployment

### Prerequisites

```bash
npm install
```

### Environment Setup

Create `.env.local` file:

```
MAINNET_RPC_URL=your_rpc_url
SEPOLIA_RPC_URL=your_sepolia_rpc
POLYGON_RPC_URL=your_polygon_rpc
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Deploy

```bash
# Deploy to testnet (Sepolia)
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### Verify

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Security Considerations

1. **ReentrancyGuard** - All deposit/withdraw functions protected
2. **Pausable** - Emergency pause capability
3. **Ownable** - Admin functions restricted
4. **Minimum Deposits** - Prevents dust attacks
5. **Fee Structure** - Fixed 10% performance fee, transparent

## Testing

```bash
# Run tests
npx hardhat test

# Run with coverage
npx hardhat coverage

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## Architecture

```
VaultFactory
├── StableVault (USDC)
├── StableVault (USDT)
└── Creates vaults with consistent treasury

MultiStrategyVault
├── Strategy 1 (Aave)
├── Strategy 2 (Compound)
└── Strategy 3 (Curve)
```

## Integration Example

```javascript
// Connect to vault
const vault = await ethers.getContractAt('StableVault', vaultAddress);

// Approve tokens
await usdc.approve(vault.address, depositAmount);

// Deposit
await vault.deposit(depositAmount);

// Check balance
const shares = await vault.balanceOf(userAddress);
const assets = await vault.balanceOfAssets(userAddress);

// Withdraw
await vault.withdraw(shares);
```

## Audit Status

⚠️ **Contracts pending audit** - Do not use in production without professional audit.

Recommended auditors:
- OpenZeppelin
- Trail of Bits
- Consensys Diligence

## License

MIT
