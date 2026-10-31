import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plan, BillingFrequency, PlanStatus } from '../types';
import {
  Layers,
  Plus,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';

export const PlansView: React.FC = () => {
  const { plans, addPlan, updatePlan, deletePlan, role } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  const [price, setPrice] = useState<number>(5000);
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2027-12-31');
  const [autoClose, setAutoClose] = useState(false);
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setBillingFrequency('monthly');
    setPrice(4999);
    setMinQuantity(1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2027-12-31');
    setAutoClose(false);
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setBillingFrequency(plan.billingFrequency);
    setPrice(plan.price);
    setMinQuantity(plan.minQuantity);
    setStartDate(plan.startDate);
    setEndDate(plan.endDate || '');
    setAutoClose(plan.autoClose);
    setDescription(plan.description);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name,
        billingFrequency,
        price: Number(price),
        minQuantity: Number(minQuantity),
        startDate,
        endDate: endDate || undefined,
        autoClose,
        description,
      });
    } else {
      addPlan({
        name,
        billingFrequency,
        price: Number(price),
        minQuantity: Number(minQuantity),
        startDate,
        endDate: endDate || undefined,
        autoClose,
        status: 'active',
        description,
      });
    }
    setModalOpen(false);
  };

  const handleStatusChange = (id: string, status: PlanStatus) => {
    updatePlan(id, { status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Billing Plans & Cadences</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure daily, weekly, monthly and annual recurring plans with auto-close logic and minimum seat constraints.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((p) => {
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                p.status === 'paused'
                  ? 'border-amber-200 bg-amber-50/20'
                  : p.status === 'closed'
                  ? 'border-slate-200 opacity-60'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      p.billingFrequency === 'yearly'
                        ? 'bg-purple-50 text-purple-700'
                        : p.billingFrequency === 'monthly'
                        ? 'bg-indigo-50 text-indigo-700'
                        : p.billingFrequency === 'weekly'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    Billed {p.billingFrequency}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      p.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'paused'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{p.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">/{p.billingFrequency}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Min Seats / Qty: <strong className="text-slate-700">{p.minQuantity}</strong>
                  </div>
                </div>

                {/* Plan Metadata */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Valid Start:</span>
                    <span>{p.startDate}</span>
                  </div>
                  {p.endDate && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Valid Till:</span>
                      <span>{p.endDate}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Auto-Close on Expiry:</span>
                    <span
                      className={`font-semibold ${p.autoClose ? 'text-amber-600' : 'text-slate-600'}`}
                    >
                      {p.autoClose ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lifecycle Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  {p.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(p.id, 'paused')}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1"
                      title="Pause Plan"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </button>
                  ) : p.status === 'paused' ? (
                    <button
                      onClick={() => handleStatusChange(p.id, 'active')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1"
                      title="Resume Plan"
                    >
                      <Play className="w-3 h-3" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(p.id, 'active')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[11px] font-semibold flex items-center gap-1"
                      title="Renew / Re-open Plan"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Renew</span>
                    </button>
                  )}

                  {p.status !== 'closed' && (
                    <button
                      onClick={() => handleStatusChange(p.id, 'closed')}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-[11px] font-semibold transition-colors"
                      title="Early Close"
                    >
                      Early Close
                    </button>
                  )}
                </div>

                {role === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200/50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete plan "${p.name}"?`)) deletePlan(p.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingPlan ? 'Configure Plan' : 'Create Billing Plan'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise Monthly Suite"
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Frequency *
                  </label>
                  <select
                    value={billingFrequency}
                    onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Quantity / Seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={autoClose}
                      onChange={(e) => setAutoClose(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Auto-close on end date</span>
                  </label>
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
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Terms, tier limits or features included..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
