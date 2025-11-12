# Estable.app - Revenue Implementation Guide

## Overview

Complete revenue monetization system for Estable.app with **4 revenue streams** that can generate $210k+/year at $10M TVL.

## Revenue Streams

### 1. Performance Fees (Day 1) 💰

**Amount:** 15% of yield (10% treasury, 5% referrers)
**Implementation:** Hard-coded in smart contracts
**Activation:** Live from deployment

#### Example Calculation
```
$10M TVL × 14% net APY = $1.4M/year yield
$1.4M × 15% fee = $210k/year revenue
  - $140k to treasury (10%)
  - $70k to referrers (5%)
```

#### Smart Contract
```solidity
// MorphoVault.sol
uint256 public performanceFeeBps = 1500; // 15%
uint256 public referralFeeBps = 500;     // 5%

function distributeYield(uint256 yieldAmount) {
    uint256 performanceFee = (yieldAmount * performanceFeeBps) / 10000;
    uint256 treasuryFee = (performanceFee * 10) / 15;     // 10%
    uint256 totalReferralFee = (performanceFee * 5) / 15; // 5%

    asset.transfer(treasury, treasuryFee);
    // Distribute referralFee to referrers
}
```

#### Database Tracking
```sql
INSERT INTO revenue_tracking (
  vault_id,
  revenue_type,
  amount,
  transaction_hash
) VALUES (
  'vault-uuid',
  'performance_fee',
  '1750.50',
  '0x...'
);
```

---

### 2. Referral Kickbacks (Week 1) 🤝

**Amount:** 5% of yield to referrers
**Implementation:** URL parameter + database tracking
**Activation:** Add `?ref=ABC123` to dApp URL

#### How It Works

1. **User creates referral code:**
```typescript
const referral = await api.createReferralCode(walletAddress);
// Returns: { referral_code: "ABC123", commission_rate_bps: 500 }
```

2. **Share referral link:**
```
https://estable.app?ref=ABC123
```

3. **Track conversions:**
```typescript
// On deposit
await api.deposit(vaultId, vaultAddress, tokenAddress, amount, wallet, referrer);
```

4. **Distribute commissions:**
```sql
-- Update referrer earnings
UPDATE referrals
SET total_commission_earned = total_commission_earned + 87.50
WHERE referral_code = 'ABC123';
```

#### Distribution Strategy

**Target:** Argentina/Chile WhatsApp/Telegram groups

| Channel | Reach | Expected Conversions |
|---------|-------|---------------------|
| Argentine Crypto Groups | 50k members | 2-5k referrals |
| Chilean FB Groups | 30k members | 1-3k referrals |
| Mexican Telegram | 40k members | 1.5-4k referrals |

**Incentive:** Referrers earn 5% of ALL yield their users generate, forever.

Example: User deposits $10k → generates $1,400/year → referrer earns $70/year passive income.

---

### 3. Deposit/Withdrawal Fees (Week 2) 💳

**Amount:** 0.1-0.3% flat fee
**Implementation:** Toggle after $500k TVL
**Activation:** Automatic via smart contract

#### Fee Structure
```solidity
// Initial state: 0% fees
uint256 public depositFeeBps = 0;
uint256 public withdrawalFeeBps = 0;

// After $500k TVL:
function enableDepositFee() external onlyOwner {
    require(totalAssets() >= 500_000e6, "TVL below threshold");
    depositFeeBps = 10;  // 0.1%
    withdrawalFeeBps = 10; // 0.1%
}
```

#### Revenue Calculation
```
10,000 transactions/month × $100 average × 0.2% = $2,000/month
Annual: $24,000
```

#### Progressive Activation

| TVL | Deposit Fee | Withdrawal Fee | Monthly Rev (10k tx) |
|-----|-------------|----------------|---------------------|
| $0-500k | 0% | 0% | $0 |
| $500k-2M | 0.1% | 0.1% | $2k |
| $2M-5M | 0.15% | 0.15% | $3k |
| $5M+ | 0.2% | 0.2% | $4k |

#### User Psychology
- Transparent: "Small 0.1% fee helps maintain the platform"
- Competitive: Lower than most CEX fees (0.5-1%)
- Justifiable: LATAM users understand platform sustainability

---

### 4. MEV/Flash Loan Capture (Month 2) ⚡

**Amount:** 5-15% of arbitrage profits
**Implementation:** KeeperDAO-style bot
**Activation:** Deploy after establishing TVL patterns

#### Opportunities

1. **Rate change arbitrage:**
   - Morpho Blue rate changes create temporary mispricing
   - Rebalance during volatile periods captures spread
   - Example: Spark jumps from 10% → 12%, rebalance captures 0.5% spread

2. **Flash loan arbitrage:**
   - Borrow from Aave/Uniswap
   - Deposit into highest-yield Morpho vault
   - Withdraw and repay in same transaction
   - Keep the spread (5-15%)

3. **Liquidation capture:**
   - Monitor Morpho Blue positions near liquidation
   - Execute liquidations with vault funds
   - Earn liquidation bonus (5-10%)

#### Implementation Script

```javascript
// scripts/mev-capture.js
async function monitorRateChanges() {
  const strategies = await rebalanceManager.getStrategies();

  for (let strategy of strategies) {
    const currentRate = await getStrategyRate(strategy);
    const optimalRate = findOptimalRate(strategies);

    if (currentRate < optimalRate - 0.005) { // 0.5% spread
      const profit = await executeArbitrage(strategy, optimalRate);
      await rebalanceManager.captureMev(profit);
    }
  }
}

// Run every 5 minutes
setInterval(monitorRateChanges, 5 * 60 * 1000);
```

#### Revenue Projection
```
$5M TVL × 2% annual arbitrage = $100k captured
Treasury keeps: $100k × 10% = $10k/year
Realistic after optimizations: $1-5k/month
```

---

## Auto-Rebalance Strategy

### Target Allocations
```javascript
const ALLOCATIONS = {
  'Spark USDC Vault': 4000,      // 40%
  'Steakhouse USDT Vault': 3000, // 30%
  'sDAI MetaMorpho': 3000        // 30%
};
```

### Weekly Rebalance Logic

**Trigger conditions:**
1. Weekly timer (every 7 days)
2. Allocation drift > 5% from target
3. Significant APY changes (>2% difference)

**Execution:**
```bash
# Automated cron job (runs Sundays at 2 AM UTC)
0 2 * * 0 cd /app && npm run rebalance

# Or via Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/execute-rebalance
```

**Gas optimization:**
- Batch all rebalances into single transaction
- Use Gelato Network for automated execution
- Only rebalance if profit > gas costs

### Rebalance History Tracking

```sql
-- View last 10 rebalances
SELECT
  executed_at,
  old_allocations,
  new_allocations,
  total_value_rebalanced,
  gas_cost
FROM rebalance_history
ORDER BY executed_at DESC
LIMIT 10;
```

---

## Revenue Dashboard

### Real-time Metrics

Access via: `https://estable.app/admin/revenue`

**Key metrics:**
- Total revenue (24h, 7d, 30d, 90d)
- Revenue by source (performance, referral, fees, MEV)
- Top referrers leaderboard
- TVL and APY trends
- Projected monthly/annual revenue

### API Endpoints

```typescript
// Get revenue stats
const stats = await api.getRevenueStats('30d');
// Returns:
{
  performance_fee: 12500.50,
  referral_fee: 3750.25,
  deposit_fee: 1200.00,
  withdrawal_fee: 800.00,
  mev_capture: 450.00,
  total: 18700.75
}

// Track revenue
await api.trackRevenue(
  vaultId,
  'performance_fee',
  '1750.50',
  txHash,
  userId,
  referralCode
);
```

---

## Referral Program Setup

### 1. Create Referral Code
```typescript
const { referral } = await api.createReferralCode(walletAddress);
console.log(`Your code: ${referral.referral_code}`);
console.log(`Share: https://estable.app?ref=${referral.referral_code}`);
```

### 2. Share Link
**Channels:**
- WhatsApp groups: 100+ Argentine crypto groups
- Telegram channels: Chilean DeFi communities
- Facebook groups: Mexican savings groups
- Twitter/X: LATAM crypto influencers

**Message template:**
```
🇦🇷 ¿Cansado de la inflación?

Genera hasta 18% APY en dólares con Estable.app 💰

✅ Seguro y auditado
✅ Retira cuando quieras
✅ Sin KYC

Empieza ahora: https://estable.app?ref=ABC123

Yo gano comisión por recomendarte, tú ganas rendimientos. ¡Win-win!
```

### 3. Track Performance
```sql
-- View your referral stats
SELECT
  r.referral_code,
  r.total_referrals,
  r.total_commission_earned,
  COUNT(rc.id) as active_users,
  SUM(rc.total_deposits) as total_tvl
FROM referrals r
LEFT JOIN referral_conversions rc ON r.referral_code = rc.referral_code
WHERE r.referrer_user_id = 'your-user-id'
GROUP BY r.id;
```

---

## Deployment Checklist

### Day 1 - Launch
- [x] Deploy smart contracts to Base
- [x] Configure performance fees (15%)
- [x] Set treasury address
- [x] Enable revenue tracking in database
- [x] Deploy Edge Functions
- [ ] Announce launch

### Week 1 - Referrals
- [ ] Create referral dashboard
- [ ] Generate 50+ influencer codes
- [ ] Post in 20+ WhatsApp groups
- [ ] Run FB/Instagram ads in Argentina/Chile
- [ ] Track first conversions

### Week 2 - Transaction Fees
- [ ] Monitor TVL growth
- [ ] Enable deposit/withdrawal fees at $500k
- [ ] Announce fee structure transparently
- [ ] Update documentation

### Month 2 - MEV
- [ ] Deploy rate monitoring bot
- [ ] Configure flash loan contracts
- [ ] Test arbitrage on testnet
- [ ] Enable MEV capture
- [ ] Track profitability

---

## Revenue Projections

### Conservative Scenario ($5M TVL)
```
Performance fees:  $105k/year ($8.7k/month)
Referral payments: -$52.5k/year (5% paid out)
Net performance:    $52.5k/year

Transaction fees:   $18k/year ($1.5k/month)
MEV capture:        $6k/year ($500/month)

TOTAL:              $76.5k/year ($6.4k/month)
```

### Target Scenario ($10M TVL)
```
Performance fees:  $210k/year ($17.5k/month)
Referral payments: -$105k/year (5% paid out)
Net performance:    $105k/year

Transaction fees:   $36k/year ($3k/month)
MEV capture:        $24k/year ($2k/month)

TOTAL:              $165k/year ($13.8k/month)
```

### Aggressive Scenario ($25M TVL)
```
Performance fees:  $525k/year ($43.8k/month)
Referral payments: -$262.5k/year (5% paid out)
Net performance:    $262.5k/year

Transaction fees:   $90k/year ($7.5k/month)
MEV capture:        $60k/year ($5k/month)

TOTAL:              $412.5k/year ($34.4k/month)
```

---

## Support & Monitoring

### Daily Tasks
- Check revenue dashboard for anomalies
- Monitor referral conversions
- Review transaction fees collected
- Track TVL growth

### Weekly Tasks
- Execute rebalance (automated)
- Analyze APY performance
- Reach out to top referrers
- Post updates in communities

### Monthly Tasks
- Generate revenue report
- Optimize fee structure
- Review MEV profitability
- Plan growth initiatives

---

## Questions?

**Smart Contracts:** See `contracts/MorphoVault.sol`
**Database:** See migration files in `supabase/migrations/`
**API:** See `lib/api.ts` and Edge Functions
**Dashboard:** See `components/RevenueDashboard.tsx`

For technical support, check the deployment logs and Supabase dashboard.
