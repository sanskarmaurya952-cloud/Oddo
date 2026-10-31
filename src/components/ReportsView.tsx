import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertCircle,
  FileText,
  CreditCard,
  PieChart,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { subscriptions, invoices, payments, customers, exportToCSV } = useApp();

  const [dateRange, setDateRange] = useState<'all' | '30days' | 'year'>('all');

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingTotal = invoices
    .filter((i) => i.status === 'confirmed')
    .reduce((acc, i) => acc + i.amountDue, 0);

  const today = new Date().toISOString().split('T')[0];
  const overdueTotal = invoices
    .filter((i) => i.status === 'confirmed' && i.dueDate < today && i.amountDue > 0)
    .reduce((acc, i) => acc + i.amountDue, 0);

  // Method breakdown
  const methodStats = {
    upi: payments.filter((p) => p.method === 'upi').reduce((a, b) => a + b.amount, 0),
    bank_transfer: payments
      .filter((p) => p.method === 'bank_transfer')
      .reduce((a, b) => a + b.amount, 0),
    card: payments.filter((p) => p.method === 'card').reduce((a, b) => a + b.amount, 0),
    cash: payments.filter((p) => p.method === 'cash').reduce((a, b) => a + b.amount, 0),
  };

  const handleExportInvoices = () => {
    const rows = invoices.map((i) => ({
      'Invoice Number': i.invoiceNumber,
      Customer: i.customerName,
      'Billing Period': i.billingPeriod,
      'Issue Date': i.issueDate,
      'Due Date': i.dueDate,
      Status: i.status,
      'Subtotal (INR)': i.subtotal,
      'Taxes (INR)': i.taxTotal,
      'Total Amount (INR)': i.totalAmount,
      'Amount Paid (INR)': i.amountPaid,
      'Balance Due (INR)': i.amountDue,
    }));
    exportToCSV('brightloop_invoices_report', rows);
  };

  const handleExportSubscriptions = () => {
    const rows = subscriptions.map((s) => ({
      'Subscription Number': s.subscriptionNumber,
      Customer: s.customerName,
      Plan: s.planName,
      Frequency: s.billingFrequency,
      'Start Date': s.startDate,
      'Expiry Date': s.expiryDate,
      Status: s.status,
      'Grand Total (INR)': s.grandTotal,
      'Last Billed Period': s.lastBilledPeriod || 'None',
    }));
    exportToCSV('brightloop_subscriptions_report', rows);
  };

  const handleExportPayments = () => {
    const rows = payments.map((p) => ({
      'Receipt Number': p.paymentNumber,
      'Invoice Ref': p.invoiceNumber,
      Customer: p.customerName,
      'Amount (INR)': p.amount,
      Method: p.method,
      'Reference ID': p.referenceId,
      Date: p.paymentDate,
    }));
    exportToCSV('brightloop_payments_report', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial & Executive Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconciled audit logs, revenue distributions, aging overdue accounts and instant CSV exports for accounting.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportInvoices}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Invoices CSV</span>
          </button>
          <button
            onClick={handleExportSubscriptions}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Subs CSV</span>
          </button>
          <button
            onClick={handleExportPayments}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Payments CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Realized Cash</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalCollected.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {payments.length} settled receipts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Receivables</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{outstandingTotal.toLocaleString()}
          </div>
          <div className="text-xs text-amber-600 font-semibold mt-1">Unpaid customer invoices</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Overdue Risk Exposure</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            ₹{overdueTotal.toLocaleString()}
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-1">Passed due dates</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Subscriber Accounts</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {subscriptions.filter((s) => s.status === 'active').length}
          </div>
          <div className="text-xs text-indigo-600 font-semibold mt-1">Active billing nodes</div>
        </div>
      </div>

      {/* Method Inflow Breakdown & Audit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Payment Channel Breakdown</h3>
            <span className="text-xs text-slate-400">All Reconciled</span>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'UPI (QR, Instant Apps)',
                val: methodStats.upi,
                color: 'bg-emerald-500',
              },
              {
                label: 'Bank Transfer (NEFT, IMPS, RTGS)',
                val: methodStats.bank_transfer,
                color: 'bg-indigo-500',
              },
              {
                label: 'Credit / Debit Cards',
                val: methodStats.card,
                color: 'bg-blue-500',
              },
              {
                label: 'Cash & Cheque Direct',
                val: methodStats.cash,
                color: 'bg-amber-500',
              },
            ].map((item) => {
              const pct = totalCollected > 0 ? Math.round((item.val / totalCollected) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">
                      ₹{item.val.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoicing Health Audit Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Billing Cycle Health Check</h3>
          <p className="text-xs text-slate-500 mb-4">Real-time status of Brightloop accounts</p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-900">Settled Invoices</div>
                <div className="text-[11px] text-emerald-700">Zero remaining balance</div>
              </div>
              <span className="text-base font-bold text-emerald-900">
                {invoices.filter((i) => i.status === 'paid').length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-900">Awaiting Settlement</div>
                <div className="text-[11px] text-amber-700">Within payment terms window</div>
              </div>
              <span className="text-base font-bold text-amber-900">
                {
                  invoices.filter(
                    (i) => i.status === 'confirmed' && i.dueDate >= today && i.amountDue > 0
                  ).length
                }
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-900">Critical Overdue</div>
                <div className="text-[11px] text-rose-700">Requires finance lead chasing</div>
              </div>
              <span className="text-base font-bold text-rose-900">
                {
                  invoices.filter(
                    (i) => i.status === 'confirmed' && i.dueDate < today && i.amountDue > 0
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
