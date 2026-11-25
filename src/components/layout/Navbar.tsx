
import React, { useEffect, useState } from 'react';
import { api, Notification } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Bell, MessageSquare, Shield, LogOut, User,
  MessageCircle, CornerDownRight, ThumbsUp,
  CheckCheck as UserIcon, Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Direct message unread count
  const [unreadMessages, setUnreadMessages] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const count = await api.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const loadUnreadMessages = async () => {
    try {
      const conversations = await api.getConversations();

      const total = conversations.reduce(
        (sum, conversation) => sum + Number(conversation.unread_count || 0),
        0
      );

      setUnreadMessages(total);
    } catch (error) {
      console.error('Failed to load unread messages:', error);
    }
  };

  const loadNotificationDropdown = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.slice(0, 8));
      await loadUnreadCount();
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Refresh notification and message badges
  useEffect(() => {
    const refresh = async () => {
      await Promise.all([
        loadUnreadCount(),
        loadUnreadMessages()
      ]);

      if (notificationsOpen) {
        try {
          const data = await api.getNotifications();
          setNotifications(data.slice(0, 8));
        } catch (error) {
          console.error('Failed to refresh notifications:', error);
        }
      }
    };

    refresh();

    const interval = window.setInterval(refresh, 5000);

    return () => window.clearInterval(interval);
  }, [notificationsOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (Number(notification.is_read) === 0) {
        await api.markNotificationRead(notification.id);

        setNotifications(prev =>
          prev.map(item =>
            item.id === notification.id
              ? { ...item, is_read: 1 }
              : item
          )
        );

        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      setNotificationsOpen(false);

      if (notification.post_id) {
        navigate(`/post/${notification.post_id}`);
      }
    } catch (error) {
      console.error('Failed to open notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();

      setNotifications(prev =>
        prev.map(item => ({ ...item, is_read: 1 }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b1a3c] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link to="/feed" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0b1a3c] rounded-[9px] flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="6" />
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
              </svg>
            </div>
          </div>

          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Universe<span className="text-cyan-400">DIU</span>
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything... (courses, notes, questions)"
              className="w-full pl-9 pr-12 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
            />

            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-[10px] text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-600/60 font-mono">
                Ctrl+K
              </span>
            </div>
          </form>
        </div>

        {/* Right User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                const nextState = !notificationsOpen;
                setNotificationsOpen(nextState);

                if (nextState) {
                  loadNotificationDropdown();
                }
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0b1a3c]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Notifications</h3>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 border-b border-slate-100 ${
                          Number(notification.is_read) === 0 ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div className="w-9 h-9 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          {notification.type === 'COMMENT' ? (
                            <MessageCircle className="w-4 h-4" />
                          ) : notification.type === 'REPLY' ? (
                            <CornerDownRight className="w-4 h-4" />
                          ) : (
                            <ThumbsUp className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">
                              {notification.actor_name || 'Someone'}
                            </span>{' '}
                            {notification.message}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>

                        {Number(notification.is_read) === 0 && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                <Link
                  to="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="block text-center py-3 text-sm font-semibold text-blue-600 hover:bg-slate-50 border-t border-slate-100"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* Messages with unread badge */}
          <button
            onClick={() => navigate('/messages')}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={
              unreadMessages > 0
                ? `${unreadMessages} unread messages`
                : 'Messages'
            }
          >
            <MessageSquare className="w-5 h-5" />

            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0b1a3c]">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 border-l border-slate-700 cursor-pointer group focus:outline-none"
            >
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400/50 group-hover:ring-cyan-400 transition-all"
              />

              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 hidden md:inline">
                {user ? user.name.split(' ')[0] : 'Munna'}
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-xs text-slate-900 truncate">
                    {user?.name || 'Nabiul Hasan Munna'}
                  </p>

                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'student@diu.edu.bd'}
                  </p>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {user?.role || 'STUDENT'}
                    </span>

                    <span className="text-[11px] font-bold text-amber-600">
                      ★ {user?.knowledge_points || 1245} pts
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs font-semibold text-slate-600">
                  <Link to="/profile/me" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-blue-600">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link to="/saved" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-blue-600">
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    <span>Saved Resources</span>
                  </Link>

                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 hover:bg-blue-50 hover:text-blue-700 text-blue-600 font-bold">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
