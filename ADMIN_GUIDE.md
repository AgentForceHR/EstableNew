# Admin Dashboard Guide

## Overview

The Admin Dashboard provides comprehensive tracking and analytics for all testnet activities. It helps you monitor user engagement, transaction volumes, and overall platform usage.

## Accessing the Dashboard

Navigate to `/admin` on your application:
- Production: `https://app.estable.lat/admin`
- Development: `http://localhost:5173/admin`

## Features

### 1. Overview Tab

The overview tab provides high-level metrics and insights:

**Key Metrics:**
- **Total Users**: Number of unique wallet addresses that have used the platform
- **Total Volume**: Combined value of all vault deposits in USD
- **Token Mints**: Number of test token mints (USDC, USDT, DAI)
- **Total Points**: Aggregate points earned by all users

**Activity Stats:**
- Active users in last 24 hours
- Active users in last 7 days

**Visualizations:**
- **User Growth Chart**: Shows new user signups over the last 30 days
- **Top Users by Volume**: Leaderboard of users with the highest deposit volumes

### 2. Users Tab

View all testnet users with detailed information:

**Columns:**
- **Wallet Address**: User's wallet address (shortened)
- **First Seen**: When the user first interacted with the platform
- **Last Activity**: Most recent activity timestamp
- **Actions**: Total number of actions taken
- **Referrer**: Who referred this user (if applicable)

### 3. Vault Transactions Tab

Track all vault deposits and withdrawals:

**Columns:**
- **Wallet**: User's wallet address
- **Vault**: Name of the vault (USDC, USDT, DAI)
- **Type**: Deposit or Withdraw
- **Amount**: Transaction amount
- **Asset**: Token used (USDC, USDT, DAI)
- **Time**: Transaction timestamp
- **Tx Hash**: Blockchain transaction hash

### 4. Token Mints Tab

Monitor test token distribution:

**Columns:**
- **Wallet**: User's wallet address
- **Token**: Token symbol (USDC, USDT, DAI)
- **Amount**: Tokens minted
- **Time**: Mint timestamp
- **Tx Hash**: Transaction hash

## Data Tracked

The system automatically tracks:

1. **User Activity**
   - First interaction
   - Last activity
   - Total actions count
   - Referrer information

2. **Token Mints**
   - All test token (USDC, USDT, DAI) mints
   - Amounts and timestamps
   - Transaction hashes

3. **Vault Transactions**
   - Deposits and withdrawals
   - Amounts and vault information
   - Transaction hashes
   - Referrer addresses (for deposits)

4. **Points System**
   - All point actions
   - User point totals
   - Point action history

5. **Social Sharing**
   - Platform shares (X, Facebook)
   - Action types (share, repost, like, copy)
   - Points earned

6. **Referrals**
   - Referrer-referred relationships
   - First transactions
   - Referred volume
   - Referrer rewards

## Database Tables

All data is stored in Supabase with the following tables:

- `testnet_users` - User profiles and activity
- `token_mints` - Test token mint history
- `vault_transactions` - Deposit and withdrawal records
- `user_points` - User point totals and levels
- `point_actions` - Individual point earning actions
- `social_shares` - Social media sharing activity
- `referrals` - Referral relationships and rewards
- `eth_faucet_claims` - ETH faucet usage

## SQL Queries

You can run custom queries in the Supabase dashboard:

### Get most active users
```sql
SELECT wallet_address, total_actions, last_activity_at
FROM testnet_users
ORDER BY total_actions DESC
LIMIT 20;
```

### Get total volume by vault
```sql
SELECT vault_name, COUNT(*) as tx_count,
       SUM(CAST(amount AS NUMERIC)) as total_volume
FROM vault_transactions
WHERE transaction_type = 'deposit'
GROUP BY vault_name;
```

### Get user journey for a specific wallet
```sql
SELECT
  'mint' as action, token_symbol as detail, minted_at as timestamp
FROM token_mints
WHERE wallet_address = '0x...'
UNION ALL
SELECT
  transaction_type as action, vault_name as detail, transacted_at as timestamp
FROM vault_transactions
WHERE wallet_address = '0x...'
ORDER BY timestamp DESC;
```

## Export Data

To export data from Supabase:

1. Go to your Supabase project dashboard
2. Navigate to the Table Editor
3. Select the table you want to export
4. Click on the "..." menu and select "Export as CSV"

## API Integration

The analytics functions are available in `lib/analytics.ts`:

```typescript
import {
  getAllTestnetUsers,
  getAllVaultTransactions,
  getAllTokenMints,
  getAnalyticsSummary,
  getUserActivityByDay,
  getTopUsersByVolume
} from './lib/analytics';
```

## Automatic Tracking

The system automatically tracks:

- **Token Mints**: When users mint test tokens via the faucet
- **Vault Transactions**: All deposits and withdrawals
- **Points**: All point-earning actions
- **Social Shares**: When users share on social media
- **User Activity**: Updates on every interaction

## Privacy & Security

- All RLS policies allow public read access for analytics
- No sensitive user data (emails, IPs) is exposed in the admin dashboard
- Wallet addresses are the primary identifier
- All data is specific to Base Sepolia testnet

## Monitoring Tips

1. **Watch User Growth**: Track the "User Growth" chart to see signup trends
2. **Monitor Volume**: Check total vault volume to gauge platform usage
3. **Identify Power Users**: Use the "Top Users by Volume" table
4. **Track Engagement**: Monitor active users (24h/7d) metrics
5. **Analyze Mints**: See which test tokens are most popular

## Troubleshooting

If data isn't appearing:
1. Check that Supabase environment variables are set correctly
2. Verify RLS policies allow read access
3. Check browser console for any errors
4. Ensure the database migration has been applied

## Support

For issues or questions about the admin dashboard, check:
- Database migration files in `supabase/migrations/`
- Analytics code in `lib/analytics.ts`
- Admin page code in `pages/AdminPage.tsx`
