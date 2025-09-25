import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
     return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-300">You do not have permission to view this page.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-4">Admin Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Users</h3>
            <p className="text-4xl font-bold text-brand-blue">1,234</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Active Listings</h3>
            <p className="text-4xl font-bold text-brand-green">567</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Bids Today</h3>
            <p className="text-4xl font-bold text-brand-yellow">8,910</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Sales (24h)</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-white">$15,432</p>
          </div>
      </div>
      
      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Manage Products</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">View, edit, or remove product listings from the marketplace.</p>
            <Link to="/admin/products" className="bg-brand-blue text-white font-semibold py-2 px-4 rounded hover:bg-blue-700">
              Go to Product Management
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Manage Users</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">View user details, manage roles, or handle user-reported issues.</p>
            <Link to="/admin/users" className="bg-brand-blue text-white font-semibold py-2 px-4 rounded hover:bg-blue-700">
              Go to User Management
            </Link>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;