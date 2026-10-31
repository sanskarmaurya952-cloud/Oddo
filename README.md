# Brightloop Software — Subscription Management System (MVP)

A unified, modern enterprise subscription management and recurring billing platform built for **Brightloop Software**, matching the business workflows outlined in the Odoo Subscription Management specification.

![Brightloop Subscription OS Preview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Highlights & Architecture

- **Command Center Dashboard**: Live Monthly Recurring Revenue (MRR), total collected revenue, outstanding balances, aging overdue invoices, and interactive SVG trend charts calculated dynamically from ledger transactions.
- **Products & Variants**: Full catalog management with variant pricing adjustments (e.g., Odoo Brand module addition adds ₹560).
- **Flexible Billing Plans**: Daily, weekly, monthly, and annual cadences, minimum seat configurations, auto-close switches, and lifecycle state transitions (Active, Paused, Closed).
- **Customer Directory & 360° View**: Unified customer records with history of linked subscriptions and billed invoices.
- **Subscriptions & Quotation Engine**: Unique subscription tracking (`SUB-2026-001`), quotation validity templates, payment terms (Net 15, Net 30, Due on Receipt), and automated GST calculations.
- **Idempotent Recurring Billing**: One-click bulk generation engine (`Run Billing Batch`) that prevents duplicate invoices for the same subscription and period.
- **Payments Ledger**: Multi-channel reconciliation across UPI (QR/Apps), NEFT/IMPS Bank Transfer, Credit/Debit Cards, and Cash with real-time invoice balance tracking.
- **Rule-Based Discount Engine**: Fixed and percentage promo codes, minimum spend/seat thresholds, usage limits, and automatic billing application.
- **Role-Aware Security (RBAC)**:
  - **Admin**: Unrestricted control across catalog, plans, discounts, staff accounts, and financial exports.
  - **Staff**: Operational duties: creating quotations, billing runs, and reconciling payments.
  - **Customer Portal**: Self-service view isolating only the authenticated customer's own subscriptions and invoices with 1-click UPI/Card checkout.
- **Compliance & Password Standards**: Strict password complexity checks (>8 characters, 1 uppercase, 1 lowercase, 1 special character) and password reset flows.
- **Data Persistence**: Instant local persistence with built-in reset capability and CSV data export.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Dark Navy `#0b1120`, Electric Indigo accents, responsive cards)
- **Icons**: Lucide React
- **Build**: Vite with optimized chunks

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 👥 Demo Role Testing

Use the role switcher in the top right header to toggle between:
1. **Admin View**: Full access to all modules, product configuration, and staff management.
2. **Staff View**: Streamlined operational workflow for sales reps and billing agents.
3. **Customer Portal**: Pre-configured accounts (e.g., *Apex Retail India*, *CloudScale Tech*) demonstrating self-service view and payment checkout.

---

## 🔒 Verification & Compliance
- Idempotency tested: duplicate billing runs return informative warnings and do not generate duplicate invoices.
- Data export tested: downloads CSV formatted reports for accounting.
- Passwords audited against enterprise security guidelines.

---

*Brightloop Software Inc. • Subscription Management MVP*
