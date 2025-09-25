import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useWatchList } from '../contexts/WatchListContext';
import { useNotifications } from '../contexts/NotificationContext';

const UserDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { watchlist } = useWatchList();
  const { notifications, unreadCount } = useNotifications();

  if (!isAuthenticated || !user) {
    return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-300">Please log in to view your dashboard.</p>
        </div>
    );
  }

  // Redirect if user is an admin
  if (user.role === UserRole.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  const unreadNotifications = notifications.filter(n => !n.isRead).slice(0, 3);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-4">Welcome, {user.username}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Account Details</h3>
            <p className="mt-2"><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-2 border dark:border-gray-700">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Quick Stats</h3>
             <div className="flex justify-around items-center mt-4">
                <div className="text-center">
                    <p className="text-3xl font-bold text-brand-blue">5</p>
                    <p className="text-gray-500 dark:text-gray-400">Active Bids</p>
                </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-brand-green">2</p>
                    <p className="text-gray-500 dark:text-gray-400">Items Won</p>
                </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-brand-yellow">{watchlist.size}</p>
                    <p className="text-gray-500 dark:text-gray-400">Watching</p>
                </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Account</h2>
            <div className="space-y-2">
                <Link to={`/user/${user.id}`} className="block text-brand-blue hover:underline">My Profile</Link>
                <Link to="/dashboard/orders" className="block text-brand-blue hover:underline">Order History</Link>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Selling</h2>
            <div className="space-y-2">
                <Link to="/dashboard/products" className="block text-brand-blue hover:underline">My Products</Link>
                 <Link to="/dashboard/product/new" className="block text-brand-blue hover:underline">List a New Item</Link>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Activity</h2>
            <div className="space-y-2">
                <Link to="/dashboard/watchlist" className="block text-brand-blue hover:underline">Watchlist</Link>
                <Link to="/dashboard/messages" className="block text-brand-blue hover:underline">Messages</Link>
            </div>
        </div>
      </div>
      
      {/* Recent Notifications */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recent Notifications</h2>
            {unreadCount > 0 && <span className="px-3 py-1 text-sm font-bold text-white bg-brand-red rounded-full">{unreadCount} New</span>}
        </div>
        {unreadNotifications.length > 0 ? (
            <div className="space-y-3">
                {unreadNotifications.map(n => (
                    <Link to={n.type === 'NEW_MESSAGE' ? `/dashboard/messages/${n.relatedId}` : `/product/${n.relatedId}`} key={n.id} className="block p-3 rounded-md bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600">
                       <p className="font-semibold">{n.title}</p>
                       <p className="text-sm text-gray-600 dark:text-gray-300">{n.message}</p>
                    </Link>
                ))}
            </div>
        ) : (
            <p className="text-gray-600 dark:text-gray-400">You have no new notifications.</p>
        )}
        <Link to="/dashboard/notifications" className="inline-block mt-4 text-brand-blue font-semibold hover:underline">
            View all notifications
        </Link>
      </div>
    </div>
  );
};

export default UserDashboardPage;