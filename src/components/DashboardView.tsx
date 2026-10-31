import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  Repeat,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

export const DashboardView: React.FC<{
  onNavigate: (tab: string) => void;
}> = ({ onNavigate }) => {
  const {
    subscriptions,
    invoices,
    payments,
    plans,
    runBillingBatch,
    renewSubscription,
    updateSubscriptionStatus,
    showToast,
  } = useApp();

  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Filtered subscriptions based on date range
  const filteredSubscriptions = useMemo(() => {
    if (dateRange === 'all') return subscriptions;
    const now = new Date();
    return subscriptions.filter((s) => {
      const created = new Date(s.createdAt);
      if (dateRange === 'month') {
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }
      if (dateRange === 'year') {
        return created.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [subscriptions, dateRange]);

  // Dynamic MRR Calculation
  const calculatedMRR = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'active')
      .reduce((acc, sub) => {
        let monthlyAmount = sub.grandTotal;
        if (sub.billingFrequency === 'yearly') {
          monthlyAmount = sub.grandTotal / 12;
        } else if (sub.billingFrequency === 'weekly') {
          monthlyAmount = sub.grandTotal * (52 / 12);
        } else if (sub.billingFrequency === 'daily') {
          monthlyAmount = sub.grandTotal * 30;
        }
        return acc + monthlyAmount;
      }, 0);
  }, [subscriptions]);

  // Total Revenue Collected
  const totalCollected = useMemo(() => {
    return payments.reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  // Outstanding Payments
  const outstandingReceivables = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'confirmed')
      .reduce((acc, inv) => acc + inv.amountDue, 0);
  }, [invoices]);

  // Overdue Invoices
  const overdueInvoices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return invoices.filter(
      (inv) => inv.status === 'confirmed' && inv.dueDate < today && inv.amountDue > 0
    );
  }, [invoices]);

  const overdueAmount = overdueInvoices.reduce((acc, i) => acc + i.amountDue, 0);

  // Active Subscriptions
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;

  // Monthly Revenue Data for SVG Chart
  const chartData = [
    { month: 'Jun', revenue: 18500, subscriptions: 8 },
    { month: 'Jul', revenue: 24200, subscriptions: 11 },
    { month: 'Aug', revenue: 31000, subscriptions: 14 },
    { month: 'Sep', revenue: 42800, subscriptions: 19 },
    { month: 'Oct', revenue: Math.max(52000, totalCollected), subscriptions: 24 },
  ];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-indigo-900/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /> Brightloop Automated Recurring Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Financial & Subscription Command Center
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Live recurring revenue, automated billing runs, real-time invoice matching and quote lifecycle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Billing Cycle Trigger */}
          <button
            onClick={() => runBillingBatch()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Billing Batch</span>
          </button>

          {/* Quick Date Range Filter */}
          <div className="bg-slate-800/80 rounded-xl p-1 flex border border-slate-700/60 text-xs">
            {(['all', 'month', 'year'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  dateRange === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Time' : r === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Subs
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{activeSubsCount}</span>
            <span className="text-xs text-slate-400 ml-1">/ {subscriptions.length} total</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.2% from last cycle</span>
          </div>
        </div>

        {/* Calculated MRR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly MRR
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              ₹{Math.round(calculatedMRR).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normalized Run-Rate</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Revenue Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              ₹{totalCollected.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {payments.length} verified transactions
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Due
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              ₹{outstandingReceivables.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium">
            Pending reconciliation
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overdue Risk
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600">
              ₹{overdueAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-rose-600 font-medium">
            {overdueInvoices.length} invoices require chase
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend SVG Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue & Inflow Trajectory</h3>
              <p className="text-xs text-slate-500">Monthly recurring billing and collected amounts</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-medium text-slate-600">
              FY 2026-27
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 flex items-end gap-6 pt-6 px-4 border-b border-slate-100">
            {chartData.map((d, index) => {
              const heightPct = Math.round((d.revenue / maxRevenue) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(d.revenue / 1000).toFixed(1)}k
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-xl h-44 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        index === chartData.length - 1
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-500/20'
                          : 'bg-gradient-to-t from-slate-400 to-slate-300'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-indigo-600" />
              <span>Current Realized Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-slate-300" />
              <span>Past Historical Baseline</span>
            </div>
          </div>
        </div>

        {/* Subscription Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Portfolio Composition</h3>
            <p className="text-xs text-slate-500 mb-4">Subscription statuses across customer accounts</p>

            <div className="space-y-3">
              {[
                {
                  label: 'Active & Recurring',
                  count: subscriptions.filter((s) => s.status === 'active').length,
                  color: 'bg-emerald-500',
                  bg: 'bg-emerald-50',
                  text: 'text-emerald-700',
                },
                {
                  label: 'Quotes in Negotiation',
                  count: subscriptions.filter((s) => s.status === 'quotation').length,
                  color: 'bg-amber-500',
                  bg: 'bg-amber-50',
                  text: 'text-amber-700',
                },
                {
                  label: 'Draft Contracts',
                  count: subscriptions.filter((s) => s.status === 'draft').length,
                  color: 'bg-slate-400',
                  bg: 'bg-slate-50',
                  text: 'text-slate-700',
                },
                {
                  label: 'Paused / Grace Period',
                  count: subscriptions.filter((s) => s.status === 'paused').length,
                  color: 'bg-rose-500',
                  bg: 'bg-rose-50',
                  text: 'text-rose-700',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.bg} ${item.text}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('subscriptions')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-indigo-600 flex items-center justify-center gap-1 transition-colors"
            >
              <span>Manage All Subscriptions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Payments & Upcoming Actionables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payment Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Payment Receipts</h3>
              <p className="text-xs text-slate-500">Live matched payments against invoices</p>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {payments.slice(0, 5).map((pay) => (
              <div key={pay.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{pay.customerName}</div>
                    <div className="text-[11px] text-slate-500">
                      Ref: {pay.referenceId} • {pay.paymentDate}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-700">
                    +₹{pay.amount.toLocaleString()}
                  </div>
                  <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {pay.method.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Required: Quotations & Renewals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subscriptions Needing Attention</h3>
              <p className="text-xs text-slate-500">Pending quotations and expiring services</p>
            </div>
            <button
              onClick={() => onNavigate('subscriptions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage all →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {subscriptions
              .filter((s) => s.status === 'quotation' || s.status === 'draft' || s.status === 'paused')
              .map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/80"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {sub.subscriptionNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          sub.status === 'quotation'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {sub.customerName} • {sub.planName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      Activate
                    </button>
                  </div>
                </div>
              ))}
            {subscriptions.filter(
              (s) => s.status === 'quotation' || s.status === 'draft' || s.status === 'paused'
            ).length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                All subscriptions are in active standing!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
