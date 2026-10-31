import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiscountRule, DiscountType } from '../types';
import {
  Percent,
  Plus,
  Search,
  Tag,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  ShieldAlert,
} from 'lucide-react';

export const DiscountsView: React.FC = () => {
  const { discounts, products, addDiscount, updateDiscount, deleteDiscount, role } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountRule | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(5000);
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(50);
  const [applicableProductIds, setApplicableProductIds] = useState<string[]>([]);

  const openCreateModal = () => {
    setEditingDiscount(null);
    setCode('PROMO' + Math.floor(10 + Math.random() * 90));
    setName('');
    setType('percentage');
    setValue(15);
    setMinPurchaseAmount(5000);
    setMinQuantity(1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('2027-12-31');
    setUsageLimit(50);
    setApplicableProductIds([]);
    setModalOpen(true);
  };

  const openEditModal = (d: DiscountRule) => {
    setEditingDiscount(d);
    setCode(d.code);
    setName(d.name);
    setType(d.type);
    setValue(d.value);
    setMinPurchaseAmount(d.minPurchaseAmount || 0);
    setMinQuantity(d.minQuantity || 1);
    setStartDate(d.startDate);
    setExpiryDate(d.expiryDate);
    setUsageLimit(d.usageLimit);
    setApplicableProductIds(d.applicableProductIds || []);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingDiscount) {
      updateDiscount(editingDiscount.id, {
        code: code.toUpperCase().trim(),
        name,
        type,
        value: Number(value),
        minPurchaseAmount: Number(minPurchaseAmount),
        minQuantity: Number(minQuantity),
        startDate,
        expiryDate,
        usageLimit: Number(usageLimit),
        applicableProductIds,
      });
    } else {
      addDiscount({
        code: code.toUpperCase().trim(),
        name,
        type,
        value: Number(value),
        minPurchaseAmount: Number(minPurchaseAmount),
        minQuantity: Number(minQuantity),
        startDate,
        expiryDate,
        usageLimit: Number(usageLimit),
        applicableProductIds,
        active: true,
      });
    }
    setModalOpen(false);
  };

  const filtered = discounts.filter(
    (d) =>
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Discount Engine</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure rules for seat thresholds, promo codes, percentage or fixed rebates with automatic invoice application.
          </p>
        </div>

        {role === 'admin' ? (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Discount Rule</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Only administrators can create discount rules</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupon code or discount rule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((d) => {
          const isExpired = new Date(d.expiryDate) < new Date();
          const limitReached = d.timesUsed >= d.usageLimit;

          return (
            <div
              key={d.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                !d.active || isExpired || limitReached
                  ? 'border-slate-200 opacity-60'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    <span>{d.code}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      d.active && !isExpired && !limitReached
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isExpired
                      ? 'Expired'
                      : limitReached
                      ? 'Cap Reached'
                      : d.active
                      ? 'Active'
                      : 'Disabled'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>

                <div className="mt-3 text-2xl font-black text-slate-900">
                  {d.type === 'percentage' ? `${d.value}% OFF` : `₹${d.value.toLocaleString()} OFF`}
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Min Purchase:</span>
                    <strong>₹{d.minPurchaseAmount?.toLocaleString() || 0}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Min Seats / Qty:</span>
                    <strong>{d.minQuantity || 1}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Expiry Date:</span>
                    <span>{d.expiryDate}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Usage Tracker:</span>
                    <strong className="text-indigo-600">
                      {d.timesUsed} / {d.usageLimit} redeemed
                    </strong>
                  </div>
                </div>
              </div>

              {role === 'admin' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
                  <button
                    onClick={() => updateDiscount(d.id, { active: !d.active })}
                    className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
                  >
                    {d.active ? 'Disable Rule' : 'Enable Rule'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(d)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete rule "${d.code}"?`)) deleteDiscount(d.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Discount */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingDiscount ? 'Edit Discount Rule' : 'New Discount Rule'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ANNUAL10"
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rule Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Annual Rebate"
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Value *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Purchase (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Usage Limit (Times)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  Save Discount Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
