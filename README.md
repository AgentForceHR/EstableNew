# Estable.app - Morpho Blue DeFi Yield Platform

Complete DeFi yield aggregation platform for LATAM users, featuring Morpho Blue and Spark.fi vaults on Base Network with integrated referral system and revenue tracking.

## 🚀 Key Features

### Live Vaults (November 2025)
- **Spark.fi USDC Vault**: 8-12% APY via Morpho Blue allocations
- **Steakhouse USDT Vault**: 10-15% blended APY
- **sDAI MetaMorpho**: 3.5-10% APY (DSR + Morpho boosts)

### Auto-Rebalancing
- 40% Spark.fi USDC
- 30% Steakhouse USDT
- 30% sDAI MetaMorpho
- Weekly automated rebalancing via Morpho Blue

### 4 Revenue Streams
1. **Performance Fees (15%)** - 10% treasury, 5% referrers - Live Day 1
2. **Referral Program (5%)** - Lifetime commissions - Live Week 1
3. **Transaction Fees (0.1-0.3%)** - After $500k TVL - Live Week 2
4. **MEV Capture (5-15%)** - Flash loan arbitrage - Live Month 2

### Treasury Integration
All fees route to: `0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE`

## 💰 Revenue Projections

At $10M TVL:
- Performance fees: $210k/year ($17.5k/month)
- Transaction fees: $36k/year ($3k/month)
- MEV capture: $24k/year ($2k/month)
- **Total: $165k/year ($13.8k/month)**

## 🏗️ Tech Stack

### Smart Contracts
- Solidity 0.8.20
- Hardhat development environment
- OpenZeppelin security libraries
- Base Network (L2)

### Frontend
- React 19 + TypeScript
- Vite build tool
- ethers.js v6 for Web3
- TailwindCSS

### Backend
- Supabase (PostgreSQL + Edge Functions)
- 9 database tables with RLS
- 7 deployed Edge Functions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Base Network
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=your_deployer_key
BASESCAN_API_KEY=your_api_key
```

### 3. Deploy Smart Contracts
```bash
npm run deploy:base
```

### 4. Update Database
After deployment, update vault addresses in Supabase.

### 5. Run Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

## 💼 Smart Contracts

### Deploy to Base
```bash
npm run deploy:base
```

### Manual Rebalance
```bash
npm run rebalance
```

## 🎯 Frontend Features

### ✅ Live Vault Integration
- Fetches real-time data from Supabase
- Displays APY ranges (min-max)
- Shows current TVL
- Base Network badge

### ✅ Wallet Connection
- MetaMask integration
- Deposit modal with validation
- Minimum $100 deposit enforcement
- Transaction tracking

### ✅ Referral System
- Generate unique referral codes
- URL parameter tracking (?ref=ABC123)
- Share on WhatsApp/Telegram
- Commission tracking dashboard

### ✅ Revenue Dashboard
- 4 revenue streams tracked
- 7d/30d/90d timeframes
- Projected monthly revenue
- Revenue breakdown charts

## 📊 Database Schema

### Key Tables
1. `vaults` - Vault configurations
2. `user_deposits` - Deposit history
3. `user_withdrawals` - Withdrawal history
4. `user_balances` - Current positions
5. `referrals` - Referral codes
6. `referral_conversions` - Referred users
7. `revenue_tracking` - All revenue
8. `rebalance_history` - Rebalance events
9. `strategy_allocations` - Vault allocations

## 🛟 Documentation

- **Deployment Guide**: `DEPLOYMENT.md`
- **Revenue Implementation**: `REVENUE_GUIDE.md`
- **Morpho Integration**: `README_MORPHO.md`
- **Smart Contracts**: `contracts/README.md`

## 🎯 Target Market

### LATAM Focus
- **Argentina**: 140% inflation
- **Venezuela**: 400% inflation
- **Chile**: Growing crypto adoption
- **Mexico**: Large remittance market

## 📄 License

MIT License

---

**Built for LATAM with ❤️**

Target: $165k/year revenue at $10M TVL 🚀
