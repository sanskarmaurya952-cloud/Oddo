import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StaffUser } from '../types';
import {
  ShieldCheck,
  Plus,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  UserCheck,
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const { staff, addStaff, deleteStaff, role, showToast } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'staff'>('staff');
  const [department, setDepartment] = useState('Billing Operations');
  const [password, setPassword] = useState('');

  // Password validation rules: >8 chars, 1 uppercase, 1 lowercase, 1 special character
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (!isPasswordValid) {
      showToast('Password does not satisfy Brightloop enterprise security policy', 'error');
      return;
    }

    addStaff({
      name,
      email,
      role: userRole,
      department,
      status: 'active',
    });

    setModalOpen(false);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    showToast(`[Simulated Auth Dispatch] Secure reset link dispatched to ${resetEmail}`, 'info');
    setResetModalOpen(false);
    setResetEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team & Access Control</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise RBAC policies. Only admins can invite staff and manage permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>Reset Password Link</span>
          </button>

          {role === 'admin' && (
            <button
              onClick={() => {
                setName('');
                setEmail('');
                setUserRole('staff');
                setDepartment('Billing Operations');
                setPassword('SecurePass123!');
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Role explanation banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Administrator Role</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Full governance across catalog products, billing plans, discounts, financials, reports and staff management.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Internal Staff Role</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Operational duties: onboarding customers, creating quotations, running billing runs and reconciling payments.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Customer Portal Role</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Strict isolation: customers only see their personal subscriptions, invoices and receipts.
          </p>
        </div>
      </div>

      {/* Staff Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                {role === 'admin' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{s.name}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{s.email}</td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">{s.department}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        s.role === 'admin'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {s.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  </td>

                  {role === 'admin' && (
                    <td className="py-3.5 px-4 text-right">
                      {s.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove staff access for ${s.name}?`)) deleteStaff(s.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">Invite New Staff Member</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sneha Patel"
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sneha@brightloop.io"
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as 'admin' | 'staff')}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  >
                    <option value="staff">Internal Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                  >
                    <option value="Billing Operations">Billing Operations</option>
                    <option value="Customer Success">Customer Success</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              {/* Password Requirement Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                />

                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                  <div className="font-semibold text-slate-600 mb-1">Enterprise Password Rules:</div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span>{hasMinLength ? '✓' : '○'}</span>
                    <span>More than 8 characters ({password.length} entered)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUppercase ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span>{hasUppercase ? '✓' : '○'}</span>
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasLowercase ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span>{hasLowercase ? '✓' : '○'}</span>
                    <span>At least one lowercase letter (a-z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasSpecialChar ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span>{hasSpecialChar ? '✓' : '○'}</span>
                    <span>At least one special character (!@#$%^&*...)</span>
                  </div>
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
                  disabled={!isPasswordValid}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">Request Password Reset Link</h3>
              <button
                onClick={() => setResetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Enter your registered corporate or customer email to receive a password recovery link.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
