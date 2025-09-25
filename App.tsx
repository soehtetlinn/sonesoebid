import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WatchListProvider } from './contexts/WatchListContext';
import { CartProvider } from './contexts/CartContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UserMyProductsPage from './pages/UserMyProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminProductManagementPage from './pages/AdminProductManagementPage';
import BackButton from './components/BackButton';
import UserNotificationsPage from './pages/UserNotificationsPage';
import WatchListPage from './pages/WatchListPage';
import UserProfilePage from './pages/UserProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CartPage from './pages/CartPage';
import MessagingPage from './pages/MessagingPage';
import DisputeCenterPage from './pages/DisputeCenterPage';


const PageLayout: React.FC = () => {
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {showBackButton && <BackButton />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/dashboard/products" element={<UserMyProductsPage />} />
          <Route path="/dashboard/product/new" element={<ProductFormPage />} />
          <Route path="/dashboard/product/edit/:id" element={<ProductFormPage />} />
          <Route path="/dashboard/notifications" element={<UserNotificationsPage />} />
          <Route path="/dashboard/watchlist" element={<WatchListPage />} />
          <Route path="/dashboard/orders" element={<OrderHistoryPage />} />
          <Route path="/dashboard/messages" element={<MessagingPage />} />
          <Route path="/dashboard/messages/:conversationId" element={<MessagingPage />} />
          <Route path="/disputes" element={<DisputeCenterPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUserManagementPage />} />
          <Route path="/admin/products" element={<AdminProductManagementPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <WatchListProvider>
            <CartProvider>
              <HashRouter>
                <PageLayout />
              </HashRouter>
            </CartProvider>
          </WatchListProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;