import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
// FIX: Import Notification type to correctly handle notification objects.
import { Notification, NotificationType } from '../types';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getIcon = (type: NotificationType) => {
    switch(type) {
        case NotificationType.OUTBID: return '💸';
        case NotificationType.WON: return '🎉';
        case NotificationType.ENDING_SOON: return '⏳';
        case NotificationType.NEW_MESSAGE: return '💬';
        default: return '🔔';
    }
  }

  // FIX: Handle notification click based on notification type and use `relatedId`.
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.type === NotificationType.NEW_MESSAGE) {
        navigate(`/dashboard/messages/${notification.relatedId}`);
    } else {
        navigate(`/product/${notification.relatedId}`);
    }
    setIsOpen(false);
  };
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Toggle notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-brand-red text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
                notifications.slice(0, 5).map(notification => (
                    <div 
                        key={notification.id}
                        // FIX: Pass the entire notification object to the handler.
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 border-b border-gray-100 dark:border-gray-700 flex items-start space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${!notification.isRead ? 'bg-blue-50 dark:bg-gray-900' : ''}`}
                    >
                        <span className="text-xl mt-1">{getIcon(notification.type)}</span>
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
            )}
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50">
            <Link to="/dashboard/notifications" onClick={() => setIsOpen(false)} className="block w-full text-center text-sm font-medium text-brand-blue hover:underline">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;