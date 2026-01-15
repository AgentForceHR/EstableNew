# Estable.lat Mainnet Deployment Guide

This guide covers deploying the Estable.lat vaults to Base Mainnet (app.estable.lat).

## Overview

The mainnet deployment consists of three production-ready vaults:

- **USDC Vault**: Optimized for USDC with Spark.fi strategy on Morpho Blue
- **USDT Vault**: Optimized for USDT with Steakhouse strategy on Morpho Blue
- **DAI Vault**: Optimized for DAI with sDAI strategy on Morpho Blue

All vaults include:
- 48-hour timelock for security
- Morpho Blue integration for optimized yields
- Multi-strategy rebalancing capabilities
- ERC-4626 compliant vault standard

## Prerequisites

1. **Environment Variables** (add to `.env`):
```bash
PRIVATE_KEY=your_deployer_private_key
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

2. **Sufficient ETH on Base Mainnet** for deployment gas fees

3. **Verified Morpho Market IDs**: Before deployment, update the market IDs in `scripts/deploy-mainnet.js` with real Morpho Blue market addresses

## Deployment Steps

### 1. Update Morpho Market Addresses

Edit `scripts/deploy-mainnet.js` and replace placeholder addresses with real Morpho Blue market IDs:

```javascript
const MORPHO_MARKETS = {
  sparkUSDC: "0x...", // Real Spark.fi USDC market on Morpho
  steakhouseUSDT: "0x...", // Real Steakhouse USDT market on Morpho
  sDAI: "0x..." // Real sDAI market on Morpho
};
```

### 2. Run Deployment

```bash
npm run deploy:mainnet
```

This will:
- Deploy three vault contracts with 48-hour timelock
- Configure each vault with appropriate Morpho markets
- Save deployment info to `deployments/base-mainnet.json`
- Output all contract addresses

### 3. Verify Contracts on Basescan

```bash
npx hardhat verify --network base CONTRACT_ADDRESS "constructor" "args"
```

### 4. Configure Frontend

The frontend automatically detects Base Mainnet (Chain ID 8453) and loads mainnet vault addresses from `deployments/base-mainnet.json`.

### 5. Test Vaults

Before public launch:
1. Deposit small amounts to each vault
2. Verify deposits are reflected correctly
3. Test withdrawal functionality
4. Confirm yield accrual
5. Test timelock operations

## Security Considerations

### Timelock Protection

All sensitive operations have a 48-hour delay:
- Market changes
- Strategy updates
- Fee modifications
- Emergency withdrawals

This gives users time to react to any suspicious changes.

### Access Control

- Only the vault owner can schedule timelock operations
- All timelock operations are publicly visible on-chain
- Operations can be cancelled before execution

### Auditing

Before mainnet launch:
1. Complete smart contract audit
2. Verify all Morpho market addresses
3. Test on Base Sepolia testnet first
4. Run security analysis tools (Slither, Mythril)
5. Review all access controls

## Monitoring

After deployment, monitor:

1. **Vault Performance**
   - Total assets deposited
   - Yield generation rate
   - Rebalancing operations

2. **Timelock Operations**
   - Scheduled operations
   - Execution status
   - Cancellation events

3. **User Activity**
   - Deposits and withdrawals
   - Share price changes
   - Gas costs

## Emergency Procedures

### Pause Deposits

If issues are detected:
```javascript
// Schedule pause (48-hour delay)
await vault.scheduleAction(PAUSE_ACTION_ID, pauseCalldata);

// After delay, execute
await vault.executeAction(PAUSE_ACTION_ID);
```

### Migrate Funds

If necessary to migrate to new vaults:
1. Schedule migration action (48-hour delay)
2. Notify users via all channels
3. Execute migration after delay
4. Verify all funds transferred

## Mainnet vs Testnet Differences

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| Network | Base Sepolia | Base Mainnet |
| Chain ID | 84532 | 8453 |
| Tokens | Test tokens (faucet) | Real USDC/USDT/DAI |
| Timelock | 1 hour | 48 hours |
| Domain | estable.lat/testnet | app.estable.lat |

## Support

For deployment issues:
- Check contract verification on Basescan
- Review deployment logs
- Test on Base Sepolia first
- Consult Morpho Blue documentation

## Useful Resources

- [Base Network Docs](https://docs.base.org)
- [Morpho Blue Docs](https://docs.morpho.org)
- [ERC-4626 Standard](https://eips.ethereum.org/EIPS/eip-4626)
- [Basescan](https://basescan.org)

## Post-Deployment Checklist

- [ ] All contracts deployed successfully
- [ ] Contracts verified on Basescan
- [ ] Timelock delay confirmed (48 hours)
- [ ] Morpho market integrations working
- [ ] Frontend connects to correct addresses
- [ ] Test deposits and withdrawals
- [ ] Monitor first 24 hours closely
- [ ] Set up alerts for unusual activity
- [ ] Document all contract addresses
- [ ] Notify users of mainnet launch
