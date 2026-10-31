export type Role = 'admin' | 'staff' | 'customer';

export type ProductType = 'software' | 'addon' | 'service';

export interface ProductVariant {
  id: string;
  name: string;
  extraPrice: number; // e.g. Odoo brand adds 560
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes?: string;
  variants: ProductVariant[];
  createdAt: string;
}

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type PlanStatus = 'active' | 'paused' | 'closed';

export interface Plan {
  id: string;
  name: string;
  billingFrequency: BillingFrequency;
  price: number;
  minQuantity: number;
  startDate: string;
  endDate?: string;
  autoClose: boolean;
  status: PlanStatus;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  createdAt: string;
}

export type SubscriptionStatus = 'draft' | 'quotation' | 'confirmed' | 'active' | 'paused' | 'closed';

export interface SubscriptionItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage, e.g. 18 for 18% GST
  discountAmount?: number;
  total: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string; // SUB-2026-001
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency;
  startDate: string;
  expiryDate: string;
  paymentTerms: string; // Net 15, Net 30, Due on Receipt
  status: SubscriptionStatus;
  items: SubscriptionItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  quotationValidityDays?: number;
  quotationDate?: string;
  lastBilledPeriod?: string; // e.g. "2026-10" or "2026-10-31" to prevent duplicate billing
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';

export interface InvoiceItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2026-001
  subscriptionId?: string;
  subscriptionNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  billingPeriod: string; // e.g. "Oct 2026"
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'upi' | 'bank_transfer' | 'card' | 'cash';

export interface Payment {
  id: string;
  paymentNumber: string; // PAY-2026-001
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceId: string;
  notes?: string;
  createdAt: string;
}

export type DiscountType = 'fixed' | 'percentage';

export interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number; // e.g., 10 for 10% or 500 for fixed ₹500
  minPurchaseAmount?: number;
  minQuantity?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  applicableProductIds: string[]; // empty means all
  active: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
