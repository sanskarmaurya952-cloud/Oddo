import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceStatus, PaymentMethod } from '../types';
import {
  FileText,
  Search,
  DollarSign,
  Send,
  Printer,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CreditCard,
  X,
  Building,
} from 'lucide-react';

export const InvoicesView: React.FC<{
  onRecordPaymentForInvoice?: (invoiceId: string) => void;
}> = () => {
  const {
    invoices,
    updateInvoiceStatus,
    sendInvoice,
    runBillingBatch,
    recordPayment,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus | 'overdue'>('all');
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);

  // Quick Payment Modal for Invoice
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('upi');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const filtered = invoices.filter((inv) => {
    const isOverdue = inv.status === 'confirmed' && inv.dueDate < today && inv.amountDue > 0;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.billingPeriod.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') return isOverdue;
    return inv.status === statusFilter;
  });

  const handleOpenPayment = (inv: Invoice) => {
    setPayModalInvoice(inv);
    setPayAmount(inv.amountDue);
    setPayMethod('upi');
    setPayRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setPayNotes(`Settlement for ${inv.invoiceNumber}`);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice) return;
    recordPayment({
      invoiceId: payModalInvoice.id,
      amount: Number(payAmount),
      method: payMethod,
      referenceId: payRef,
      notes: payNotes,
    });
    setPayModalInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Invoices & Recurring Billing
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated recurring invoice generation, idempotent billing cycles, overdue monitoring and instant payment collection.
          </p>
        </div>

        <button
          onClick={() => runBillingBatch()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run Billing Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer, period..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
          {(['all', 'confirmed', 'paid', 'overdue', 'draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? st === 'overdue'
                    ? 'bg-rose-600 text-white'
                    : 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Subscription</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((inv) => {
                const isOverdue =
                  inv.status === 'confirmed' && inv.dueDate < today && inv.amountDue > 0;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <button
                        onClick={() => setPrintableInvoice(inv)}
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <span>{inv.invoiceNumber}</span>
                      </button>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Issued: {inv.issueDate}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400">
                        Sub: {inv.subscriptionNumber || 'Direct'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{inv.billingPeriod}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        Due: {inv.dueDate}
                      </div>
                      {isOverdue && (
                        <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 rounded">
                          OVERDUE
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      <span className={inv.amountDue > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                        ₹{inv.amountDue.toLocaleString()}
                      </span>
                      {inv.amountPaid > 0 && inv.amountDue > 0 && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Paid: ₹{inv.amountPaid.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1"
                            title="Collect / Record Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                        )}

                        <button
                          onClick={() => sendInvoice(inv.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Simulate Dispatch Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setPrintableInvoice(inv)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="View & Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {inv.status === 'confirmed' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'cancelled')}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Cancel Invoice"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Payment Received</h3>
                <p className="text-xs text-slate-500">
                  {payModalInvoice.invoiceNumber} • {payModalInvoice.customerName}
                </p>
              </div>
              <button
                onClick={() => setPayModalInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    max={payModalInvoice.amountDue}
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs border rounded-xl border-slate-200 font-bold text-slate-800"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Outstanding: ₹{payModalInvoice.amountDue.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setPayAmount(payModalInvoice.amountDue)}
                    className="text-indigo-600 hover:underline"
                  >
                    Pay Full Balance
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                >
                  <option value="upi">UPI (GPay / PhonePe / QR)</option>
                  <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction / Bank Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. HDFC-982312 or UPI Ref"
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Professional Invoice Slip Modal */}
      {printableInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  B
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Brightloop Software Inc.</h3>
                  <p className="text-[10px] text-slate-400">Subscription & SaaS Billing Unit</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setPrintableInvoice(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Top Details */}
            <div className="grid grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Billed To:
                </span>
                <strong className="text-slate-800 text-sm block">
                  {printableInvoice.customerName}
                </strong>
                <div className="text-slate-500">{printableInvoice.customerEmail}</div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Sub Ref: {printableInvoice.subscriptionNumber || 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-slate-900">
                  {printableInvoice.invoiceNumber}
                </div>
                <div className="text-slate-500">Period: {printableInvoice.billingPeriod}</div>
                <div className="text-slate-500">Issue Date: {printableInvoice.issueDate}</div>
                <div className="text-slate-800 font-bold">Due Date: {printableInvoice.dueDate}</div>
                <div className="mt-1">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      printableInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    STATUS: {printableInvoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden mb-6">
              <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right">Tax (GST)</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {printableInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2.5 px-2 text-center">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right">₹{item.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right">₹{item.taxAmount.toFixed(0)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculation Totals */}
            <div className="space-y-1 text-xs text-right border-t border-slate-200 pt-3">
              <div className="text-slate-500">
                Subtotal: <strong className="text-slate-800">₹{printableInvoice.subtotal.toLocaleString()}</strong>
              </div>
              <div className="text-slate-500">
                Taxes (18% GST): <strong className="text-slate-800">₹{printableInvoice.taxTotal.toLocaleString()}</strong>
              </div>
              {printableInvoice.discountTotal > 0 && (
                <div className="text-emerald-600 font-semibold">
                  Discounts Applied: -₹{printableInvoice.discountTotal.toLocaleString()}
                </div>
              )}
              <div className="text-base font-black text-slate-900 pt-1">
                Total Amount: ₹{printableInvoice.totalAmount.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-emerald-600">
                Amount Paid: ₹{printableInvoice.amountPaid.toLocaleString()}
              </div>
              <div className="text-sm font-bold text-amber-700">
                Balance Due: ₹{printableInvoice.amountDue.toLocaleString()}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              Brightloop Software Inc. • Thank you for your continued business. Electronic invoice
              valid without physical signature.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
