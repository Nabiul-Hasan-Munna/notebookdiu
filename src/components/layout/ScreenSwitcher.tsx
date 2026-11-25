import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Smartphone } from 'lucide-react';

export const ScreenSwitcher: React.FC = () => {
  const btnClass = ({ isActive }: { isActive: boolean }) =>
    `px-2.5 py-1.5 rounded-lg transition-all shrink-0 text-xs font-semibold ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-2 px-3 shadow-2xl flex items-center gap-1.5 overflow-x-auto max-w-[96vw]">
      <div className="flex items-center gap-2 pr-2.5 border-r border-slate-700 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          UniverseDIU:
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0 text-xs">
        <NavLink to="/login" className={btnClass}>1. Landing/Login</NavLink>
        <NavLink to="/feed" className={btnClass}>2. Home Feed</NavLink>
        <NavLink to="/compose" className={btnClass}>3. Composer</NavLink>
        <NavLink to="/post/1" className={btnClass}>4. Post Detail</NavLink>
        <NavLink to="/explore" className={btnClass}>5. Explore</NavLink>
        <NavLink to="/courses/SE-322" className={btnClass}>6. Course Page</NavLink>
        <NavLink to="/profile/me" className={btnClass}>7. Profile</NavLink>
        <NavLink to="/saved" className={btnClass}>8. Saved</NavLink>
        <NavLink to="/ask" className={btnClass}>9. Ask Question</NavLink>
        <NavLink to="/discussions" className={btnClass}>10. Discussions</NavLink>
        <NavLink to="/admin" className={btnClass}>11. Admin</NavLink>
        <NavLink 
          to="/mobile" 
          className={({ isActive }) =>
            `px-2.5 py-1.5 rounded-lg transition-all shrink-0 text-xs font-bold flex items-center gap-1 ${
              isActive ? 'bg-cyan-600 text-white shadow-md' : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
            }`
          }
        >
          <Smartphone className="w-3.5 h-3.5" />
          12. Mobile
        </NavLink>
      </div>
    </aside>
  );
};
