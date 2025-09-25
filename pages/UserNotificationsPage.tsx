import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { NotificationType } from '../types';

const UserNotificationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  
  const getIcon = (type: NotificationType) => {
    switch(type) {
        case NotificationType.OUTBID: return '💸';
        case NotificationType.WON: return '🎉';
        case NotificationType.ENDING_SOON: return '⏳';
        case NotificationType.NEW_MESSAGE: return '💬';
        default: return '🔔';
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Notifications</h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map(notification => (
            <Link
                // FIX: Use `relatedId` instead of `productId` and handle different notification types.
                to={notification.type === NotificationType.NEW_MESSAGE ? `/dashboard/messages/${notification.relatedId}` : `/product/${notification.relatedId}`}
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`block p-4 rounded-lg border-l-4 ${notification.isRead ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600' : 'bg-blue-50 dark:bg-blue-900/20 border-brand-blue'}`}
            >
                <div className="flex items-start space-x-4">
                    <span className="text-2xl mt-1">{getIcon(notification.type)}</span>
                    <div className="flex-grow">
                        <p className={`font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                            {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                        </p>
                    </div>
                    {!notification.isRead && (
                        <div className="w-2.5 h-2.5 bg-brand-blue rounded-full self-center"></div>
                    )}
                </div>
            </Link>
        )) : (
            <p className="text-center py-10 text-gray-500 dark:text-gray-400">You don't have any notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserNotificationsPage;