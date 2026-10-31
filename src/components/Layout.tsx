import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  Repeat,
  FileText,
  CreditCard,
  Percent,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Bell,
  Search,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Role } from '../types';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, setCurrentTab, children }) => {
  const {
    role,
    setRole,
    currentCustomerId,
    setCurrentCustomerId,
    customers,
    invoices,
    resetToSampleData,
    toasts,
    removeToast,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Overdue count for notification badge
  const overdueCount = invoices.filter(
    (inv) => inv.status === 'confirmed' && new Date(inv.dueDate) < new Date()
  ).length;

  const currentCustomer = customers.find((c) => c.id === currentCustomerId) || customers[0];

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Variants', icon: Package },
    { id: 'plans', label: 'Plans & Cadence', icon: Layers },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'discounts', label: 'Discount Rules', icon: Percent },
    { id: 'reports', label: 'Reports & Revenue', icon: BarChart3 },
    { id: 'team', label: 'Team & Access', icon: ShieldCheck },
  ];

  const staffNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports & Revenue', icon: BarChart3 },
  ];

  const customerNavItems = [
    { id: 'portal-dashboard', label: 'My Subscriptions', icon: Repeat },
    { id: 'portal-invoices', label: 'My Invoices & Receipts', icon: FileText },
    { id: 'portal-profile', label: 'Company Profile', icon: UserCheck },
  ];

  const navItems =
    role === 'customer'
      ? customerNavItems
      : role === 'staff'
      ? staffNavItems
      : adminNavItems;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Toast Notifications container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl flex items-start justify-between border text-sm backdrop-blur-md transition-all duration-300 ${
              toast.type === 'error'
                ? 'bg-rose-900/90 border-rose-700 text-rose-100'
                : toast.type === 'info'
                ? 'bg-sky-900/90 border-sky-700 text-sky-100'
                : 'bg-emerald-950/90 border-emerald-700 text-emerald-100'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar Desktop */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0b1120] text-slate-300 transition-all duration-300 hidden md:flex flex-col border-r border-slate-800/80 sticky top-0 h-screen select-none z-30 shadow-2xl`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Brightloop
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
                  Subscription OS
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="px-3 py-2 border-b border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                role === 'admin'
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                  : role === 'staff'
                  ? 'bg-amber-400 shadow-sm shadow-amber-400'
                  : 'bg-indigo-400 shadow-sm shadow-indigo-400'
              }`}
            />
            {sidebarOpen && (
              <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                {role === 'customer'
                  ? 'Customer Portal'
                  : role === 'staff'
                  ? 'Staff View'
                  : 'Admin Console'}
              </span>
            )}
          </div>
          {sidebarOpen && role === 'customer' && (
            <p className="text-[11px] text-slate-400 truncate mt-1">
              Logged in as: {currentCustomer?.company || currentCustomer?.name}
            </p>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {sidebarOpen && (
            <button
              onClick={resetToSampleData}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors"
              title="Reset state to initial sample records"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset Demo Data</span>
            </button>
          )}
          {sidebarOpen && (
            <div className="px-2 py-1 text-[11px] text-slate-500 text-center">
              Brightloop MVP v1.0 • Odoo Match
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-md bg-white/90">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight capitalize">
                {currentTab.replace('-', ' ')}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Brightloop Software Subscription & Billing Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-sm"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    role === 'admin'
                      ? 'bg-emerald-500'
                      : role === 'staff'
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                />
                <span className="capitalize">{role} View</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Role-Based Access Switcher
                  </div>
                  <button
                    onClick={() => {
                      setRole('admin');
                      setShowRoleMenu(false);
                      if (currentTab.startsWith('portal-')) setCurrentTab('dashboard');
                    }}
                    className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${
                      role === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Administrator</div>
                      <div className="text-[11px] text-slate-400">Full CRUD, products, plans, discounts, staff</div>
                    </div>
                    {role === 'admin' && <span className="text-indigo-600">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setRole('staff');
                      setShowRoleMenu(false);
                      if (currentTab.startsWith('portal-')) setCurrentTab('dashboard');
                    }}
                    className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${
                      role === 'staff' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Internal Operations Staff</div>
                      <div className="text-[11px] text-slate-400">Operations, invoices, payments, quotes</div>
                    </div>
                    {role === 'staff' && <span className="text-indigo-600">✓</span>}
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Customer Portal (Self-Service)
                  </div>
                  {customers.slice(0, 2).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setRole('customer');
                        setCurrentCustomerId(c.id);
                        setCurrentTab('portal-dashboard');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${
                        role === 'customer' && currentCustomerId === c.id
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{c.company}</div>
                        <div className="text-[11px] text-slate-400">{c.name}</div>
                      </div>
                      {role === 'customer' && currentCustomerId === c.id && (
                        <span className="text-indigo-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {overdueCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">Billing Alerts</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      {overdueCount} Overdue
                    </span>
                  </div>
                  {overdueCount > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {invoices
                        .filter(
                          (inv) =>
                            inv.status === 'confirmed' && new Date(inv.dueDate) < new Date()
                        )
                        .map((inv) => (
                          <div
                            key={inv.id}
                            className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs"
                          >
                            <div className="flex justify-between font-semibold text-rose-900">
                              <span>{inv.invoiceNumber} Overdue</span>
                              <span>₹{inv.amountDue.toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-rose-700 mt-0.5">
                              {inv.customerName} • Due: {inv.dueDate}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      All subscriptions and invoices are in good standing!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow">
                {role === 'customer'
                  ? currentCustomer.name.slice(0, 2).toUpperCase()
                  : role === 'admin'
                  ? 'AD'
                  : 'ST'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {role === 'customer' ? currentCustomer.name : 'Sanskriti (Dev)'}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0b1120] text-slate-300 p-4 border-b border-slate-800 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
