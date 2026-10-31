import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subscription, SubscriptionItem, SubscriptionStatus, BillingFrequency } from '../types';
import {
  Repeat,
  Plus,
  Search,
  FileCheck,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Trash2,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    customers,
    plans,
    products,
    addSubscription,
    updateSubscriptionStatus,
    renewSubscription,
    generateInvoiceForSubscription,
    role,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  // Form State
  const [isQuotation, setIsQuotation] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [planId, setPlanId] = useState(plans[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2027-10-31');
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [quotationValidityDays, setQuotationValidityDays] = useState(14);
  const [notes, setNotes] = useState('');

  // Line items state
  const [items, setItems] = useState<
    Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      taxRate: number;
    }>
  >([
    {
      productId: products[0]?.id || 'prod-1',
      variantId: products[0]?.variants[0]?.id,
      quantity: 1,
      taxRate: 18,
    },
  ]);

  const openCreateModal = (quoteMode = false) => {
    setIsQuotation(quoteMode);
    setCustomerId(customers[0]?.id || '');
    setPlanId(plans[0]?.id || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 1);
    setExpiryDate(exp.toISOString().split('T')[0]);
    setPaymentTerms('Net 15');
    setQuotationValidityDays(14);
    setNotes(quoteMode ? 'Quotation offer prepared for customer evaluation.' : '');

    if (products.length > 0) {
      setItems([
        {
          productId: products[0].id,
          variantId: products[0].variants[0]?.id,
          quantity: 1,
          taxRate: 18,
        },
      ]);
    }
    setModalOpen(true);
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([
        ...items,
        {
          productId: products[0].id,
          variantId: products[0].variants[0]?.id,
          quantity: 1,
          taxRate: 18,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value,
        variantId: prod?.variants[0]?.id,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setItems(updated);
  };

  // Pre-calculate line items
  const computedItems: SubscriptionItem[] = items.map((item, idx) => {
    const prod = products.find((p) => p.id === item.productId);
    const prodName = prod?.name || 'Selected Item';
    const variant = prod?.variants.find((v) => v.id === item.variantId);
    const extraPrice = variant?.extraPrice || 0;
    const unitPrice = (prod?.salesPrice || 0) + extraPrice;
    const baseTotal = unitPrice * item.quantity;

    return {
      id: 'sub-item-' + idx,
      productId: item.productId,
      productName: prodName,
      variantId: item.variantId,
      variantName: variant?.name,
      quantity: item.quantity,
      unitPrice,
      taxRate: item.taxRate,
      total: baseTotal,
    };
  });

  const subtotal = computedItems.reduce((acc, i) => acc + i.total, 0);
  const taxTotal = computedItems.reduce((acc, i) => acc + (i.total * i.taxRate) / 100, 0);
  const grandTotal = subtotal + taxTotal;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    const plan = plans.find((p) => p.id === planId);
    if (!cust || !plan) return;

    addSubscription({
      customerId: cust.id,
      customerName: cust.company ? `${cust.company} (${cust.name})` : cust.name,
      customerEmail: cust.email,
      planId: plan.id,
      planName: plan.name,
      billingFrequency: plan.billingFrequency,
      startDate,
      expiryDate,
      paymentTerms,
      status: isQuotation ? 'quotation' : 'active',
      items: computedItems,
      subtotal,
      taxTotal,
      discountTotal: 0,
      grandTotal,
      quotationValidityDays: isQuotation ? quotationValidityDays : undefined,
      quotationDate: isQuotation ? new Date().toISOString().split('T')[0] : undefined,
      autoRenew: true,
      notes,
    });

    setModalOpen(false);
  };

  const filtered = subscriptions.filter((s) => {
    const matchesSearch =
      s.subscriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.planName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subscriptions & Quotations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage contract lifecycles (Draft → Quote → Confirmed → Active → Closed), line items, taxes and recurring billing idempotency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
          >
            <FileCheck className="w-4 h-4 text-amber-600" />
            <span>Create Quotation</span>
          </button>
          <button
            onClick={() => openCreateModal(false)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sub #, customer, plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
          {(['all', 'active', 'quotation', 'paused', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan & Cadence</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((sub) => {
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setDetailModalOpen(true);
                        }}
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <span>{sub.subscriptionNumber}</span>
                      </button>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Terms: {sub.paymentTerms}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{sub.customerName}</div>
                      <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{sub.planName}</div>
                      <span className="inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {sub.billingFrequency}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{sub.expiryDate}</div>
                      {sub.lastBilledPeriod && (
                        <div className="text-[10px] text-emerald-600">
                          Billed: {sub.lastBilledPeriod}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        ₹{sub.grandTotal.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        (incl. ₹{sub.taxTotal.toFixed(0)} tax)
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          sub.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'quotation'
                            ? 'bg-amber-100 text-amber-800'
                            : sub.status === 'paused'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Generate Invoice button */}
                        {sub.status === 'active' && (
                          <button
                            onClick={() => generateInvoiceForSubscription(sub.id)}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1"
                            title="Generate Recurring Invoice (Idempotent)"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Bill</span>
                          </button>
                        )}

                        {/* Lifecycle transition buttons */}
                        {sub.status === 'quotation' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'confirmed')}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-xs"
                          >
                            Confirm Quote
                          </button>
                        )}

                        {sub.status === 'confirmed' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs"
                          >
                            Activate
                          </button>
                        )}

                        {sub.status === 'active' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'paused')}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            title="Pause Subscription"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {sub.status === 'paused' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            title="Resume Subscription"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => renewSubscription(sub.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Renew Period"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {sub.status !== 'closed' && (
                          <button
                            onClick={() => updateSubscriptionStatus(sub.id, 'closed')}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Close Subscription"
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

      {/* Subscription Detail / Quotation Viewer Modal */}
      {detailModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                  Brightloop Subscription Spec
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedSub.subscriptionNumber}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl mb-4">
              <div>
                <span className="text-slate-400 block">Customer:</span>
                <strong className="text-slate-800">{selectedSub.customerName}</strong>
                <div className="text-slate-500">{selectedSub.customerEmail}</div>
              </div>
              <div>
                <span className="text-slate-400 block">Plan:</span>
                <strong className="text-slate-800">{selectedSub.planName}</strong>
                <div className="text-slate-500 capitalize">{selectedSub.billingFrequency} renewal</div>
              </div>
              <div>
                <span className="text-slate-400 block">Start Date:</span>
                <span className="text-slate-800">{selectedSub.startDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Expiry Date:</span>
                <span className="text-slate-800">{selectedSub.expiryDate}</span>
              </div>
            </div>

            {/* Line items list */}
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Itemized Products</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Product / Variant</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSub.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-[10px] text-indigo-600">{item.variantName}</div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">{item.quantity}</td>
                      <td className="py-2 px-2 text-right">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-semibold">
                        ₹{item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial summary */}
            <div className="space-y-1.5 text-xs text-right pr-2">
              <div className="text-slate-500">
                Subtotal: <strong className="text-slate-800">₹{selectedSub.subtotal.toLocaleString()}</strong>
              </div>
              <div className="text-slate-500">
                GST / Tax (18%): <strong className="text-slate-800">₹{selectedSub.taxTotal.toLocaleString()}</strong>
              </div>
              <div className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                Grand Total: ₹{selectedSub.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700"
              >
                Close
              </button>
              {selectedSub.status === 'active' && (
                <button
                  onClick={() => {
                    generateInvoiceForSubscription(selectedSub.id);
                    setDetailModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                >
                  Generate Invoice Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription / Quotation Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {isQuotation ? 'Draft New Quotation Offer' : 'Create New Subscription'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company ? `${c.company} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Plan *
                  </label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price}/{p.billingFrequency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
              </div>

              {isQuotation && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <label className="block font-bold mb-1">Quotation Validity Period (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={quotationValidityDays}
                    onChange={(e) => setQuotationValidityDays(Number(e.target.value))}
                    className="w-32 px-3 py-1.5 text-xs border rounded-lg border-amber-300 bg-white"
                  />
                  <span className="ml-2 text-slate-600">
                    Quote expires automatically if not confirmed by customer.
                  </span>
                </div>
              )}

              {/* Dynamic Line items */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Subscription Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, i) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2 text-xs"
                      >
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(i, 'productId', e.target.value)}
                          className="flex-1 px-2 py-1.5 border rounded-lg border-slate-300 bg-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (₹{p.salesPrice})
                            </option>
                          ))}
                        </select>

                        {/* Variant selector */}
                        {prod && prod.variants && prod.variants.length > 0 && (
                          <select
                            value={item.variantId}
                            onChange={(e) => handleItemChange(i, 'variantId', e.target.value)}
                            className="px-2 py-1.5 border rounded-lg border-slate-300 bg-white"
                          >
                            {prod.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} (+₹{v.extraPrice})
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="flex items-center gap-1">
                          <label className="text-[11px] text-slate-400">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(i, 'quantity', Number(e.target.value))
                            }
                            className="w-14 px-2 py-1.5 border rounded-lg border-slate-300 bg-white text-center"
                          />
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(i)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Financial Totals */}
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Subtotal:</span>{' '}
                  <strong className="text-slate-800">₹{subtotal.toLocaleString()}</strong>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-slate-500">Tax:</span>{' '}
                  <strong className="text-slate-800">₹{taxTotal.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-600">Calculated Grand Total:</span>{' '}
                  <span className="text-base font-bold text-indigo-700">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Billing terms, customer requirements, SLA notes..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {isQuotation ? 'Save Quotation' : 'Confirm & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
