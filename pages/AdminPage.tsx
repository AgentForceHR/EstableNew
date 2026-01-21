import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  getAllTestnetUsers,
  getAllVaultTransactions,
  getAllTokenMints,
  getAnalyticsSummary,
  getUserActivityByDay,
  getTopUsersByVolume,
  type TestnetUser,
  type VaultTransaction,
  type TokenMint,
  type AnalyticsSummary,
} from '../lib/analytics';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'mints'>('overview');
  const [users, setUsers] = useState<TestnetUser[]>([]);
  const [transactions, setTransactions] = useState<VaultTransaction[]>([]);
  const [mints, setMints] = useState<TokenMint[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [activityData, setActivityData] = useState<Array<{ date: string; users: number }>>([]);
  const [topUsers, setTopUsers] = useState<Array<{ wallet_address: string; total_volume: string; transaction_count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, usersData, txData, mintsData, activityData, topUsersData] = await Promise.all([
        getAnalyticsSummary(),
        getAllTestnetUsers(),
        getAllVaultTransactions(),
        getAllTokenMints(),
        getUserActivityByDay(),
        getTopUsersByVolume(10),
      ]);

      setSummary(summaryData);
      setUsers(usersData);
      setTransactions(txData);
      setMints(mintsData);
      setActivityData(activityData);
      setTopUsers(topUsersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-theme-primary">
        <Header />
        <main className="flex-1 pt-20 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-accent-primary"></div>
              <p className="text-theme-secondary mt-4">Loading analytics...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-theme-primary">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary mb-2">Admin Dashboard</h1>
            <p className="text-theme-secondary">Testnet analytics and user tracking</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-accent-primary text-white'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-theme-light'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-accent-primary text-white'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-theme-light'
              }`}
            >
              Users ({summary?.totalUsers || 0})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-accent-primary text-white'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-theme-light'
              }`}
            >
              Vault Txs ({(summary?.totalDeposits || 0) + (summary?.totalWithdrawals || 0)})
            </button>
            <button
              onClick={() => setActiveTab('mints')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'mints'
                  ? 'bg-accent-primary text-white'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-theme-light'
              }`}
            >
              Token Mints ({summary?.totalMints || 0})
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && summary && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="app-card p-6">
                  <div className="text-theme-secondary text-sm mb-2">Total Users</div>
                  <div className="text-3xl font-bold text-theme-primary">{summary.totalUsers}</div>
                  <div className="text-xs text-theme-tertiary mt-2">
                    {summary.activeUsersLast24h} active (24h)
                  </div>
                </div>

                <div className="app-card p-6">
                  <div className="text-theme-secondary text-sm mb-2">Total Volume</div>
                  <div className="text-3xl font-bold text-accent-primary">${summary.totalVaultVolume}</div>
                  <div className="text-xs text-theme-tertiary mt-2">
                    {summary.totalDeposits} deposits
                  </div>
                </div>

                <div className="app-card p-6">
                  <div className="text-theme-secondary text-sm mb-2">Token Mints</div>
                  <div className="text-3xl font-bold text-theme-primary">{summary.totalMints}</div>
                  <div className="text-xs text-theme-tertiary mt-2">
                    Test tokens distributed
                  </div>
                </div>

                <div className="app-card p-6">
                  <div className="text-theme-secondary text-sm mb-2">Total Points</div>
                  <div className="text-3xl font-bold text-accent-primary">{summary.totalPoints.toLocaleString()}</div>
                  <div className="text-xs text-theme-tertiary mt-2">
                    Earned by users
                  </div>
                </div>
              </div>

              {/* Activity Chart */}
              <div className="app-card p-6">
                <h2 className="text-2xl font-bold text-theme-primary mb-4">User Growth (Last 30 Days)</h2>
                {activityData.length > 0 ? (
                  <div className="space-y-2">
                    {activityData.map((day) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <div className="text-sm text-theme-secondary w-24">{day.date}</div>
                        <div className="flex-1 bg-theme-secondary rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-accent-primary h-full flex items-center px-3 text-sm font-semibold text-white"
                            style={{ width: `${Math.max((day.users / Math.max(...activityData.map(d => d.users))) * 100, 10)}%` }}
                          >
                            {day.users}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-theme-secondary">No activity data available</p>
                )}
              </div>

              {/* Top Users */}
              <div className="app-card p-6">
                <h2 className="text-2xl font-bold text-theme-primary mb-4">Top Users by Volume</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-theme-light">
                      <tr>
                        <th className="text-left py-3 px-4 text-theme-secondary font-semibold">#</th>
                        <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Wallet</th>
                        <th className="text-right py-3 px-4 text-theme-secondary font-semibold">Volume</th>
                        <th className="text-right py-3 px-4 text-theme-secondary font-semibold">Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsers.map((user, index) => (
                        <tr key={user.wallet_address} className="border-b border-theme-light">
                          <td className="py-3 px-4 text-theme-primary">{index + 1}</td>
                          <td className="py-3 px-4 font-mono text-theme-primary">{formatAddress(user.wallet_address)}</td>
                          <td className="py-3 px-4 text-right font-semibold text-accent-primary">${user.total_volume}</td>
                          <td className="py-3 px-4 text-right text-theme-secondary">{user.transaction_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="app-card p-6">
              <h2 className="text-2xl font-bold text-theme-primary mb-4">All Testnet Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-theme-light">
                    <tr>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Wallet Address</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">First Seen</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Last Activity</th>
                      <th className="text-right py-3 px-4 text-theme-secondary font-semibold">Actions</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-theme-light">
                        <td className="py-3 px-4 font-mono text-theme-primary">{formatAddress(user.wallet_address)}</td>
                        <td className="py-3 px-4 text-theme-secondary text-sm">{formatDate(user.first_seen_at)}</td>
                        <td className="py-3 px-4 text-theme-secondary text-sm">{formatDate(user.last_activity_at)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-theme-primary">{user.total_actions}</td>
                        <td className="py-3 px-4 font-mono text-theme-secondary text-sm">
                          {user.referrer_address ? formatAddress(user.referrer_address) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="app-card p-6">
              <h2 className="text-2xl font-bold text-theme-primary mb-4">Recent Vault Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-theme-light">
                    <tr>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Wallet</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Vault</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Type</th>
                      <th className="text-right py-3 px-4 text-theme-secondary font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Asset</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Time</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-theme-light">
                        <td className="py-3 px-4 font-mono text-theme-primary">{formatAddress(tx.wallet_address)}</td>
                        <td className="py-3 px-4 text-theme-secondary">{tx.vault_name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            tx.transaction_type === 'deposit'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-theme-primary">
                          {parseFloat(tx.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-theme-secondary">{tx.asset_symbol}</td>
                        <td className="py-3 px-4 text-theme-secondary text-sm">{formatDate(tx.transacted_at)}</td>
                        <td className="py-3 px-4 font-mono text-theme-secondary text-sm">{formatAddress(tx.tx_hash)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mints Tab */}
          {activeTab === 'mints' && (
            <div className="app-card p-6">
              <h2 className="text-2xl font-bold text-theme-primary mb-4">Recent Token Mints</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-theme-light">
                    <tr>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Wallet</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Token</th>
                      <th className="text-right py-3 px-4 text-theme-secondary font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Time</th>
                      <th className="text-left py-3 px-4 text-theme-secondary font-semibold">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mints.map((mint) => (
                      <tr key={mint.id} className="border-b border-theme-light">
                        <td className="py-3 px-4 font-mono text-theme-primary">{formatAddress(mint.wallet_address)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded bg-accent-primary/20 text-accent-primary text-xs font-semibold">
                            {mint.token_symbol}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-theme-primary">
                          {(parseFloat(mint.amount) / Math.pow(10, mint.decimals)).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-theme-secondary text-sm">{formatDate(mint.minted_at)}</td>
                        <td className="py-3 px-4 font-mono text-theme-secondary text-sm">{formatAddress(mint.tx_hash)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
