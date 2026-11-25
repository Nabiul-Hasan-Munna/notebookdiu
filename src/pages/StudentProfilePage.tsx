import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { User, Post } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageSquare, Bookmark, Share2, Star, Loader2 } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'resources' | 'saved' | 'answers'>('posts');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const identifier = (id === 'me' || !id) && currentUser ? currentUser.id : (id || '3');
        const data = await api.getUserProfile(identifier);
        setProfileUser(data.user);
        setUserPosts(data.posts);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  const displayedPosts = userPosts.filter(p => {
    if (activeTab === 'resources') return p.type === 'Resource';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl">
            {toastMessage}
          </div>
        )}

        {loading || !profileUser ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-semibold">Loading student profile...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Campus Cover Photo */}
            <div className="h-48 md:h-64 w-full relative overflow-hidden bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80"
                alt="DIU Campus Cover"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Profile Info Header */}
            <div className="px-6 md:px-8 pb-6 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
                <div className="flex items-end gap-4">
                  <img
                    src={profileUser.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80'}
                    alt={profileUser.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                  />
                  <div className="space-y-1 mb-1">
                    <h1 className="text-2xl font-black text-slate-900">{profileUser.name}</h1>
                    <p className="text-xs font-semibold text-slate-600">
                      {profileUser.department} • Batch {profileUser.batch}
                    </p>
                    <p className="text-xs text-slate-400">
                      DIU Email: <span className="text-blue-600 font-mono">{profileUser.email}</span>
                    </p>
                  </div>
                </div>

                {/* Knowledge Points Pill */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Knowledge Points</p>
                    <h3 className="text-xl font-black text-amber-900">
                      {profileUser.knowledge_points.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-4 gap-2 py-4 border-y border-slate-100 text-center text-xs">
                <div>
                  <span className="block text-xl font-bold text-slate-900">{profileUser.stats?.posts ?? 38}</span>
                  <span className="text-slate-500 font-medium">Posts</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-900">{profileUser.stats?.resources ?? 27}</span>
                  <span className="text-slate-500 font-medium">Resources</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-900">{profileUser.stats?.answers ?? 64}</span>
                  <span className="text-slate-500 font-medium">Answers</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-blue-600">{profileUser.stats?.helpful ?? 154}</span>
                  <span className="text-slate-500 font-medium">Helpful</span>
                </div>
              </div>

              {/* Profile Navigation Tabs */}
              <div className="flex items-center gap-8 pt-4 border-b border-slate-100 text-xs font-bold text-slate-500">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`pb-3 transition-colors ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`pb-3 transition-colors ${activeTab === 'resources' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
                >
                  Resources
                </button>
                <Link
                  to="/saved"
                  className="pb-3 hover:text-slate-800 transition-colors"
                >
                  Saved
                </Link>
                <button
                  onClick={() => { setActiveTab('answers'); showToast('Showing student Q&A contributions'); }}
                  className={`pb-3 transition-colors ${activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
                >
                  Answers
                </button>
              </div>

              {/* Feed of Posts */}
              <div className="pt-6 space-y-4">
                {displayedPosts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No items in this category yet.
                  </div>
                ) : (
                  displayedPosts.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={profileUser.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'}
                            className="w-8 h-8 rounded-full object-cover"
                            alt={profileUser.name}
                          />
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{profileUser.name}</h4>
                            <p className="text-[10px] text-slate-400">{profileUser.department} • 5h ago</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {p.type}
                        </span>
                      </div>

                      <Link to={`/post/${p.id}`} className="block group">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {p.content}
                        </p>
                      </Link>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                        <button
                          onClick={async () => {
                            const res = await api.toggleHelpful(p.id);
                            p.helpfulCount = res.helpfulCount;
                            showToast(res.hasLiked ? 'Marked helpful! 👍' : 'Unliked');
                          }}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{p.helpfulCount} Helpful</span>
                        </button>

                        <Link to={`/post/${p.id}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{p.commentsCount} Comments</span>
                        </Link>

                        <button
                          onClick={async () => {
                            const res = await api.toggleSave(p.id);
                            showToast(res.message);
                          }}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/post/${p.id}`);
                            showToast('Link copied! 📋');
                          }}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
