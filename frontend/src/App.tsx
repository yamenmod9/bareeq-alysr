import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerAcceptPurchase from './pages/customer/AcceptPurchase';
import CustomerRepayments from './pages/customer/Repayments';
import CustomerPayment from './pages/customer/Payment';
import CustomerSettings from './pages/customer/Settings';
import CustomerMyTransactions from './pages/customer/MyTransactions';
// Merchant Pages
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantSendRequest from './pages/merchant/SendRequest';
import MerchantPurchaseRequests from './pages/merchant/PurchaseRequests';
import MerchantTransactions from './pages/merchant/Transactions';
import MerchantSettlements from './pages/merchant/Settlements';
import MerchantSettings from './pages/merchant/Settings';
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCustomers from './pages/admin/Customers';
import AdminMerchants from './pages/admin/Merchants';
import AdminTransactions from './pages/admin/Transactions';

const getDefaultRoute = (role?: string) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'merchant':
      return '/merchant/dashboard';
    case 'customer':
    default:
      return '/customer/dashboard';
  }
};

function App() {
  const { updateResolvedTheme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Initialize theme and direction on mount
    updateResolvedTheme();
  }, [updateResolvedTheme]);

  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to={getDefaultRoute(user?.role)} replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to={getDefaultRoute(user?.role)} replace /> : <Register />}
          />

          {/* Protected Routes - Customer */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="accept" element={<CustomerAcceptPurchase />} />
            <Route path="my-transactions" element={<CustomerMyTransactions />} />
            <Route path="repayments" element={<CustomerRepayments />} />
            <Route path="payment" element={<CustomerPayment />} />
            <Route path="settings" element={<CustomerSettings />} />
          </Route>

          {/* Protected Routes - Merchant */}
          <Route
            path="/merchant"
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<MerchantDashboard />} />
            <Route path="send" element={<MerchantSendRequest />} />
            <Route path="requests" element={<MerchantPurchaseRequests />} />
            <Route path="transactions" element={<MerchantTransactions />} />
            <Route path="settlements" element={<MerchantSettlements />} />
            <Route path="settings" element={<MerchantSettings />} />
          </Route>

          {/* Protected Routes - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="merchants" element={<AdminMerchants />} />
            <Route path="transactions" element={<AdminTransactions />} />
          </Route>

          {/* Root Redirect */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute(user?.role)} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 404 Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
