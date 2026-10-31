import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { PlansView } from './components/PlansView';
import { CustomersView } from './components/CustomersView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { InvoicesView } from './components/InvoicesView';
import { PaymentsView } from './components/PaymentsView';
import { DiscountsView } from './components/DiscountsView';
import { ReportsView } from './components/ReportsView';
import { TeamView } from './components/TeamView';
import { CustomerPortalView } from './components/CustomerPortalView';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { role, setRole, setCurrentCustomerId } = useApp();

  const handleOpenPortal = (customerId: string) => {
    setRole('customer');
    setCurrentCustomerId(customerId);
    setCurrentTab('portal-dashboard');
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
      {currentTab === 'products' && <ProductsView />}
      {currentTab === 'plans' && <PlansView />}
      {currentTab === 'customers' && <CustomersView onOpenPortal={handleOpenPortal} />}
      {currentTab === 'subscriptions' && <SubscriptionsView />}
      {currentTab === 'invoices' && <InvoicesView />}
      {currentTab === 'payments' && <PaymentsView />}
      {currentTab === 'discounts' && <DiscountsView />}
      {currentTab === 'reports' && <ReportsView />}
      {currentTab === 'team' && <TeamView />}
      {currentTab.startsWith('portal-') && <CustomerPortalView tab={currentTab} />}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
