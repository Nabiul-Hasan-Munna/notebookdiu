import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, FileText, ArrowLeft, Building2, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
      isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 text-slate-800 antialiased">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Admin Sidebar */}
        <aside className="lg:col-span-3 bg-[#0b1a3c] text-white rounded-3xl p-6 shadow-xl space-y-6 self-start sticky top-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/30">
              UD
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">UniverseDIU</h3>
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Admin Portal</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs">
            <NavLink to="/admin" end className={navClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </NavLink>

            <NavLink to="/admin/users" className={navClass}>
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </NavLink>

            <NavLink to="/admin/moderation" className={navClass}>
              <ShieldAlert className="w-4 h-4" />
              <span>Content Moderation</span>
            </NavLink>

            <NavLink to="/admin/audit" className={navClass}>
              <FileText className="w-4 h-4" />
              <span>Security Audit Logs</span>
            </NavLink>

            {/* Course link */}

            <NavLink to="/admin/courses" className={navClass}>
              <BookOpen className="w-4 h-4" />
              <span>Course Management</span>
            </NavLink>
          </nav>

          <div className="pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5 px-2">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500"
                alt="Admin"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-cyan-400 font-bold">{user?.role || 'ADMIN'}</p>
              </div>
            </div>

            <Link
              to="/feed"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Admin Portal</span>
            </Link>
          </div>
        </aside>

        {/* Admin Main Dynamic Body */}
        <main className="lg:col-span-9 space-y-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
