import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageCircle,
  CornerDownRight,
  ThumbsUp,
  CheckCheck,
  Trash2,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { api, Notification } from '../services/api';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    try {
      setError('');
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  loadNotifications();

  const interval = window.setInterval(() => {
    loadNotifications();
  }, 10000);

  return () => window.clearInterval(interval);
}, [loadNotifications]);

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(item => ({ ...item, is_read: 1 }))
      );
    } catch (err: any) {
      setError(err.message || 'Could not mark notifications as read');
    }
  };

  const markRead = async (notification: Notification) => {
    if (Number(notification.is_read) === 1) return;

    try {
      await api.markNotificationRead(notification.id);
      setNotifications(prev =>
        prev.map(item =>
          item.id === notification.id ? { ...item, is_read: 1 } : item
        )
      );
    } catch (err: any) {
      setError(err.message || 'Could not mark notification as read');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'Could not delete notification');
    }
  };

  const openNotification = async (notification: Notification) => {
    await markRead(notification);

    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
  };

  const getIcon = (type: Notification['type']) => {
    if (type === 'COMMENT') return <MessageCircle className="w-5 h-5" />;
    if (type === 'REPLY') return <CornerDownRight className="w-5 h-5" />;
    return <ThumbsUp className="w-5 h-5" />;
  };

  const getTime = (date: string) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return '';

    return value.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const unreadCount = notifications.filter(
    item => Number(item.is_read) === 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Notifications
              </h1>
              <p className="text-sm text-slate-500">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="font-semibold text-slate-700">
                No notifications yet
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                We'll let you know when someone interacts with your posts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 transition-colors ${
                    Number(notification.is_read) === 0
                      ? 'bg-blue-50/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-11 h-11 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center overflow-hidden">
                    {notification.actor_avatar ? (
                      <img
                        src={notification.actor_avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getIcon(notification.type)
                    )}
                  </div>

                  <button
                    onClick={() => openNotification(notification)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">
                        {notification.actor_name || 'Someone'}
                      </span>{' '}
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {getTime(notification.created_at)}
                    </p>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    {Number(notification.is_read) === 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};