import React, { useEffect, useState } from 'react';
import { api, RevenueStats } from '../lib/api';

const RevenueDashboard: React.FC = () => {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timeframe]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getRevenueStats(timeframe);
      setStats(data);
    } catch (error) {
      console.error('Failed to load revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const projectedMonthly = (amount: number) => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return (amount / days) * 30;
  };

  if (loading) {
    return (
      <div className="bg-brand-card p-8 rounded-xl border border-brand-gray/20">
        <div className="animate-pulse">
          <div className="h-8 bg-brand-gray/20 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-brand-gray/20 rounded"></div>
            <div className="h-24 bg-brand-gray/20 rounded"></div>
            <div className="h-24 bg-brand-gray/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-brand-card p-8 rounded-xl border border-brand-gray/20">
        <p className="text-brand-gray">No revenue data available</p>
      </div>
    );
  }

  const revenueItems = [
    {
      title: 'Performance Fees',
      amount: stats.performance_fee,
      color: 'text-brand-green',
      description: '10% to treasury, 5% to referrers',
      icon: '📈',
    },
    {
      title: 'Referral Fees',
      amount: stats.referral_fee,
      color: 'text-blue-400',
      description: '5% yield kickback to partners',
      icon: '🤝',
    },
    {
      title: 'Deposit/Withdrawal Fees',
      amount: stats.deposit_fee + stats.withdrawal_fee,
      color: 'text-yellow-400',
      description: '0.1-0.3% flat fee',
      icon: '💳',
    },
    {
      title: 'MEV Capture',
      amount: stats.mev_capture,
      color: 'text-purple-400',
      description: 'Flash loan arbitrage',
      icon: '⚡',
    },
  ];

  return (
    <section className="py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Revenue Dashboard</h2>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-brand-green text-brand-dark'
                    : 'bg-brand-card text-brand-gray hover:text-brand-light'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-brand-card p-8 rounded-xl border border-brand-gray/20 mb-8">
          <div className="text-center">
            <p className="text-brand-gray text-sm mb-2">Total Revenue ({timeframe})</p>
            <p className="text-5xl font-bold text-brand-green mb-2">
              {formatCurrency(stats.total)}
            </p>
            <p className="text-brand-gray text-sm">
              Projected Monthly: {formatCurrency(projectedMonthly(stats.total))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {revenueItems.map((item, index) => (
            <div
              key={index}
              className="bg-brand-card p-6 rounded-xl border border-brand-gray/20 hover:border-brand-green/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{item.icon}</span>
                <span className={`text-2xl font-bold ${item.color}`}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-brand-gray text-sm">{item.description}</p>
              <div className="mt-3 pt-3 border-t border-brand-gray/20">
                <p className="text-xs text-brand-gray">
                  Monthly: {formatCurrency(projectedMonthly(item.amount))}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-card p-8 rounded-xl border border-brand-gray/20">
          <h3 className="text-xl font-bold mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            {revenueItems.map((item, index) => {
              const percentage = stats.total > 0 ? (item.amount / stats.total) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">
                      {item.icon} {item.title}
                    </span>
                    <span className="text-sm text-brand-gray">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-brand-dark rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${
                        index === 0
                          ? 'bg-brand-green'
                          : index === 1
                          ? 'bg-blue-400'
                          : index === 2
                          ? 'bg-yellow-400'
                          : 'bg-purple-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-green/10 border border-brand-green/20 p-6 rounded-xl">
            <h4 className="font-semibold text-brand-green mb-2">💡 Revenue Optimization Tips</h4>
            <ul className="space-y-2 text-sm text-brand-gray">
              <li>• Share referral links in LATAM crypto groups</li>
              <li>• Enable deposit/withdrawal fees after $500k TVL</li>
              <li>• Set up MEV capture bot for rate change arbitrage</li>
              <li>• Track performance fees daily for accurate projections</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl">
            <h4 className="font-semibold text-blue-400 mb-2">📊 Projected Annual ($10M TVL)</h4>
            <ul className="space-y-2 text-sm text-brand-gray">
              <li>• Performance fees: $210k/year</li>
              <li>• Referral network: $105k/year (5% to partners)</li>
              <li>• Transaction fees: $36k/year</li>
              <li>• MEV capture: $12-60k/year</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevenueDashboard;
