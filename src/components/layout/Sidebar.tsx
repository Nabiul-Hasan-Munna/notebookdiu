import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Compass, BookOpen, Bookmark, Bell, MessageSquare, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-colors ${
      isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
    }`;

  return (
    <aside className="space-y-6">
      {/* Navigation Card */}
      <nav className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm space-y-1 text-xs">
        <NavLink to="/feed" className={navClass}>
          <Home className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/explore" className={navClass}>
          <Compass className="w-4 h-4" />
          <span>Explore</span>
        </NavLink>

        <NavLink to="/courses/SE-322" className={navClass}>
          <BookOpen className="w-4 h-4" />
          <span>My Courses</span>
        </NavLink>

        <NavLink to="/messages" className={navClass}>
          <MessageSquare className="w-4 h-4" />
          <span>Messages</span>
        </NavLink>

        <NavLink to="/saved" className={navClass}>
          <Bookmark className="w-4 h-4" />
          <span>Saved</span>
        </NavLink>

        <NavLink to="/notifications" className={navClass}>
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={navClass}>
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-bold">Admin Portal</span>
          </NavLink>
        )}
      </nav>

      {/* My Courses Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">My Courses</h3>
          <Link to="/explore?type=all" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">
            View All
          </Link>
        </div>

        <div className="space-y-2 text-xs font-medium">
          <Link
            to="/courses/SE-322"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-700 font-semibold group-hover:text-blue-600">SE-322</span>
              <span className="text-slate-400 text-[11px]">(Web App Lab)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
          </Link>

          <Link
            to="/courses/SE-213"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-slate-700 font-semibold group-hover:text-blue-600">SE-213</span>
              <span className="text-slate-400 text-[11px]">(OOP)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
          </Link>

          <Link
            to="/courses/CSE-311"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-slate-700 font-semibold group-hover:text-blue-600">CSE-311</span>
              <span className="text-slate-400 text-[11px]">(DBMS)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
          </Link>

          <Link
            to="/courses/MAT-111"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-slate-700 font-semibold group-hover:text-blue-600">MAT-111</span>
              <span className="text-slate-400 text-[11px]">(Calculus)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
