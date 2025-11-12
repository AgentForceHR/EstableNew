# Estable.app - Deployment Guide

## Overview

Complete backend infrastructure for Estable.app DeFi yield platform with Supabase database, smart contracts, and Edge Functions.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Frontend (React)                 │
│         - Vaults Display                         │
│         - Deposit/Withdraw UI                    │
│         - Portfolio Management                   │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐  ┌────────▼──────────┐
│  Supabase DB   │  │  Smart Contracts  │
│  - Vaults      │  │  - StableVault    │
│  - Deposits    │  │  - VaultFactory   │
│  - Withdrawals │  │  - MultiStrategy  │
│  - Balances    │  │                   │
└───────┬────────┘  └────────┬──────────┘
        │                     │
┌───────▼────────────────────▼──────────┐
│        Supabase Edge Functions         │
│  - get-vaults                          │
│  - record-deposit                      │
│  - record-withdrawal                   │
│  - get-user-portfolio                  │
└────────────────────────────────────────┘
```

## Treasury Address

**IMPORTANT:** All performance fees are sent to:
```
0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE
```

## Database Schema

### Tables Created

1. **vaults** - Available yield vaults
   - USDC Vault (Aave V3, 15% APY)
   - USDT Vault (Compound, 16% APY)
   - Multi-Strategy (Multiple protocols, 18% APY)

2. **user_deposits** - All user deposits with transaction hashes

3. **user_withdrawals** - All user withdrawals with transaction hashes

4. **user_balances** - Current user balances across vaults

5. **vault_performance** - Historical APY and TVL tracking

### Row Level Security

- Users can only view/modify their own deposits, withdrawals, and balances
- Vaults and performance data are publicly readable
- Full audit trail maintained

## Smart Contracts

### StableVault.sol

Single-asset vault (USDC or USDT) with:
- ERC4626-style deposit/withdraw
- 10% performance fee to treasury
- $100 minimum deposit
- Share-based accounting
- Emergency pause functionality

**Key Functions:**
```solidity
deposit(uint256 assets) → uint256 shares
withdraw(uint256 shares) → uint256 assets
distributeYield(uint256 yieldAmount) // Owner only
getCurrentAPY() → uint256
```

### VaultFactory.sol

Factory for deploying StableVaults:
- Centralized treasury management
- One vault per asset type
- Track all deployed vaults

### MultiStrategyVault.sol

Advanced vault with multi-protocol allocation:
- Distribute funds across Aave, Compound, Curve
- Dynamic rebalancing
- Strategy allocation management
- Higher yield potential (18% APY)

## Supabase Edge Functions

### 1. get-vaults (Public)
```bash
GET /functions/v1/get-vaults
```
Returns all active vaults with APY and TVL data.

### 2. record-deposit (Authenticated)
```bash
POST /functions/v1/record-deposit
Authorization: Bearer <user_token>

{
  "vault_id": "uuid",
  "wallet_address": "0x...",
  "amount": "1000.00",
  "shares": "1000.00",
  "transaction_hash": "0x..."
}
```

### 3. record-withdrawal (Authenticated)
```bash
POST /functions/v1/record-withdrawal
Authorization: Bearer <user_token>

{
  "vault_id": "uuid",
  "wallet_address": "0x...",
  "shares_burned": "500.00",
  "amount_received": "525.50",
  "transaction_hash": "0x..."
}
```

### 4. get-user-portfolio (Authenticated)
```bash
GET /functions/v1/get-user-portfolio
Authorization: Bearer <user_token>
```
Returns user's balances, recent deposits, and withdrawals.

## Smart Contract Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```env
MAINNET_RPC_URL=your_alchemy_or_infura_url
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Deploy to Testnet (Sepolia)

```bash
npm run deploy
```

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

### Verify Contracts

After deployment, verify on Etherscan:

```bash
npx hardhat verify --network mainnet <FACTORY_ADDRESS> 0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE
npx hardhat verify --network mainnet <MULTI_VAULT_ADDRESS> <USDC_ADDRESS> 0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE
```

## Frontend Integration

### 1. Install Dependencies

Already included in package.json:
- `@supabase/supabase-js` - Database client
- `ethers` - Web3 integration

### 2. Environment Variables

Update `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Usage Example

```typescript
import { api } from './lib/api';

// Connect wallet
const address = await api.connect();

// Set auth token (after user login)
api.setAuthToken(userToken);

// Fetch vaults
const vaults = await api.fetchVaults();

// Deposit
const result = await api.deposit(
  vaultId,
  vaultAddress,
  tokenAddress,
  '1000', // $1000 USDC
  walletAddress
);

// Get portfolio
const portfolio = await api.getPortfolio();
```

## API Reference

### EstableAPI Class

Located in `lib/api.ts`:

```typescript
class EstableAPI {
  setAuthToken(token: string): void
  fetchVaults(): Promise<Vault[]>
  deposit(vaultId, vaultAddress, tokenAddress, amount, walletAddress): Promise<{txHash, shares}>
  withdraw(vaultId, vaultAddress, shares, walletAddress): Promise<{txHash, amount}>
  getPortfolio(): Promise<Portfolio>
  getBalance(vaultAddress, userAddress): Promise<{shares, assets, totalAssets, apy}>
  connect(): Promise<string>
}
```

## Contract Addresses (After Deployment)

Update these after deploying:

```json
{
  "VaultFactory": "0x...",
  "USDCVault": "0x...",
  "USDTVault": "0x...",
  "MultiStrategyVault": "0x...",
  "Treasury": "0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE"
}
```

## Security Considerations

### Smart Contracts

1. ✅ ReentrancyGuard on all critical functions
2. ✅ Pausable functionality for emergencies
3. ✅ Ownable for admin functions
4. ✅ Fixed performance fee (10%)
5. ⚠️ **Requires professional audit before mainnet**

### Database

1. ✅ RLS enabled on all tables
2. ✅ Users can only access own data
3. ✅ Transaction hashes indexed
4. ✅ Full audit trail maintained

### Edge Functions

1. ✅ CORS properly configured
2. ✅ JWT verification on protected endpoints
3. ✅ Input validation
4. ✅ Error handling

## Testing

### Smart Contracts

```bash
# Run tests
npx hardhat test

# With coverage
npx hardhat coverage

# With gas reporting
REPORT_GAS=true npx hardhat test
```

### Database

Test queries in Supabase dashboard:

```sql
-- Check vault data
SELECT * FROM vaults WHERE is_active = true;

-- Check user balances
SELECT ub.*, v.name
FROM user_balances ub
JOIN vaults v ON ub.vault_id = v.id
WHERE ub.user_id = 'user_uuid';
```

## Monitoring

### Key Metrics to Track

1. **Total Value Locked (TVL)** - Sum of all vault balances
2. **Active Users** - Unique users with balances > 0
3. **Transaction Volume** - Deposits + Withdrawals
4. **APY Performance** - Actual yield vs. advertised
5. **Treasury Fees** - Performance fees collected

### Database Queries

```sql
-- Total TVL
SELECT SUM(total_value_locked) as total_tvl FROM vaults;

-- Active users
SELECT COUNT(DISTINCT user_id) FROM user_balances WHERE shares > 0;

-- Recent deposits
SELECT * FROM user_deposits
ORDER BY deposited_at DESC
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Transaction Fails**
   - Check token approval
   - Verify minimum deposit ($100)
   - Ensure sufficient gas

2. **Balance Not Updating**
   - Check Edge Function logs
   - Verify RLS policies
   - Confirm transaction hash

3. **Cannot Connect Wallet**
   - Ensure MetaMask installed
   - Check network (mainnet/testnet)
   - Verify RPC endpoint

## Maintenance

### Regular Tasks

1. **Update APY Data** - Call `distributeYield()` after harvesting
2. **Monitor TVL** - Track vault balances
3. **Rebalance Multi-Strategy** - Call `rebalance()` periodically
4. **Archive Old Data** - Clean up historical records

### Emergency Procedures

1. **Pause Deposits** - Call `pause()` on vault contracts
2. **Contact Users** - Use email/notifications
3. **Audit Logs** - Check transaction hashes
4. **Recovery** - Call `unpause()` after fix

## Support

For issues or questions:
- Smart Contract: Review `contracts/README.md`
- Database: Check Supabase dashboard
- Edge Functions: View function logs
- Frontend: Check browser console

## License

MIT - See LICENSE file
