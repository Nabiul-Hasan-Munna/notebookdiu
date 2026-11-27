import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  FileText,
  ExternalLink,
    Pencil,
    CheckCircle ,
    Loader2,
  X,
  Save,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Post, Comment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';



interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated }) => {
  const [helpfulCount, setHelpfulCount] = useState(post.helpfulCount);
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const actionMenuRef = useRef<HTMLDivElement>(null);

  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const { user: currentUser } = useAuth();

const isOwner = currentUser?.id === post.author.id;

const [isEditing, setIsEditing] = useState(false);
const [isUpdating, setIsUpdating] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showActionMenu, setShowActionMenu] = useState(false);
const [showComments, setShowComments] = useState(false);
const [comments, setComments] = useState<Comment[]>([]);
const [newCommentsCount, setNewCommentsCount] = useState(0);
const [replyingTo, setReplyingTo] = useState<number | null>(null);
const [replyText, setReplyText] = useState('');
const [submittingReply, setSubmittingReply] = useState(false);
const [commentText, setCommentText] = useState('');
const [loadingComments, setLoadingComments] = useState(false);
const [submittingComment, setSubmittingComment] = useState(false);

const [editTitle, setEditTitle] = useState('');
const [editContent, setEditContent] = useState('');
const [editType, setEditType] = useState<Post['type']>('Knowledge');
const [editCourseCode, setEditCourseCode] = useState('');
const [editTags, setEditTags] = useState('');
const [editFiles, setEditFiles] = useState<File[]>([]);

const handleStartEdit = () => {
  setEditTitle(post.title);
  setEditContent(post.content);
  setEditType(post.type);
  setEditCourseCode(post.course?.code || '');
  setEditTags((post.tags || []).join(', '));
  setEditFiles([]);
  setIsEditing(true);
};
const handleToggleComments = async () => {
  const shouldOpen = !showComments;
  setShowComments(shouldOpen);

  if (shouldOpen) {
    try {
      setLoadingComments(true);
      const data = await api.getComments(post.id);
      setComments(data);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  }
};

const handleAddInlineComment = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!commentText.trim()) return;

  try {
    setSubmittingComment(true);

    const newComment = await api.addComment(
  post.id,
  commentText.trim()
);

setComments(prev => [...prev, newComment]);
setNewCommentsCount(prev => prev + 1);
setCommentText('');

setToastMessage('Comment posted successfully!');
  } catch (error: any) {
    setToastMessage(error.message || 'Failed to post comment');
  } finally {
    setSubmittingComment(false);
  }
};

const handleAddReply = async (
  e: React.FormEvent,
  parentCommentId: number
) => {
  e.preventDefault();

  if (!replyText.trim()) return;

  try {
    setSubmittingReply(true);

    const newReply = await api.addComment(
      post.id,
      replyText.trim(),
      parentCommentId
    );

    // Recursively insert the reply under its correct parent.
    const insertReply = (items: Comment[]): Comment[] =>
      items.map(comment => {
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

    setComments(prev => insertReply(prev));

    setNewCommentsCount(prev => prev + 1);
    setReplyText('');
    setReplyingTo(null);
    setToastMessage('Reply posted successfully!');
  } catch (error: any) {
    setToastMessage(error.message || 'Failed to post reply');
  } finally {
    setSubmittingReply(false);
  }
};


const attachments = post.attachments?.length
  ? post.attachments
  : post.attachment
    ? [post.attachment]
    : [];

const imageAttachments = attachments.filter(
  attachment => attachment.type?.toLowerCase().startsWith('image/')
);

const documentAttachments = attachments.filter(
  attachment => !attachment.type?.toLowerCase().startsWith('image/')
);



//cancel three dot popup
useEffect(() => {
  if (!showActionMenu) return;

  const handleClickOutside = (event: MouseEvent) => {
    if (
      actionMenuRef.current &&
      !actionMenuRef.current.contains(event.target as Node)
    ) {
      setShowActionMenu(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showActionMenu]);
// Load authenticated image previews

// Load authenticated image and PDF previews
useEffect(() => {
  let cancelled = false;
  const objectUrls: string[] = [];

  const loadPreviews = async () => {
    const previewAttachments = attachments.filter((attachment) => {
      const type = attachment.type?.toLowerCase() || '';

      return (
        attachment.id &&
        (type.startsWith('image/') || type === 'application/pdf')
      );
    });

    const results = await Promise.all(
      previewAttachments.map(async (attachment) => {
        try {
          const url = await api.previewAttachment({
            id: attachment.id
          });

          if (cancelled) {
            URL.revokeObjectURL(url);
            return null;
          }

          objectUrls.push(url);

          return {
            id: attachment.id!,
            url
          };
        } catch (error) {
          console.error(
            `Attachment preview failed for ${attachment.name}:`,
            error
          );
          return null;
        }
      })
    );

    if (!cancelled) {
      const previews: Record<number, string> = {};

      results.forEach((result) => {
        if (result) {
          previews[result.id] = result.url;
        }
      });

      setImageUrls(previews);
    }
  };

  loadPreviews();

  return () => {
    cancelled = true;
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  };
}, [post.attachments, post.attachment]);


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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdatePost = async () => {
  if (!editTitle.trim() || !editContent.trim()) {
    showToast('Title and content are required');
    return;
  }

  try {
    setIsUpdating(true);

    await api.updatePost(post.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      type: editType,
      courseCode: editCourseCode.trim(),
      tags: editTags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      files: editFiles
    });

    setIsEditing(false);
    setEditFiles([]);

    showToast('Post updated successfully!');

    onPostUpdated?.();

  } catch (error: any) {
    showToast(error.message || 'Failed to update post');
  } finally {
    setIsUpdating(false);
  }
};

const handleDeletePost = async () => {
  try {
    setIsDeleting(true);

    await api.deletePost(post.id);

    setShowDeleteModal(false);
    onPostUpdated?.();

  } catch (error: any) {
    showToast(error.message || 'Failed to delete post');
  } finally {
    setIsDeleting(false);
  }
};
  const handleHelpful = async () => {
    try {
      const res = await api.toggleHelpful(post.id);
      setHelpfulCount(res.helpfulCount);
      setHasLiked(res.hasLiked);
    } catch (err: any) {
      showToast(err.message || 'Please log in to like');
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.toggleSave(post.id);
      setIsSaved(res.isSaved);
      showToast(res.message);
    } catch (err: any) {
      showToast(err.message || 'Please log in to save');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    showToast('Post link copied to clipboard! ðŸ“‹');
  };

  const getBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'resource':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'knowledge':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'question':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'project':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all relative">
      {/* Toast Alert */}
    {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 z-[9999] flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author.id}`}>
            <img
              src={post.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 hover:ring-blue-400 transition-all"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.author.id}`} className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors">
                {post.author.name}
              </Link>
              <span className="text-xs text-slate-400">â€¢ {post.author.meta.split('â€¢')[1] || 'Batch 43'}</span>
            </div>
            <p className="text-xs text-slate-500">{post.author.meta.split('â€¢')[0] || 'Software Engineering'} â€¢ {new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

                <div className="flex items-center gap-2">
          {isOwner && !isEditing && (
<div className="relative" ref={actionMenuRef}>
    <button
      type="button"
      onClick={() => setShowActionMenu(!showActionMenu)}
      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      aria-label="Post actions"
    >
      <MoreVertical className="w-5 h-5" />
    </button>

    {showActionMenu && (
      <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-xl z-30 py-1">

        <button
          type="button"
          onClick={() => {
            setShowActionMenu(false);
            handleStartEdit();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50"
        >
          <Pencil className="w-4 h-4" />
          Edit Post
        </button>

        <button
          type="button"
          onClick={() => {
            setShowActionMenu(false);
            setShowDeleteModal(true);
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          Delete Post
        </button>

      </div>
    )}
  </div>
)}

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getBadgeStyle(post.type)} flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {post.type}
          </span>
        </div>
      </div>

      {/* Post Content */}
            {/* Edit Post Form */}
      {isEditing && isOwner && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleUpdatePost();
          }}
          className="space-y-4 border border-blue-200 bg-blue-50/40 rounded-xl p-4"
        >
          <h3 className="font-bold text-sm text-slate-800">
            Edit Your Post
          </h3>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Content
            </label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Post Type
            </label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as Post['type'])}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="Knowledge">Knowledge</option>
              <option value="Resource">Resource</option>
              <option value="Question">Question</option>
              <option value="Project">Project</option>
              <option value="Link">Link</option>
              <option value="Media">Media</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Course Code
            </label>
            <input
              type="text"
              value={editCourseCode}
              onChange={(e) => setEditCourseCode(e.target.value)}
              placeholder="e.g. SE-322"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="React, JavaScript, Programming"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Add More Attachments
            </label>
            <input
              type="file"
              multiple
              onChange={(e) =>
                setEditFiles(Array.from(e.target.files || []))
              }
              className="w-full text-xs"
            />
            {editFiles.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {editFiles.length} new file(s) selected
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Post Content */}
      {!isEditing && (
        <>
          <div className="space-y-2">
            <Link to={`/post/${post.id}`} className="block group">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {post.content}
              </p>
            </Link>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(post.tags || []).map((tag, idx) => (
              <Link
                key={idx}
                to={`/explore?search=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                #{tag}
              </Link>
            ))}

            {post.course && (
              <Link
                to={`/courses/${post.course.code}`}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                #{post.course.code}
              </Link>
            )}
          </div>
        </>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {post.tags.map((tag, idx) => (
          <Link
            key={idx}
            to={`/explore?search=${encodeURIComponent(tag)}`}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            #{tag}
          </Link>
        ))}
        {post.course && (
          <Link
            to={`/courses/${post.course.code}`}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            #{post.course.code}
          </Link>
        )}
      </div>

      {/* Image Gallery */}
      {imageAttachments.length > 0 && (
        <div className={`grid gap-2 overflow-hidden rounded-xl ${
          imageAttachments.length === 1
            ? 'grid-cols-1'
            : imageAttachments.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
        }`}>
          {imageAttachments.slice(0, 3).map((attachment, index) => {
            const imageUrl = attachment.id
              ? imageUrls[attachment.id]
              : null;

            const isSingle = imageAttachments.length === 1;
            const hasMore = index === 2 && imageAttachments.length > 3;

            return (
              <div
                key={attachment.id || index}
                className={`relative min-w-0 overflow-hidden ${
                  isSingle ? 'rounded-lg' : 'aspect-[4/3] rounded-md'
                }`}
              >
                {imageUrl ? (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className="relative block w-full h-full cursor-zoom-in"
                  >
                    <img
                      src={imageUrl}
                      alt={attachment.name}
                      className={`block w-full ${
                        isSingle
                          ? 'max-h-[420px] object-contain bg-slate-100'
                          : 'h-40 sm:h-52 object-cover'
                      }`}
                    />

                    {hasMore && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xl sm:text-2xl font-semibold">
                        +{imageAttachments.length - 3} more
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-slate-100 text-sm text-slate-500">
                    Loading image preview...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Document Attachments */}
      {documentAttachments.length > 0 && (
        <div className={`grid gap-3 ${
          documentAttachments.length === 1
            ? 'grid-cols-1'
            : documentAttachments.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {documentAttachments.map((attachment, index) => {
            const isPDF =
              attachment.type?.toLowerCase() === 'application/pdf';

            const pdfUrl = attachment.id
              ? imageUrls[attachment.id]
              : null;

            return (
              <div
                key={attachment.id || index}
                className="min-w-0 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                      isPDF ? 'bg-rose-500' : 'bg-blue-600'
                    }`}>
                      {isPDF
                        ? 'PDF'
                        : attachment.type?.split('/').pop()?.toUpperCase().slice(0, 5) || 'FILE'}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {attachment.size} · Document {index + 1}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(attachment)}
                    disabled={downloadingId === attachment.id}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {downloadingId === attachment.id
                      ? 'Downloading...'
                      : 'Download'}
                  </button>
                </div>

                {isPDF && (
                  <details className="text-xs text-slate-600">
                    <summary className="cursor-pointer font-semibold hover:text-blue-600">
                      Preview PDF
                    </summary>
                    <div className="mt-3">
                      {pdfUrl ? (
                        <iframe
                          src={pdfUrl}
                          title={`PDF Preview: ${attachment.name}`}
                          className="w-full h-[350px] border border-slate-200 rounded-lg"
                        />
                      ) : (
                        <p className="py-4 text-center">
                          Loading PDF preview...
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Interaction Footer */}

{/* Full Screen Image Viewer */}
{selectedImage && (
  <div
    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
    onClick={() => setSelectedImage(null)}
  >
    <button
      type="button"
      onClick={() => setSelectedImage(null)}
      className="absolute top-5 right-5 text-white text-3xl hover:text-gray-300"
      aria-label="Close image viewer"
    >
      &times;
    </button>

    <img
      src={selectedImage}
      alt="Enlarged attachment"
      onClick={(event) => event.stopPropagation()}
      className="max-w-full max-h-[90vh] object-contain rounded-lg"
    />
  </div>
)}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1.5 transition-colors ${
            hasLiked ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{helpfulCount} Helpful</span>
        </button>

        <button
  onClick={handleToggleComments}
  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
>
  <MessageSquare className="w-4 h-4" />
  <span>{post.commentsCount + newCommentsCount} Comments</span>
</button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 transition-colors ${
            isSaved ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>


      {/* Expandable Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">

          {loadingComments ? (
            <div className="flex justify-center items-center gap-2 py-5 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading comments...
            </div>
          ) : (
            <>
              
{/* Comments List */}
<div className="space-y-4">
  {comments.length === 0 ? (
    <p className="text-center text-sm text-slate-400 py-4">
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
          className="flex gap-3"
          style={{
            marginLeft: level > 0 ? '12px' : '0px'
          }}
        >
          <img
            src={
              item.author.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
            }
            alt={item.author.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="bg-slate-50 rounded-2xl px-4 py-3">
              <p className="text-xs font-bold text-slate-800">
                {item.author.name}
              </p>

              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap break-words">
                {item.content}
              </p>
            </div>

            <p className="text-[10px] text-slate-400 mt-1 px-3">
              {new Date(item.createdAt).toLocaleString()}
            </p>

            {/* Reply Button */}
            <button
              type="button"
              onClick={() => {
                setReplyingTo(
                  replyingTo === item.id ? null : item.id
                );
                setReplyText('');
              }}
              className="text-xs text-blue-600 font-semibold mt-2 ml-3 hover:text-blue-800"
            >
              Reply
            </button>

            {/* Reply Input */}
            {replyingTo === item.id && (
              <form
                onSubmit={(e) => handleAddReply(e, item.id)}
                className="flex gap-2 mt-3 ml-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${item.author.name}...`}
                  className="flex-1 min-w-0 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs outline-none focus:border-blue-500"
                  disabled={submittingReply}
                />

                <button
                  type="submit"
                  disabled={!replyText.trim() || submittingReply}
                  className="bg-blue-600 text-white px-3 py-2 rounded-full text-xs font-semibold disabled:opacity-50"
                >
                  {submittingReply ? '...' : 'Reply'}
                </button>
              </form>
            )}

            {/* Nested Replies */}
            {item.replies && item.replies.length > 0 && (
              <div className="mt-3 space-y-3 border-l-2 border-slate-100 pl-3">
                {item.replies.map(reply =>
                  renderComment(reply, level + 1)
                )}
              </div>
            )}
          </div>
        </div>
      );

      return renderComment(comment);
    })
  )}
</div>


              {/* Add Comment Form */}
              <form
                onSubmit={handleAddInlineComment}
                className="flex items-center gap-2 pt-2"
              >
                <img
                  src={
                    currentUser?.avatar_url ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
                  }
                  alt={currentUser?.name || 'Your avatar'}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />

                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  disabled={submittingComment}
                />

                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-full text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Post'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Post?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to permanently delete this post?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );


  
};

