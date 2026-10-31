import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Plan,
  Customer,
  Subscription,
  Invoice,
  Payment,
  DiscountRule,
  StaffUser,
  Role,
  PaymentMethod,
} from '../types';
import {
  initialProducts,
  initialPlans,
  initialCustomers,
  initialSubscriptions,
  initialInvoices,
  initialPayments,
  initialDiscounts,
  initialStaff,
} from '../mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentCustomerId: string;
  setCurrentCustomerId: (id: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Data
  products: Product[];
  plans: Plan[];
  customers: Customer[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  discounts: DiscountRule[];
  staff: StaffUser[];

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Plan Actions
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Subscription Actions
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'subscriptionNumber'>) => Subscription;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  updateSubscriptionStatus: (id: string, status: Subscription['status']) => void;
  renewSubscription: (id: string) => void;
  generateInvoiceForSubscription: (subscriptionId: string, billingPeriodOverride?: string) => { success: boolean; message: string; invoice?: Invoice };

  // Invoice Actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  sendInvoice: (id: string) => void;
  runBillingBatch: () => { count: number; message: string };

  // Payment Actions
  recordPayment: (payment: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    referenceId: string;
    notes?: string;
    paymentDate?: string;
  }) => { success: boolean; message: string };

  // Discount Actions
  addDiscount: (discount: Omit<DiscountRule, 'id' | 'timesUsed'>) => void;
  updateDiscount: (id: string, updates: Partial<DiscountRule>) => void;
  deleteDiscount: (id: string) => void;

  // Staff Actions
  addStaff: (staff: Omit<StaffUser, 'id' | 'createdAt'>) => void;
  deleteStaff: (id: string) => void;

  // Utilities
  resetToSampleData: () => void;
  exportToCSV: (filename: string, rows: Record<string, any>[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'brightloop_subsys_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('admin');
  const [currentCustomerId, setCurrentCustomerId] = useState<string>('cust-1');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persistent States
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'plans');
    return saved ? JSON.parse(saved) : initialPlans;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'subscriptions');
    return saved ? JSON.parse(saved) : initialSubscriptions;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [discounts, setDiscounts] = useState<DiscountRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'discounts');
    return saved ? JSON.parse(saved) : initialDiscounts;
  });

  const [staff, setStaff] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'discounts', JSON.stringify(discounts));
  }, [discounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'staff', JSON.stringify(staff));
  }, [staff]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Products
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${product.name}" created successfully`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Product updated');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted', 'info');
  };

  // Plans
  const addPlan = (plan: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      ...plan,
      id: 'plan-' + Date.now(),
    };
    setPlans((prev) => [newPlan, ...prev]);
    showToast(`Plan "${plan.name}" created`);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Plan configuration saved');
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    showToast('Plan deleted', 'info');
  };

  // Customers
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      ...customer,
      id: 'cust-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast(`Customer "${customer.name}" onboarded`);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Customer profile updated');
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('Customer record removed', 'info');
  };

  // Subscriptions
  const addSubscription = (subData: Omit<Subscription, 'id' | 'createdAt' | 'subscriptionNumber'>) => {
    const count = subscriptions.length + 1;
    const subNumber = `SUB-2026-${count.toString().padStart(3, '0')}`;
    const newSub: Subscription = {
      ...subData,
      id: 'sub-' + Date.now(),
      subscriptionNumber: subNumber,
      createdAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    showToast(`Subscription ${subNumber} created`);
    return newSub;
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Subscription updated');
  };

  const updateSubscriptionStatus = (id: string, status: Subscription['status']) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    showToast(`Subscription status changed to ${status.toUpperCase()}`);
  };

  const renewSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const currentExp = new Date(s.expiryDate);
        let nextExp = new Date(currentExp);
        if (s.billingFrequency === 'yearly') {
          nextExp.setFullYear(nextExp.getFullYear() + 1);
        } else if (s.billingFrequency === 'weekly') {
          nextExp.setDate(nextExp.getDate() + 7);
        } else if (s.billingFrequency === 'daily') {
          nextExp.setDate(nextExp.getDate() + 1);
        } else {
          nextExp.setMonth(nextExp.getMonth() + 1);
        }
        return {
          ...s,
          status: 'active',
          expiryDate: nextExp.toISOString().split('T')[0],
        };
      })
    );
    showToast('Subscription renewed successfully');
  };

  // Generate Invoice for Subscription (Idempotent!)
  const generateInvoiceForSubscription = (subscriptionId: string, billingPeriodOverride?: string) => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) {
      showToast('Subscription not found', 'error');
      return { success: false, message: 'Subscription not found' };
    }

    const currentPeriod =
      billingPeriodOverride ||
      new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

    // Check if an active invoice for this subscription and period already exists
    const existing = invoices.find(
      (inv) =>
        inv.subscriptionId === sub.id &&
        inv.billingPeriod === currentPeriod &&
        inv.status !== 'cancelled'
    );

    if (existing) {
      showToast(
        `Duplicate prevented: Invoice ${existing.invoiceNumber} already exists for ${currentPeriod}`,
        'error'
      );
      return {
        success: false,
        message: `Invoice ${existing.invoiceNumber} already issued for this billing period (${currentPeriod}).`,
        invoice: existing,
      };
    }

    const invCount = invoices.length + 1;
    const invNumber = `INV-2026-${invCount.toString().padStart(3, '0')}`;
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15); // Net 15 default

    const invoiceItems = sub.items.map((item) => {
      const taxAmt = (item.total * (item.taxRate || 18)) / 100;
      return {
        id: 'inv-item-' + Math.random().toString(36).substr(2, 6),
        productId: item.productId,
        description: `${item.productName}${item.variantName ? ` (${item.variantName})` : ''} x ${item.quantity}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 18,
        taxAmount: taxAmt,
        total: item.total + taxAmt,
      };
    });

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invNumber,
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      billingPeriod: currentPeriod,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'confirmed',
      items: invoiceItems,
      subtotal: sub.subtotal,
      taxTotal: sub.taxTotal,
      discountTotal: sub.discountTotal || 0,
      totalAmount: sub.grandTotal,
      amountPaid: 0,
      amountDue: sub.grandTotal,
      notes: `Recurring billing for ${sub.planName} (${currentPeriod})`,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update subscription lastBilledPeriod
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, lastBilledPeriod: currentPeriod } : s))
    );

    showToast(`Generated Invoice ${invNumber} for ${sub.customerName}`);
    return { success: true, message: `Generated invoice ${invNumber}`, invoice: newInvoice };
  };

  // Bulk Billing Batch
  const runBillingBatch = () => {
    const currentPeriod = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    let createdCount = 0;

    const activeSubs = subscriptions.filter(
      (s) => s.status === 'active' && s.lastBilledPeriod !== currentPeriod
    );

    if (activeSubs.length === 0) {
      showToast('All active subscriptions have already been billed for this period.', 'info');
      return { count: 0, message: 'All active subscriptions already up to date.' };
    }

    activeSubs.forEach((sub) => {
      const res = generateInvoiceForSubscription(sub.id, currentPeriod);
      if (res.success) createdCount++;
    });

    showToast(`Bulk billing complete: ${createdCount} invoices generated for ${currentPeriod}`);
    return { count: createdCount, message: `Successfully generated ${createdCount} invoices.` };
  };

  // Invoices
  const addInvoice = (invData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => {
    const count = invoices.length + 1;
    const invNumber = `INV-2026-${count.toString().padStart(3, '0')}`;
    const newInvoice: Invoice = {
      ...invData,
      id: 'inv-' + Date.now(),
      invoiceNumber: invNumber,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(`Invoice ${invNumber} generated`);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        if (status === 'paid') {
          return {
            ...inv,
            status,
            amountPaid: inv.totalAmount,
            amountDue: 0,
          };
        }
        return { ...inv, status };
      })
    );
    showToast(`Invoice updated to ${status.toUpperCase()}`);
  };

  const sendInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      showToast(
        `[Simulated Dispatch] Invoice ${inv.invoiceNumber} sent via email to ${inv.customerEmail}`
      );
    }
  };

  // Payments
  const recordPayment = (p: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    referenceId: string;
    notes?: string;
    paymentDate?: string;
  }) => {
    const targetInvoice = invoices.find((i) => i.id === p.invoiceId);
    if (!targetInvoice) {
      showToast('Invoice not found', 'error');
      return { success: false, message: 'Invoice not found' };
    }

    if (p.amount <= 0) {
      showToast('Payment amount must be greater than zero', 'error');
      return { success: false, message: 'Amount must be > 0' };
    }

    const payCount = payments.length + 1;
    const payNumber = `PAY-2026-${payCount.toString().padStart(3, '0')}`;
    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      paymentNumber: payNumber,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      customerId: targetInvoice.customerId,
      customerName: targetInvoice.customerName,
      amount: p.amount,
      paymentDate: p.paymentDate || new Date().toISOString().split('T')[0],
      method: p.method,
      referenceId: p.referenceId,
      notes: p.notes,
      createdAt: new Date().toISOString(),
    };

    const newAmountPaid = (targetInvoice.amountPaid || 0) + p.amount;
    const newAmountDue = Math.max(0, targetInvoice.totalAmount - newAmountPaid);
    const newStatus: Invoice['status'] = newAmountDue <= 0 ? 'paid' : 'confirmed';

    // Update invoice
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === targetInvoice.id
          ? {
              ...inv,
              amountPaid: newAmountPaid,
              amountDue: newAmountDue,
              status: newStatus,
            }
          : inv
      )
    );

    // Save payment
    setPayments((prev) => [newPayment, ...prev]);

    showToast(`Recorded payment of ₹${p.amount.toLocaleString()} for ${targetInvoice.invoiceNumber}`);
    return { success: true, message: 'Payment recorded successfully' };
  };

  // Discounts
  const addDiscount = (disc: Omit<DiscountRule, 'id' | 'timesUsed'>) => {
    const newDisc: DiscountRule = {
      ...disc,
      id: 'disc-' + Date.now(),
      timesUsed: 0,
    };
    setDiscounts((prev) => [newDisc, ...prev]);
    showToast(`Discount rule "${disc.code}" created`);
  };

  const updateDiscount = (id: string, updates: Partial<DiscountRule>) => {
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    showToast('Discount rule updated');
  };

  const deleteDiscount = (id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
    showToast('Discount rule deleted', 'info');
  };

  // Staff
  const addStaff = (s: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const newStaff: StaffUser = {
      ...s,
      id: 'staff-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setStaff((prev) => [...prev, newStaff]);
    showToast(`Staff member "${s.name}" added to ${s.department}`);
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    showToast('Staff member removed', 'info');
  };

  // Utilities
  const resetToSampleData = () => {
    setProducts(initialProducts);
    setPlans(initialPlans);
    setCustomers(initialCustomers);
    setSubscriptions(initialSubscriptions);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setDiscounts(initialDiscounts);
    setStaff(initialStaff);
    showToast('System data reset to initial Brightloop demo dataset');
  };

  const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) {
      showToast('No records available to export', 'error');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = typeof cell === 'object' ? JSON.stringify(cell).replace(/"/g, '""') : String(cell).replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${rows.length} records to CSV`);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentCustomerId,
        setCurrentCustomerId,
        toasts,
        showToast,
        removeToast,
        products,
        plans,
        customers,
        subscriptions,
        invoices,
        payments,
        discounts,
        staff,
        addProduct,
        updateProduct,
        deleteProduct,
        addPlan,
        updatePlan,
        deletePlan,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSubscription,
        updateSubscription,
        updateSubscriptionStatus,
        renewSubscription,
        generateInvoiceForSubscription,
        addInvoice,
        updateInvoiceStatus,
        sendInvoice,
        runBillingBatch,
        recordPayment,
        addDiscount,
        updateDiscount,
        deleteDiscount,
        addStaff,
        deleteStaff,
        resetToSampleData,
        exportToCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
