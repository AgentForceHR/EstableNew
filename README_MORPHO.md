# Estable.app - Morpho Blue + Spark.fi Integration (Base Network)

## 🚀 Complete DeFi Yield Platform for LATAM

Estable.app is a comprehensive yield aggregation platform focused on **Morpho Blue** and **Spark.fi** vaults on **Base network**, targeting Latin American users seeking dollar-denominated yields to combat inflation.

### Key Features

✅ **3 Live Vaults** (November 2025)
- Spark.fi USDC Vault: 8-12% APY (Morpho Blue allocations)
- Steakhouse USDT Vault: 10-15% blended APY
- sDAI MetaMorpho: 3.5-10% APY (DSR + Morpho boosts)

✅ **Auto-Rebalancing**
- 40% Spark.fi USDC
- 30% Steakhouse USDT
- 30% sDAI MetaMorpho
- Weekly automated rebalancing via Morpho Blue

✅ **4 Revenue Streams**
- Performance fees: 15% (10% treasury, 5% referrers)
- Referral program: 5% lifetime commissions
- Deposit/withdrawal fees: 0.1-0.3% (after $500k TVL)
- MEV capture: 5-15% of arbitrage profits

✅ **Treasury Integration**
- All fees route to: `0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE`

---

## 📊 Revenue Projections

### At $10M TVL:
```
Performance fees:  $210k/year ($17.5k/month)
  - Treasury:      $140k (10%)
  - Referrers:     $70k (5%)

Transaction fees:  $36k/year ($3k/month)
MEV capture:       $24k/year ($2k/month)

TOTAL REVENUE:     $165k/year ($13.8k/month)
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)            │
│  - Vault dashboard                           │
│  - Deposit/withdraw interface                │
│  - Referral system                           │
│  - Revenue dashboard                         │
└─────────────────┬───────────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
┌──────▼─────────┐  ┌────────▼──────────────┐
│  Supabase DB   │  │  Smart Contracts      │
│  - Vaults      │  │  (Base Network)       │
│  - Deposits    │  │  - MorphoVault        │
│  - Referrals   │  │  - RebalanceManager   │
│  - Revenue     │  │                       │
└────────┬───────┘  └────────┬──────────────┘
         │                   │
    ┌────▼───────────────────▼────┐
    │   Supabase Edge Functions   │
    │  - get-vaults               │
    │  - record-deposit           │
    │  - create-referral-code     │
    │  - track-revenue            │
    │  - execute-rebalance        │
    └─────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Security libraries
- **Base Network** - L2 blockchain (lower fees)

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **ethers.js v6** - Web3 integration
- **TailwindCSS** - Styling

### Backend
- **Supabase** - Database & edge functions
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection

---

## 📁 Project Structure

```
estable.app/
├── contracts/
│   ├── MorphoVault.sol          # Main vault with fee structure
│   ├── RebalanceManager.sol     # Auto-rebalancing logic
│   ├── StableVault.sol          # Legacy vault (reference)
│   ├── VaultFactory.sol         # Legacy factory
│   └── README.md
├── scripts/
│   ├── deploy-morpho.js         # Base deployment script
│   ├── rebalance.js             # Rebalancing automation
│   └── deploy.js                # Legacy deployment
├── supabase/
│   ├── migrations/
│   │   ├── create_vaults_and_transactions_schema.sql
│   │   └── update_vaults_morpho_base_revenue.sql
│   └── functions/
│       ├── get-vaults/
│       ├── record-deposit/
│       ├── record-withdrawal/
│       ├── get-user-portfolio/
│       ├── create-referral-code/
│       ├── track-revenue/
│       └── execute-rebalance/
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── Vaults.tsx
│   ├── ProtocolDetails.tsx
│   ├── InflationComparison.tsx
│   ├── FAQ.tsx
│   ├── Footer.tsx
│   └── RevenueDashboard.tsx     # Revenue tracking UI
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── contracts.ts             # Web3 utilities
│   └── api.ts                   # API client
├── DEPLOYMENT.md                # Deployment guide
├── REVENUE_GUIDE.md             # Revenue implementation
└── README_MORPHO.md             # This file
```

---

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
PRIVATE_KEY=your_deployer_private_key
BASESCAN_API_KEY=your_basescan_key

# Optional: Rebalance automation
REBALANCE_MANAGER_ADDRESS=deployed_contract_address
```

### 3. Deploy Smart Contracts

```bash
# Deploy to Base mainnet
npm run deploy:base

# Or test on Base Sepolia
npm run deploy -- --network base-sepolia
```

### 4. Update Database

After deployment, update vault contract addresses:

```sql
UPDATE vaults
SET vault_contract_address = '0x...'
WHERE name = 'Spark USDC Vault';
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

---

## 💼 Smart Contract Deployment

### Deploy to Base

```bash
npm run deploy:base
```

This will:
1. Deploy RebalanceManager
2. Deploy 3 MorphoVaults (Spark USDC, Steakhouse USDT, sDAI)
3. Configure 40/30/30 allocation strategy
4. Set performance fees to 15%
5. Route fees to treasury: `0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE`
6. Save deployment addresses to `deployment-morpho.json`

### Verify Contracts

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## 🔄 Auto-Rebalancing

### Manual Rebalance

```bash
npm run rebalance
```

### Automated Rebalance (Cron)

Set up weekly rebalancing:

```bash
# Add to crontab (Sundays at 2 AM UTC)
0 2 * * 0 cd /path/to/estable.app && npm run rebalance
```

### Via Edge Function

```bash
curl -X POST https://your-project.supabase.co/functions/v1/execute-rebalance
```

Rebalances when:
- Weekly timer expires (7 days)
- Allocation drift > 5%
- Gas costs < expected profit

---

## 💰 Revenue Implementation

### Performance Fees (Day 1)

Hard-coded in `MorphoVault.sol`:
- 15% of all yield
- 10% to treasury
- 5% to referrers

```solidity
uint256 public performanceFeeBps = 1500; // 15%
```

### Referral System (Week 1)

1. **Create referral code:**
```typescript
const referral = await api.createReferralCode(walletAddress);
// Share: https://estable.app?ref=ABC123
```

2. **Track conversions:**
```typescript
await api.deposit(vaultId, vaultAddress, tokenAddress, amount, wallet, referrer);
```

3. **Earn commissions:**
5% of all yield generated by referred users, forever.

### Transaction Fees (Week 2)

Enable after $500k TVL:
```typescript
await morphoVault.enableDepositFee();
// Sets 0.1% deposit + 0.1% withdrawal fees
```

### MEV Capture (Month 2)

Deploy rate monitoring bot:
```bash
node scripts/mev-capture.js
```

Captures arbitrage opportunities during Morpho Blue rate changes.

---

## 📊 Database Schema

### Key Tables

1. **vaults** - Available yield vaults
2. **user_deposits** - All deposits with transaction hashes
3. **user_withdrawals** - All withdrawals
4. **user_balances** - Current user positions
5. **referrals** - Referral codes and commissions
6. **referral_conversions** - Referred users
7. **revenue_tracking** - All revenue by source
8. **rebalance_history** - Rebalancing events
9. **strategy_allocations** - Current vault allocations

### Query Examples

```sql
-- Total revenue (last 30 days)
SELECT
  revenue_type,
  SUM(amount) as total
FROM revenue_tracking
WHERE recorded_at > NOW() - INTERVAL '30 days'
GROUP BY revenue_type;

-- Top referrers
SELECT
  referral_code,
  total_referrals,
  total_commission_earned
FROM referrals
ORDER BY total_commission_earned DESC
LIMIT 10;

-- Vault performance
SELECT
  v.name,
  v.current_apy,
  v.total_value_locked,
  sa.current_allocation_bps / 100.0 as allocation_pct
FROM vaults v
JOIN strategy_allocations sa ON v.id = sa.vault_id
WHERE v.is_active = true;
```

---

## 🎯 Target Market: LATAM

### Why LATAM?

| Country | Inflation | Opportunity |
|---------|-----------|-------------|
| Argentina | 140% | Massive demand for dollar savings |
| Venezuela | 400% | Desperate for stable value |
| Chile | 5.5% | Growing crypto adoption |
| Mexico | 11% | Large remittance market |

### Distribution Strategy

1. **WhatsApp Groups**
   - Argentine crypto communities (50k+ members)
   - Chilean DeFi groups (30k+ members)
   - Mexican savings groups (40k+ members)

2. **Referral Program**
   - Group admins earn 5% commission
   - Viral sharing incentive
   - 5-10k referrals/month potential

3. **Social Media**
   - Spanish-language content
   - Inflation comparison graphics
   - Success stories from users

---

## 🔐 Security

### Smart Contracts
- ✅ ReentrancyGuard on all critical functions
- ✅ Pausable for emergencies
- ✅ Owner-only admin functions
- ✅ Fixed fee structure (no arbitrary changes)
- ⚠️ **Requires professional audit before mainnet**

### Database
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access own data
- ✅ Transaction hashes indexed
- ✅ Full audit trail

### Recommended Auditors
- OpenZeppelin
- Trail of Bits
- Consensys Diligence
- Certik

---

## 📈 Growth Roadmap

### Phase 1: Launch (Month 1)
- Deploy contracts to Base
- Launch 3 Morpho vaults
- Enable performance fees
- Onboard first 100 users

### Phase 2: Referrals (Month 2)
- Launch referral program
- Partner with 50+ group admins
- Target 5,000 users
- $2-5M TVL

### Phase 3: Scale (Month 3-6)
- Enable transaction fees
- Deploy MEV capture bot
- Reach 20,000 users
- $10-25M TVL

### Phase 4: Expand (Month 6+)
- Add more Morpho strategies
- Integrate with other protocols
- Launch mobile app
- $50M+ TVL target

---

## 🛟 Support

### Documentation
- **Smart Contracts:** See `contracts/README.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Revenue:** See `REVENUE_GUIDE.md`
- **Database:** Check Supabase migrations

### Monitoring
- **Revenue Dashboard:** https://estable.app/admin/revenue
- **Supabase Dashboard:** Monitor database and edge functions
- **Basescan:** Track on-chain transactions
- **Rebalance History:** Check database for execution logs

### Common Issues

**Q: Transaction fails with "insufficient balance"**
A: Ensure token approval before deposit. Check user's USDC/USDT balance.

**Q: Referral code not working**
A: Verify code exists in database and is active. Check URL parameter format.

**Q: Rebalance not executing**
A: Check TVL threshold met, allocation drift > 5%, and gas costs profitable.

**Q: Revenue not tracking**
A: Verify Edge Functions are deployed and have correct permissions.

---

## 📝 License

MIT License - See LICENSE file

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🎯 Next Steps

1. **Deploy to Base:** `npm run deploy:base`
2. **Update database:** Insert contract addresses
3. **Create referral codes:** Share with influencers
4. **Monitor revenue:** Check dashboard daily
5. **Scale TVL:** Target $10M in first 6 months

**Target Revenue:** $165k/year at $10M TVL 🚀

---

Built with ❤️ for LATAM by the Estable.app team
