import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Bell, Home, Search, Plus, Bookmark, User as UserIcon, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MobileViewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8 space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Responsive Mobile Views</h1>
          <p className="text-xs text-slate-500">UniverseDIU is fully optimized for iOS and Android mobile web experiences</p>
        </div>

        {/* Dual iPhone Frame Simulator */}
        <div className="flex flex-wrap items-center justify-center gap-12">
          
          {/* Phone 1: Mobile Home Feed */}
          <div className="space-y-3">
            <h3 className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Mobile Home Feed
            </h3>
            <div className="iphone-frame">
              <div className="iphone-notch"></div>

              <div className="iphone-content px-4 py-3 space-y-4">
                {/* Mobile Sticky Topbar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-extrabold text-sm text-[#0b1a3c]">Universe<span className="text-cyan-500">DIU</span></span>
                  <div className="flex items-center gap-2">
                    <button className="text-slate-500">
                      <Bell className="w-4 h-4" />
                    </button>
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80"
                      className="w-6 h-6 rounded-full object-cover"
                      alt="Avatar"
                    />
                  </div>
                </div>

                {/* Greeting Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-sm">
                  <p className="text-[11px] text-blue-100">Good morning, Munna 👋</p>
                  <h4 className="font-bold text-sm mt-0.5">Explore Spring 2026 Resources</h4>
                </div>

                {/* Quick Action Pills */}
                <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                  <Link to="/compose?type=Knowledge" className="flex-1 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-center">
                    Knowledge
                  </Link>
                  <Link to="/compose?type=Resource" className="flex-1 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-center">
                    Resource
                  </Link>
                  <Link to="/ask" className="flex-1 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-center">
                    Question
                  </Link>
                  <Link to="/compose?type=Project" className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-center">
                    Project
                  </Link>
                </div>

                {/* Feed Post Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2.5 shadow-sm text-left">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      className="w-7 h-7 rounded-full object-cover"
                      alt="Rafiul"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Rafiul Islam</h5>
                      <p className="text-[9px] text-slate-400">Software Engineering • 2h ago</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    React CRUD with Express & MySQL
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    A beginner-friendly tutorial for building a CRUD application using React, Express and MySQL.
                  </p>

                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-semibold">#React</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-semibold">#Express</span>
                  </div>

                  {/* Attachment */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded">PDF</span>
                      <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[150px]">React_CRUD_Tutorial.pdf</span>
                    </div>
                    <span className="text-[9px] text-blue-600 font-bold">View</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> 46 Helpful</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 12</span>
                    <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" /> Save</span>
                  </div>
                </div>
              </div>

              {/* iPhone Bottom Bar */}
              <div className="iphone-bottom-bar text-slate-400">
                <Link to="/feed" className="text-blue-600"><Home className="w-5 h-5" /></Link>
                <Link to="/explore"><Search className="w-5 h-5" /></Link>
                <Link to="/compose" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md -mt-3">
                  <Plus className="w-5 h-5" />
                </Link>
                <Link to="/saved"><Bookmark className="w-5 h-5" /></Link>
                <Link to="/profile/me"><UserIcon className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>

          {/* Phone 2: Mobile Student Profile */}
          <div className="space-y-3">
            <h3 className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Mobile Student Profile
            </h3>
            <div className="iphone-frame">
              <div className="iphone-notch"></div>

              <div className="iphone-content px-4 py-3 space-y-4">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-[#0b1a3c] to-blue-900 text-white rounded-2xl p-4 text-center space-y-2 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-cyan-400 mx-auto"
                    alt="Munna"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">Nabiul Hasan Munna</h4>
                    <p className="text-[10px] text-cyan-300">Software Engineering • Batch 43</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-300" /> 1,245 Knowledge points
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-1 text-center py-2 bg-white rounded-xl border border-slate-200 text-xs">
                  <div><span className="block font-bold text-slate-900">38</span><span className="text-[10px] text-slate-400">Posts</span></div>
                  <div><span className="block font-bold text-slate-900">27</span><span className="text-[10px] text-slate-400">Resources</span></div>
                  <div><span className="block font-bold text-slate-900">64</span><span className="text-[10px] text-slate-400">Answers</span></div>
                  <div><span className="block font-bold text-blue-600">154</span><span className="text-[10px] text-slate-400">Helpful</span></div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-around border-b border-slate-200 text-xs font-bold text-slate-500 pb-2">
                  <span className="text-blue-600 border-b-2 border-blue-600 pb-1">Posts</span>
                  <span>Resources</span>
                  <span>Saved</span>
                  <span>Answers</span>
                </div>

                {/* Post Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2 shadow-sm text-left">
                  <h5 className="font-bold text-xs text-slate-900">Understanding JWT Authentication</h5>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    JWT is a compact, URL-safe token format used for securely transmitting information...
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>👍 24 Helpful</span>
                    <span>💬 8 Comments</span>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Bar */}
              <div className="iphone-bottom-bar text-slate-400">
                <Link to="/feed"><Home className="w-5 h-5" /></Link>
                <Link to="/explore"><Search className="w-5 h-5" /></Link>
                <Link to="/compose" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md -mt-3">
                  <Plus className="w-5 h-5" />
                </Link>
                <Link to="/saved"><Bookmark className="w-5 h-5" /></Link>
                <Link to="/profile/me" className="text-blue-600"><UserIcon className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
