import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CreatePostPrompt } from '../components/feed/CreatePostPrompt';
import { PostCard } from '../components/feed/PostCard';
import { Post } from '../types';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

export const HomeFeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-9 space-y-6">
            <CreatePostPrompt />

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <p className="text-xs text-slate-500 font-semibold">Loading universe feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-700">No community posts yet.</p>
                <p className="text-xs text-slate-400 mt-1">Be the first to share a tutorial, question or resource!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={fetchPosts} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
