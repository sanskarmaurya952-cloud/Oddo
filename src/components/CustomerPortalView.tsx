import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Repeat,
  FileText,
  CreditCard,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { PaymentMethod } from '../types';

export const CustomerPortalView: React.FC<{ tab: string }> = ({ tab }) => {
  const {
    customers,
    subscriptions,
    invoices,
    payments,
    currentCustomerId,
    setCurrentCustomerId,
    recordPayment,
  } = useApp();

  const currentCustomer =
    customers.find((c) => c.id === currentCustomerId) || customers[0];

  const mySubscriptions = subscriptions.filter((s) => s.customerId === currentCustomer.id);
  const myInvoices = invoices.filter((i) => i.customerId === currentCustomer.id);
  const myPayments = payments.filter((p) => p.customerId === currentCustomer.id);

  const [payModalInvoiceId, setPayModalInvoiceId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('upi');
  const [payRef, setPayRef] = useState('');

  const targetInvoice = invoices.find((i) => i.id === payModalInvoiceId);

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoice) return;
    recordPayment({
      invoiceId: targetInvoice.id,
      amount: targetInvoice.amountDue,
      method: payMethod,
      referenceId: payRef || `PORTAL-UPI-${Date.now().toString().slice(-6)}`,
      notes: 'Customer self-service portal checkout settlement',
    });
    setPayModalInvoiceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-900/40">
        <div>
          <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1">
            Self-Service Customer Portal
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{currentCustomer.company}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Welcome back, {currentCustomer.name}. Manage your subscribed plans, view invoices and pay balances.
          </p>
        </div>

        {/* Demo Switcher for testing different customers */}
        <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-xs">
          <label className="text-[10px] text-slate-400 block mb-1">Switch Demo Customer:</label>
          <select
            value={currentCustomerId}
            onChange={(e) => setCurrentCustomerId(e.target.value)}
            className="bg-slate-900 text-white px-2 py-1.5 rounded-lg border border-slate-600 text-xs focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} ({c.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscriptions Tab */}
      {(tab === 'portal-dashboard' || tab === 'portal-subscriptions') && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Your Active Subscriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mySubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-slate-900">{sub.planName}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      sub.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900">
                  ₹{sub.grandTotal.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal"> /{sub.billingFrequency}</span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subscription #:</span>
                    <strong>{sub.subscriptionNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valid Through:</span>
                    <span>{sub.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auto Renewal:</span>
                    <span className="text-emerald-600 font-semibold">Enabled</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="font-semibold text-slate-700 mb-1">Products Included:</div>
                  <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                    {sub.items.map((item) => (
                      <li key={item.id}>
                        {item.productName} ({item.quantity} seat{item.quantity > 1 ? 's' : ''})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {mySubscriptions.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs col-span-2">
                No active subscriptions for this account.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {(tab === 'portal-invoices' || tab === 'portal-dashboard') && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-slate-900">Your Invoices & Receipts</h3>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {myInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">{inv.billingPeriod}</td>
                    <td className="py-3.5 px-4">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 font-bold">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">
                      ₹{inv.amountDue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => {
                            setPayModalInvoiceId(inv.id);
                            setPayRef(`UPI-PORTAL-${Math.floor(100000 + Math.random() * 900000)}`);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs">✓ Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
                {myInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No invoices found for this account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Profile Tab */}
      {tab === 'portal-profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-xl">
          <h3 className="text-base font-bold text-slate-900 mb-4">Company Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Company Name:</span>
              <strong className="text-slate-800 text-sm">{currentCustomer.company}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Billing Contact:</span>
              <strong className="text-slate-800">{currentCustomer.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Registered Email:</span>
              <strong className="text-slate-800">{currentCustomer.email}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Phone:</span>
              <strong className="text-slate-800">{currentCustomer.phone}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Registered Address:</span>
              <p className="text-slate-700 mt-0.5">{currentCustomer.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instant Checkout Payment Modal */}
      {targetInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">Instant Invoice Payment</h3>
              <button
                onClick={() => setPayModalInvoiceId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayNow} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-500">Total Settlement Amount</div>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  ₹{targetInvoice.amountDue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Settling {targetInvoice.invoiceNumber} ({targetInvoice.billingPeriod})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                      payMethod === 'upi'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value="upi"
                      checked={payMethod === 'upi'}
                      onChange={() => setPayMethod('upi')}
                      className="hidden"
                    />
                    <span>UPI (Instant QR)</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                      payMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value="card"
                      checked={payMethod === 'card'}
                      onChange={() => setPayMethod('card')}
                      className="hidden"
                    />
                    <span>Credit / Debit Card</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalInvoiceId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                >
                  Pay ₹{targetInvoice.amountDue.toLocaleString()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
