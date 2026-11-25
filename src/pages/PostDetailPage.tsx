import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Post, Comment } from '../types';
import { api } from '../services/api';
import { ArrowLeft, ThumbsUp, MessageSquare, Bookmark, Share2, Download, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
const [submittingComment, setSubmittingComment] = useState(false);

const [replyingTo, setReplyingTo] = useState<number | null>(null);
const [replyText, setReplyText] = useState('');
const [submittingReply, setSubmittingReply] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const countAllComments = (items: Comment[]): number => {
  return items.reduce(
    (total, item) => total + 1 + countAllComments(item.replies || []),
    0
  );
};

const totalComments = countAllComments(comments);
const totalReplies = totalComments - comments.length;

const attachments = post?.attachments?.length
  ? post.attachments
  : post?.attachment
    ? [post.attachment]
    : [];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDownload = async (attachment: {
  id?: number;
  name: string;
  url?: string;
}) => {
  if (!attachment.id) {
    showToast('Attachment download ID is missing.');
    return;
  }

  try {
    setDownloadingId(attachment.id);
    await api.downloadAttachment(attachment);
    showToast('Download started successfully!');
  } catch (error: any) {
    showToast(error.message || 'Download failed.');
  } finally {
    setDownloadingId(null);
  }
};

  const loadData = async () => {
    try {
      const postId = id || '1';
      const [postData, commentsData] = await Promise.all([
        api.getPostById(postId),
        api.getComments(postId)
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      console.error('Failed to load post details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleHelpful = async () => {
    if (!post) return;
    try {
      const res = await api.toggleHelpful(post.id);
      setPost({
        ...post,
        helpfulCount: res.helpfulCount,
        hasLiked: res.hasLiked
      });
    } catch (err: any) {
      showToast(err.message || 'Please log in');
    }
  };

  const handleSave = async () => {
    if (!post) return;
    try {
      const res = await api.toggleSave(post.id);
      setPost({ ...post, isSaved: res.isSaved });
      showToast(res.message);
    } catch (err: any) {
      showToast(err.message || 'Please log in');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await api.addComment(post.id, commentText.trim());
      setComments([...comments, newComment]);
      setCommentText('');
      setPost({ ...post, commentsCount: post.commentsCount + 1 });
      showToast('Comment posted successfully! 💬');
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (
  e: React.FormEvent,
  parentCommentId: number
) => {
  e.preventDefault();

  if (!post || !replyText.trim()) return;

  try {
    setSubmittingReply(true);

    const newReply = await api.addComment(
      post.id,
      replyText.trim(),
      parentCommentId
    );

    const insertReply = (items: Comment[]): Comment[] =>
      items.map((comment) => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }

        if (comment.replies?.length) {
          return {
            ...comment,
            replies: insertReply(comment.replies)
          };
        }

        return comment;
      });

    setComments((previous) => insertReply(previous));
    setReplyText('');
    setReplyingTo(null);
    showToast('Reply posted successfully!');
  } catch (err: any) {
    showToast(err.message || 'Failed to post reply');
  } finally {
    setSubmittingReply(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl">
            {toastMessage}
          </div>
        )}

        {/* Back Link */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to feed</span>
        </Link>

        {loading || !post ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-semibold">Loading post details...</p>
          </div>
        ) : (
          <article className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            {/* Author Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={post.author.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900">{post.author.name}</h3>
                  <p className="text-xs text-slate-500">{post.author.meta} • 3h ago</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                {post.type}
              </span>
            </div>

            {/* Post Title & Content */}
            <div className="space-y-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {post.title}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  #{tag}
                </span>
              ))}
              {post.course && (
                <Link
                  to={`/courses/${post.course.code}`}
                  className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                >
                  #{post.course.code}
                </Link>
              )}
            </div>

            {/* Visual Media & Attachment Cards */}
            {/* Dynamic Multiple Attachment Cards */}
{attachments.length > 0 && (
  <div className="space-y-3">
    <h3 className="text-sm font-bold text-slate-900">
      Attached Files ({attachments.length})
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {attachments.map((attachment, index) => {
        const isPdf = attachment.type?.toUpperCase().includes('PDF');

        return (
          <div
            key={attachment.id || index}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                  isPdf
                    ? 'bg-rose-500 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isPdf
                  ? 'PDF'
                  : attachment.type?.split('/').pop()?.toUpperCase().slice(0, 5) || 'FILE'}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {attachment.size} · File {index + 1}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(attachment)}
              disabled={
                downloadingId === attachment.id ||
                !attachment.id
              }
              className="shrink-0 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadingId === attachment.id
                  ? 'Downloading...'
                  : 'Download'}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}

            {/* Engagement Metric Bar */}
            <div className="flex items-center justify-between py-4 border-y border-slate-100 text-xs font-semibold text-slate-600">
              <button
                onClick={handleHelpful}
                className={`flex items-center gap-2 transition-colors ${
                  post.hasLiked ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                <span>{post.helpfulCount} Helpful</span>
              </button>

              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>{totalComments} Comments</span>
              </span>

              <button
                onClick={handleSave}
                className={`flex items-center gap-2 transition-colors ${
                  post.isSaved ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{post.isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied! 📋');
                }}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Comments Thread */}
            {/* Comments Thread */}
<div className="space-y-6 pt-2">

  <div className="flex items-center justify-between">
    <h3 className="font-bold text-base text-slate-900">
      Comments ({comments.length})
    </h3>

    <span className="text-xs text-slate-500">
      {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'} · {totalComments} total
    </span>
  </div>

  {/* Add Main Comment */}
  <form onSubmit={handleAddComment} className="flex items-start gap-3">
    <img
      src={user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'}
      className="w-9 h-9 rounded-full object-cover shrink-0"
      alt="Current User"
    />

    <div className="flex-1 flex gap-2">
      <input
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a comment..."
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
        disabled={submittingComment}
      />

      <button
        type="submit"
        disabled={!commentText.trim() || submittingComment}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
      >
        <span>{submittingComment ? 'Sending...' : 'Send'}</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </div>
  </form>

  {/* Recursive Comment Renderer */}
  <div className="space-y-5">

    {comments.length === 0 ? (
      <p className="text-sm text-slate-400 text-center py-6">
        No comments yet. Be the first to comment!
      </p>
    ) : (
      comments.map((comment) => {
        const renderComment = (
          item: Comment,
          level: number = 0
        ): React.ReactNode => (
          <div
            key={item.id}
            className="space-y-3"
            style={{
              marginLeft: level > 0 ? '24px' : '0px'
            }}
          >
            <div className="flex items-start gap-3">
              <img
                src={item.author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                className="w-9 h-9 rounded-full object-cover shrink-0"
                alt={item.author.name}
              />

              <div className="flex-1 min-w-0">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">

                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs text-slate-900">
                      {item.author.name}
                    </h4>

                    {item.author.isAuthor && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white uppercase">
                        Author
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {item.author.meta}
                  </p>

                  <p className="text-xs text-slate-700 pt-1 leading-relaxed whitespace-pre-wrap break-words">
                    {item.content}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold pl-2 mt-2">
                  <span>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(
                        replyingTo === item.id ? null : item.id
                      );
                      setReplyText('');
                    }}
                    className="hover:text-blue-600"
                  >
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {replyingTo === item.id && (
                  <form
                    onSubmit={(e) => handleAddReply(e, item.id)}
                    className="flex gap-2 mt-3"
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${item.author.name}...`}
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                      disabled={submittingReply}
                    />

                    <button
                      type="submit"
                      disabled={!replyText.trim() || submittingReply}
                      className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                    >
                      {submittingReply ? '...' : 'Reply'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Nested Replies */}
            {item.replies && item.replies.length > 0 && (
              <div className="space-y-4 border-l-2 border-blue-100 pl-3">
                {item.replies.map((reply) =>
                  renderComment(reply, level + 1)
                )}
              </div>
            )}
          </div>
        );

        return (
          <div key={comment.id} className="pb-4 border-b border-slate-100">
            {renderComment(comment)}
          </div>
        );
      })
    )}

  </div>
</div>
          </article>
        )}
      </main>
    </div>
  );
};
