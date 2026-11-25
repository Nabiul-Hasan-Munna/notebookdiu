import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../services/api';
import { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';

export const DiscussionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId') || '1';
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeReplyToId, setActiveReplyToId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(postId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmitReply = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const newComment = await api.addComment(postId, replyText.trim(), parentId);
      if (parentId) {
        // Append to parent
        setComments(comments.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        }));
      } else {
        setComments([...comments, newComment]);
      }
      setReplyText('');
      setActiveReplyToId(null);
      showToast('Reply added to discussion! 💬');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit comment');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl">
            {toastMessage}
          </div>
        )}

        {/* Back Link */}
        <Link
          to={`/post/${postId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Post</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Discussion Thread</h2>
            <p className="text-xs text-slate-500 mt-0.5">React CRUD with Express & MySQL</p>
          </div>

          {loading ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-xs text-slate-500 font-semibold">Loading discussions...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <img
                    src={comment.author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 space-y-3">
                    {/* Root comment bubble */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{comment.author.name}</span>
                        <span className="text-[11px] text-slate-400">2h ago</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold pl-2">
                      <button
                        onClick={() => showToast('Helpful vote recorded!')}
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful {comment.helpfulCount}</span>
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => setActiveReplyToId(activeReplyToId === comment.id ? null : comment.id)}
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </div>

                    {/* Active inline reply input */}
                    {activeReplyToId === comment.id && (
                      <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          autoFocus
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.author.name}...`}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                        >
                          Send
                        </button>
                      </form>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3 pt-1 pl-4 border-l-2 border-slate-200">
                        <img
                          src={reply.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                          alt={reply.author.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className={`flex-1 p-3.5 rounded-2xl border ${
                          reply.author.isAuthor ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{reply.author.name}</span>
                              {reply.author.isAuthor && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                                  Author
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">45m ago</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Root Reply Box */}
          <form onSubmit={(e) => handleSubmitReply(e)} className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'}
              alt="You"
              className="w-9 h-9 rounded-full object-cover"
            />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              title="Post comment"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
