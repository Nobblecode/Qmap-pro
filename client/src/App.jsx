import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppServer from './modules/AppServer';
import Database from './modules/Database';
import LoadBalancer from './modules/LoadBalancer';
import GlobalMerchantGateway from './modules/GlobalMerchantGateway';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductLanding from './pages/ProductLanding';
import Signup from './pages/Signup';
import Login from './pages/Login';
import DashboardOverview from './pages/DashboardOverview';
import AdminDashboard from './pages/AdminDashboard';
import ProductOwnerDashboard from './pages/ProductOwnerDashboard';
import AffiliateDashboard from './pages/AffiliateDasboard';
import AffiliateWallet from './pages/AffiliateWallet';
import UnauthorizedPage from './pages/UnauthorizedPage'; // ✅ imported component
import WalletPage from './pages/WalletPage';
import PaymentReturn from './pages/PaymentReturn';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './Layout';
import { ThemeProvider } from './context/ThemeContext';
import ProductProgressPage from './pages/ProductProgressPage';
import AffiliatePerformance from './pages/AffiliatePerformance';

const App = () => {
  const { user, role } = useAuth();

  const isAuthenticated = !!user;
  const userRole = (role || '').toString().toLowerCase();

  const loadAllProducts = () => {
    const allKeys = Object.keys(localStorage);
    const allProducts = [];

    allKeys.forEach((key) => {
      if (key.startsWith('products_')) {
        try {
          const items = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(items)) {
            allProducts.push(...items);
          }
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });

    return allProducts;
  };

  const [submittedProducts, setSubmittedProducts] = useState(loadAllProducts);

  useEffect(() => {
    const handleStorageChange = () => {
      setSubmittedProducts(loadAllProducts());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleProductSubmit = (formData) => {
    try {
      const existingIndex = submittedProducts.findIndex(p => p.id === formData.id);
      let updated;

      if (existingIndex !== -1) {
        updated = [...submittedProducts];
        updated[existingIndex] = formData;
      } else {
        updated = [...submittedProducts, formData];
      }

      setSubmittedProducts(updated);
      toast.success('Product submitted!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit product.');
    }
  };

  return (
    <ThemeProvider>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/signup" element={
          !isAuthenticated ? (
            <Signup />
          ) : userRole === 'admin' ? (
            <Navigate to="/admin-dashboard" />
          ) : userRole === 'productowner' ? (
            <Navigate to="/product-owner-dashboard" />
          ) : userRole === 'affiliate' ? (
            <Navigate to="/affiliate-dashboard" />
          ) : (
            <Navigate to="/unauthorized" />
          )
        } />
        <Route path="/login" element={
          !isAuthenticated ? (
            <Login />
          ) : userRole === 'admin' ? (
            <Navigate to="/admin-dashboard" />
          ) : userRole === 'productowner' ? (
            <Navigate to="/product-owner-dashboard" />
          ) : userRole === 'affiliate' ? (
            <Navigate to="/affiliate-dashboard" />
          ) : (
            <Navigate to="/unauthorized" />
          )
        } />

        {/* All other routes use the Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/app-server" element={<AppServer />} />
          <Route path="/database" element={<Database />} />
          <Route path="/load-balancer" element={<LoadBalancer />} />
          <Route path="/gateway" element={<GlobalMerchantGateway />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/payment-return" element={<PaymentReturn />} />
          <Route path="/product/:id" element={<ProductLanding />} />

          <Route
            path="/product-progress"
            element={
              <RoleRoute allowedRoles={['ProductOwner']}>
                <ProductProgressPage />
              </RoleRoute>
            }
          />

          <Route
            path="/affiliate-performance"
            element={
              <RoleRoute allowedRoles={['Affiliate']}>
                <AffiliatePerformance />
              </RoleRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <RoleRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/product-owner-dashboard"
            element={
              <RoleRoute allowedRoles={['ProductOwner']}>
                <ProductOwnerDashboard handleSubmit={handleProductSubmit} />
              </RoleRoute>
            }
          />

          <Route
            path="/affiliate-dashboard"
            element={
              <RoleRoute allowedRoles={['Affiliate']}>
                <AffiliateDashboard productDataList={submittedProducts} />
              </RoleRoute>
            }
          />

          <Route
            path="/affiliate-wallet"
            element={
              <RoleRoute allowedRoles={["Affiliate"]}>
                <AffiliateWallet />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/unauthorized" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
