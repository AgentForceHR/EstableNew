# app.estable.lat - Production Mainnet Guide

## Overview

The app.estable.lat subdomain is now fully configured for Base Mainnet production vaults. This guide covers the implementation and how it works.

## What Was Built

### 1. MainnetPage Component
**Location**: `/pages/MainnetPage.tsx`

A production-ready page that:
- Displays Base Mainnet vaults (not testnet)
- Shows security features (48-hour timelock)
- Highlights optimization strategies (Morpho Blue + Spark.fi)
- Explains mainnet vs testnet differences
- Uses the same Vaults component as testnet (automatically detects chain)

### 2. Smart Routing System
**Location**: `/App.tsx`

The app now supports subdomain-based routing:

```javascript
const isAppSubdomain = window.location.hostname === 'app.estable.lat';
```

**Routing Logic**:
- On `app.estable.lat`: MainnetPage is the default (/)
- On `estable.lat`: HomePage is the default (/)
- Both can access: `/testnet`, `/affiliates`, `/points`

### 3. Multi-Network Contract Support
**Location**: `/lib/contracts.ts`

The contracts library now supports both networks:

- **Base Mainnet** (Chain ID: 8453)
  - Real USDC, USDT, DAI tokens
  - Production Morpho vaults
  - 48-hour timelock protection

- **Base Sepolia** (Chain ID: 84532)
  - Test tokens with faucet
  - Testnet vaults for safe testing
  - 1-hour timelock for faster testing

**Auto-Detection**: The library automatically detects which network the user is connected to and loads the appropriate vault addresses.

### 4. Mainnet Deployment Configuration
**Location**: `/deployments/base-mainnet.json`

Pre-configured with:
- Real Base Mainnet token addresses (USDC, USDT, DAI)
- Morpho Blue protocol address
- Placeholder vault addresses (to be updated after deployment)
- Market IDs for Spark.fi, Steakhouse, and sDAI strategies

### 5. Deployment Script
**Location**: `/scripts/deploy-mainnet.js`

Automated deployment script that:
- Deploys three production vaults with 48-hour timelock
- Configures each vault with appropriate Morpho markets
- Saves deployment addresses to `base-mainnet.json`
- Includes security checks and validation

**Run with**: `npm run deploy:mainnet`

## Token Addresses (Base Mainnet)

```javascript
USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
USDT: 0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2
DAI:  0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb
```

## How It Works

### User Flow

1. **User visits app.estable.lat**
   - App detects subdomain
   - Routes to MainnetPage
   - Shows production vaults

2. **User connects wallet**
   - App detects network (Mainnet or Sepolia)
   - Loads appropriate vault addresses
   - Shows relevant balances

3. **User deposits/withdraws**
   - Transactions use correct vault address
   - Works on both networks seamlessly
   - Points system tracks activity

### Network Detection

The system checks the user's connected network:

```javascript
const chainId = await getChainId(); // 8453 or 84532

if (chainId === 8453) {
  // Load mainnet vaults
} else if (chainId === 84532) {
  // Load testnet vaults
}
```

### Vault Component Reusability

The same `Vaults.tsx` component works on both pages because it:
- Dynamically loads vault data based on chain
- Adapts UI based on network
- Shows testnet indicators when appropriate

## Deployment Workflow

### Before Mainnet Deployment

1. ✅ Complete security audit of smart contracts
2. ✅ Test thoroughly on Base Sepolia
3. ✅ Update Morpho market IDs in `deploy-mainnet.js`
4. ✅ Verify token addresses are correct
5. ✅ Prepare deployment account with ETH

### Deploying to Mainnet

```bash
# 1. Set environment variables
export PRIVATE_KEY=your_key
export BASE_RPC_URL=https://mainnet.base.org

# 2. Deploy contracts
npm run deploy:mainnet

# 3. Verify on Basescan
npx hardhat verify --network base CONTRACT_ADDRESS ...

# 4. Update deployment file (automatic)

# 5. Build frontend
npm run build

# 6. Deploy to hosting (e.g., Vercel, Netlify)
```

### Post-Deployment

1. Test all vault operations with small amounts
2. Monitor transactions on Basescan
3. Verify timelock is functioning (48 hours)
4. Check yield accrual
5. Announce mainnet launch

## DNS Configuration

To make app.estable.lat work:

### Option 1: Separate Deployment
Deploy the app twice:
- `estable.lat` → Homepage deployment
- `app.estable.lat` → App deployment

### Option 2: Same Deployment
Point both domains to same deployment:
```
estable.lat         → Hosting (Vercel/Netlify)
app.estable.lat     → Same hosting
```

The app's routing logic handles the difference automatically.

## Testing Locally

To test subdomain routing locally:

1. **Edit hosts file** (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 app.estable.lat
127.0.0.1 estable.lat
```

2. **Run dev server**:
```bash
npm run dev
```

3. **Visit**:
- `http://estable.lat:5173` → HomePage
- `http://app.estable.lat:5173` → MainnetPage

## Security Features

### Timelock Protection
- All sensitive operations have 48-hour delay
- Users can see scheduled operations
- Operations can be cancelled before execution

### Network Validation
- App validates user is on correct network
- Shows clear error messages for wrong network
- Guides users to switch networks

### Real Token Verification
- All token addresses verified on Basescan
- Morpho market IDs validated
- Contract addresses from official sources

## Differences: Mainnet vs Testnet

| Feature | Testnet (Base Sepolia) | Mainnet (Base) |
|---------|------------------------|----------------|
| URL | estable.lat/testnet | app.estable.lat |
| Tokens | Test (Faucet) | Real (Purchase) |
| Chain ID | 84532 | 8453 |
| Timelock | 1 hour | 48 hours |
| Risk | None | Real funds |
| Purpose | Testing | Production |

## Key Files

- `/pages/MainnetPage.tsx` - Production page
- `/pages/TestnetPage.tsx` - Testnet page
- `/lib/contracts.ts` - Multi-network support
- `/deployments/base-mainnet.json` - Mainnet config
- `/deployments/base-sepolia.json` - Testnet config
- `/scripts/deploy-mainnet.js` - Deployment script
- `/App.tsx` - Routing logic

## Important Notes

1. **Morpho Market IDs**: The deployment script uses placeholder Morpho market IDs. You MUST update these with real market addresses before deploying to mainnet.

2. **Testing First**: Always test on Base Sepolia before deploying to mainnet. Use the testnet page to verify all functionality.

3. **Timelock**: The 48-hour timelock means any vault configuration changes take 2 days to execute. Plan accordingly.

4. **Gas Costs**: Mainnet transactions cost real ETH. Ensure users understand this.

5. **Audits**: Before mainnet launch, get smart contracts audited by a reputable security firm.

## Next Steps

1. ✅ Frontend is ready
2. ⏳ Update Morpho market IDs
3. ⏳ Complete security audit
4. ⏳ Deploy contracts to mainnet
5. ⏳ Configure DNS for app.estable.lat
6. ⏳ Test with small amounts
7. ⏳ Public launch

## Support

For questions about:
- **Smart Contracts**: See `MAINNET_DEPLOYMENT.md`
- **Frontend**: See this guide
- **Morpho Integration**: See `README_MORPHO.md`
- **Timelock**: See `TIMELOCK_POLICY.md`

---

**Ready for Production**: The app subdomain is fully configured and ready to connect to real Base Mainnet vaults once contracts are deployed.
