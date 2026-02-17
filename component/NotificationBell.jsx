'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  X, 
  Check, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  FileText,
  Info,
  Calendar
} from 'lucide-react';
import { useStudent } from '@/app/context/StudentContext';

const iconMap = {
  Clock: Clock,
  CheckCircle: CheckCircle,
  AlertCircle: AlertCircle,
  MessageSquare: MessageSquare,
  FileText: FileText,
  Info: Info,
  Calendar: Calendar
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    loading 
  } = useStudent();
  
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllNotificationsAsRead();
  };

  const handleRemoveNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getTypeStyles = (type) => {
    const styles = {
      status_change: { bg: 'bg-yellow-50', icon: Clock, color: 'text-yellow-600' },
      announcement: { bg: 'bg-purple-50', icon: AlertCircle, color: 'text-purple-600' },
      message: { bg: 'bg-blue-50', icon: MessageSquare, color: 'text-blue-600' },
      resolved: { bg: 'bg-green-50', icon: CheckCircle, color: 'text-green-600' },
      course: { bg: 'bg-indigo-50', icon: FileText, color: 'text-indigo-600' },
      default: { bg: 'bg-gray-50', icon: Info, color: 'text-gray-600' }
    };
    return styles[type] || styles.default;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-indigo-600 transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg group"
        aria-label="View notifications"
      >
        <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 bg-white rounded-lg hover:bg-indigo-50 transition-colors shadow-sm border border-indigo-100"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              // Loading Skeleton
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => {
                const styles = getTypeStyles(notification.type);
                const IconComponent = iconMap[notification.icon] || styles.icon;
                
                return (
                  <div
                    key={notification.id}
                    className={`relative hover:bg-gray-50 transition-colors group ${
                      !notification.read ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="p-4 pr-12 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 ${notification.bgColor || styles.bg} rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`h-4 w-4 ${notification.iconColor || styles.color}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-400 ml-2">
                              {formatTime(notification.time)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Unread indicator */}
                          {!notification.read && (
                            <span className="absolute top-4 right-12 h-2 w-2 bg-indigo-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemoveNotification(e, notification.id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">No notifications</p>
                <p className="text-xs text-gray-500 mt-1">We'll notify you when something arrives</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}