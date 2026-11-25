
import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Send,
  MoreVertical,
Reply,
Trash2,
  MessageSquare,
  Plus,
  ArrowLeft,
  Loader2,
  UserCircle,
  Paperclip,
  X,
  FileText,
  Download,
  CheckCheck,
  Image as ImageIcon
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  api,
  DirectConversation,
  DirectMessage,
  MessageStudent,
  MessageAttachment
} from '../services/api';

function formatFileSize(size: number | null) {
  if (!size) return '';
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageAttachmentPreview({
  attachment,
  onError
}: {
  attachment: MessageAttachment;
  onError: (message: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!attachment.file_type?.startsWith('image/')) return;

    let objectUrl = '';
    let cancelled = false;

    const loadPreview = async () => {
      try {
        const token = localStorage.getItem('universe_token');

        const response = await fetch(
          `/api/messages/attachments/${attachment.id}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {}
          }
        );

        if (!response.ok) {
          throw new Error('Image preview could not be loaded');
        }

        const blob = await response.blob();

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) {
          onError('An attachment preview could not be loaded.');
        }
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id, attachment.file_type]);

  const downloadFile = async () => {
    try {
      await api.downloadMessageAttachment(attachment);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const isImage = attachment.file_type?.startsWith('image/');

  return (
    <div className="mt-2 min-w-0">
      {isImage && previewUrl && (
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="block mb-2"
        >
          <img
            src={previewUrl}
            alt={attachment.file_name}
            className="max-h-64 max-w-full rounded-xl object-contain"
          />
        </a>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-black/5 p-3">
        {isImage ? (
          <ImageIcon className="w-6 h-6 shrink-0 text-emerald-600" />
        ) : (
          <FileText className="w-6 h-6 shrink-0 text-emerald-600" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">
            {attachment.file_name}
          </p>
          <p className="text-[10px] text-slate-500">
            {formatFileSize(attachment.file_size)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void downloadFile()}
          className="p-2 rounded-lg hover:bg-black/10"
          title="Download attachment"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function MessagesPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [selected, setSelected] = useState<DirectConversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [students, setStudents] = useState<MessageStudent[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const [replyingTo, setReplyingTo] =
  useState<DirectMessage | null>(null);

const [openMessageMenuId, setOpenMessageMenuId] =
  useState<number | null>(null);

const [deletingMessageId, setDeletingMessageId] =
  useState<number | null>(null);

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load conversations'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (
    conversationId: number,
    showLoader = false
  ) => {
    if (showLoader) setMessagesLoading(true);

    try {
      const data = await api.getConversationMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load messages'
      );
    } finally {
      if (showLoader) setMessagesLoading(false);
    }
  };

  // Load conversations and refresh the list.
  useEffect(() => {
    void loadConversations();

    const timer = window.setInterval(() => {
      void loadConversations();
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  // Load messages when the selected conversation changes.
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    const conversationId = selected.id;
    let cancelled = false;

    const refreshMessages = async (showLoader = false) => {
      if (showLoader) setMessagesLoading(true);

      try {
        const data = await api.getConversationMessages(conversationId);

        if (!cancelled) {
          setMessages(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load messages'
          );
        }
      } finally {
        if (!cancelled && showLoader) {
          setMessagesLoading(false);
        }
      }
    };

    void refreshMessages(true);

    const timer = window.setInterval(() => {
      void refreshMessages();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selected?.id]);

  // Check whether the other student is typing.
  useEffect(() => {
    if (!selected) {
      setOtherIsTyping(false);
      return;
    }

    const conversationId = selected.id;
    let cancelled = false;

    const checkTyping = async () => {
      try {
        const status = await api.getTypingStatus(conversationId);

        if (!cancelled) {
          setOtherIsTyping(status);
        }
      } catch {
        if (!cancelled) {
          setOtherIsTyping(false);
        }
      }
    };

    void checkTyping();

    const timer = window.setInterval(() => {
      void checkTyping();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      setOtherIsTyping(false);

      clearTypingTimeout();

      // Stop typing status for the previous conversation.
      void api.setTypingStatus(conversationId, false).catch(() => {});
    };
  }, [selected?.id]);

  // Scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search students.
  useEffect(() => {
    if (!showNewMessage || search.trim().length < 2) {
      setStudents([]);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSearching(true);

      try {
        const results = await api.searchMessageStudents(search.trim());

        if (!cancelled) {
          setStudents(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Student search failed'
          );
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, showNewMessage]);

  const openConversation = (conversation: DirectConversation) => {
    clearTypingTimeout();

    setSelected(conversation);
    setShowNewMessage(false);
    setSearch('');
    setMessage('');
    setReplyingTo(null);
setOpenMessageMenuId(null);
    setError('');
    setSelectedFiles([]);
  };

  // Start a new conversation.
  const startConversation = async (student: MessageStudent) => {
    try {
      setError('');

      const conversationId = await api.createConversation(student.id);
      const updated = await api.getConversations();

      setConversations(updated);

      let conversation = updated.find(
        item => item.id === conversationId
      );

      if (!conversation) {
        conversation = {
          id: conversationId,
          type: 'DIRECT',
          other_user_id: student.id,
          other_user_name: student.name,
          other_user_email: student.email,
          other_student_id: student.student_id,
          other_user_department: student.department,
          other_user_batch: student.batch,
          other_user_avatar: student.avatar_url,
          unread_count: 0
        };
      }

      clearTypingTimeout();

      setSelected(conversation);
      setShowNewMessage(false);
      setSearch('');
      setMessage('');
      setReplyingTo(null);
setOpenMessageMenuId(null);
      setSelectedFiles([]);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not start conversation'
      );
    }
  };

  // Handle attachment selection.
  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 50 * 1024 * 1024;

    if (selectedFiles.length + files.length > 10) {
      setError('You can attach a maximum of 10 files.');
      event.target.value = '';
      return;
    }

    const oversizedFile = files.find(file => file.size > maxSize);

    if (oversizedFile) {
      setError(`${oversizedFile.name} exceeds the 50 MB file limit.`);
      event.target.value = '';
      return;
    }

    setSelectedFiles(previous => [...previous, ...files]);
    setError('');
    event.target.value = '';
  };

  // Update typing status while composing a message.
  const updateTyping = (value: string) => {
    setMessage(value);

    if (!selected) return;

    const conversationId = selected.id;

    clearTypingTimeout();

    if (!value.trim()) {
      void api.setTypingStatus(conversationId, false).catch(() => {});
      return;
    }

    void api.setTypingStatus(conversationId, true).catch(() => {});

    typingTimeoutRef.current = window.setTimeout(() => {
      void api.setTypingStatus(conversationId, false).catch(() => {});
      typingTimeoutRef.current = null;
    }, 3000);
  };

  // Remove a selected attachment.
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(previous =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Send message.
  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    const body = message.trim();

    if (
      (!body && selectedFiles.length === 0) ||
      !selected ||
      sending
    ) {
      return;
    }

    const conversationId = selected.id;

    setSending(true);
    setError('');

    clearTypingTimeout();

    // Immediately stop the typing indicator when sending.
    void api.setTypingStatus(conversationId, false).catch(() => {});

    try {
      const sent = await api.sendDirectMessage(
  conversationId,
  body,
  selectedFiles,
  replyingTo?.id ?? null
);

      setMessages(previous => {
        if (previous.some(item => item.id === sent.id)) {
          return previous;
        }

        return [...previous, sent];
      });

      setMessage('');
      setSelectedFiles([]);

      setReplyingTo(null);
setOpenMessageMenuId(null);

      void loadConversations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Message could not be sent'
      );
    } finally {
      setSending(false);
    }
  };

  // Reply to a message.
const replyToMessage = (item: DirectMessage) => {
  setReplyingTo(item);
  setOpenMessageMenuId(null);
};

// Cancel reply.
const cancelReply = () => {
  setReplyingTo(null);
};

// Permanently delete your own message.
const deleteMessage = async (item: DirectMessage) => {
  if (!isMine(item.sender_id)) {
    setError('You can only delete your own messages.');
    return;
  }

  const confirmed = window.confirm(
    'Permanently delete this message for both participants? This action cannot be undone.'
  );

  if (!confirmed) return;

  setDeletingMessageId(item.id);
  setError('');

  try {
    await api.deleteDirectMessage(item.id);

    setMessages(previous =>
      previous.filter(message => message.id !== item.id)
    );

    if (replyingTo?.id === item.id) {
      setReplyingTo(null);
    }

    setOpenMessageMenuId(null);

    await loadConversations();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Could not delete message.'
    );
  } finally {
    setDeletingMessageId(null);
  }
};

  const formatTime = (value?: string | null) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateLabel = (value: string) => {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isMine = (senderId: number) => {
    return Number(senderId) === Number(user?.id);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-800">
      <Navbar />

      <div className="max-w-7xl mx-auto flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-slate-500 text-sm mt-1">
              Have private conversations with other students.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-3 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="h-[calc(100vh-190px)] min-h-[500px] flex overflow-hidden rounded-2xl border border-slate-200 bg-white">

            {/* Conversation list */}
            <section
              className={`${
                selected ? 'hidden md:flex' : 'flex'
              } w-full md:w-80 lg:w-96 flex-col border-r border-slate-200`}
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold">Conversations</h2>

                <button
                  onClick={() => {
                    clearTypingTimeout();
                    setShowNewMessage(true);
                    setSelected(null);
                    setSearch('');
                  }}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-white"
                  title="New message"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* New message / student search */}
              {showNewMessage && (
                <div className="p-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => {
                        setShowNewMessage(false);
                        setSearch('');
                      }}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <span className="font-medium text-sm">
                      New message
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />

                    <input
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder="Search students..."
                      className="w-full rounded-xl bg-slate-100 border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {searching && (
                      <div className="p-3 text-center text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Searching...
                      </div>
                    )}

                    {!searching &&
                      search.trim().length >= 2 &&
                      students.length === 0 && (
                        <p className="p-3 text-sm text-slate-500">
                          No students found.
                        </p>
                      )}

                    {students.map(student => (
                      <button
                        key={student.id}
                        onClick={() => void startConversation(student)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-left"
                      >
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-10 h-10 text-slate-500" />
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {student.student_id} · {student.department}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing conversations */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-600 font-medium">
                      No conversations yet
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      Start a new message with a student.
                    </p>
                  </div>
                ) : (
                  conversations.map(conversation => (
                    <button
                      key={conversation.id}
                      onClick={() => openConversation(conversation)}
                      className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition ${
                        selected?.id === conversation.id
                          ? 'bg-slate-100'
                          : ''
                      }`}
                    >
                      {conversation.other_user_avatar ? (
                        <img
                          src={conversation.other_user_avatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-11 h-11 text-slate-500" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {conversation.other_user_name}
                          </p>

                          <span className="text-[10px] text-slate-500">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 truncate mt-1">
                          {conversation.last_message ||
                            'Start a conversation'}
                        </p>
                      </div>

                      {conversation.unread_count > 0 && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-emerald-600 text-xs flex items-center justify-center text-white">
                          {conversation.unread_count}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Message area */}
            <section
              className={`${
                selected ? 'flex' : 'hidden md:flex'
              } flex-1 min-w-0 flex-col`}
            >
              {selected ? (
                <>
                  {/* Conversation header */}
                  <div className="h-[76px] px-4 border-b border-slate-200 bg-white shadow-sm flex items-center gap-3">
                    <button
                      onClick={() => setSelected(null)}
                      className="md:hidden text-slate-500 hover:text-slate-900"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {selected.other_user_avatar ? (
                      <img
                        src={selected.other_user_avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-10 h-10 text-slate-500" />
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {selected.other_user_name}
                      </p>

                      <p className="text-xs text-slate-500 truncate">
                        {selected.other_student_id} · {selected.other_user_department}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
                    {messagesLoading ? (
                      <div className="text-center text-slate-500 pt-10">
                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <MessageSquare className="w-12 h-12 text-slate-400 mb-3" />

                        <p className="text-slate-600 font-medium">
                          Start the conversation
                        </p>

                        <p className="text-slate-500 text-sm mt-1">
                          Send your first private message.
                        </p>
                      </div>
                    ) : (
                      messages.map((item, index) => {
                        const currentDate = new Date(item.created_at);

                        const previousDate =
                          index > 0
                            ? new Date(messages[index - 1].created_at)
                            : null;

                        const showDate =
                          !previousDate ||
                          currentDate.toDateString() !==
                            previousDate.toDateString();

                        return (
                          <React.Fragment key={item.id}>
                            {showDate && (
                              <div className="flex justify-center py-3">
                                <span className="bg-white/90 text-slate-500 text-[11px] px-4 py-1.5 rounded-full shadow-sm">
                                  {formatDateLabel(item.created_at)}
                                </span>
                              </div>
                            )}

                            <div
                              className={`flex ${
                                isMine(item.sender_id)
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >
                              <div
  className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
    isMine(item.sender_id)
      ? 'bg-[#d9fdd3] text-slate-800 rounded-br-md'
      : 'bg-white text-slate-800 rounded-bl-md'
  }`}
>
  {/* Message actions */}
  <div className="flex items-center justify-end gap-2 mb-1">
    <button
      type="button"
      onClick={() => replyToMessage(item)}
      className="p-1 rounded-md text-slate-500 hover:bg-black/10"
      title="Reply"
    >
      <Reply className="w-4 h-4" />
    </button>

    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpenMessageMenuId(
            openMessageMenuId === item.id ? null : item.id
          )
        }
        className="p-1 rounded-md text-slate-500 hover:bg-black/10"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {openMessageMenuId === item.id && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          <button
            type="button"
            onClick={() => replyToMessage(item)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>

          {isMine(item.sender_id) && (
            <button
              type="button"
              disabled={deletingMessageId === item.id}
              onClick={() => void deleteMessage(item)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deletingMessageId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete for everyone
            </button>
          )}
        </div>
      )}
    </div>
  </div>

  {/* Original message being replied to */}
  {item.reply_to_message_id && (
    <div className="mb-2 rounded-lg border-l-4 border-emerald-500 bg-black/5 px-3 py-2">
      <p className="text-[11px] font-semibold text-emerald-700">
        {item.reply_to_sender_name || 'Original sender'}
      </p>

      <p className="text-xs text-slate-600 whitespace-pre-wrap break-words line-clamp-3">
        {item.reply_to_body || 'Original message unavailable'}
      </p>
    </div>
  )}

  {/* Message text */}
  {item.body && (
    <p className="text-sm whitespace-pre-wrap break-words">
      {item.body}
    </p>
  )}

  {/* Attachments */}
  {item.attachments?.map(attachment => (
    <MessageAttachmentPreview
      key={attachment.id}
      attachment={attachment}
      onError={setError}
    />
  ))}

  {/* Time and read receipt */}
  <div className="flex items-center justify-end gap-1 mt-1">
    <span className="text-[10px] text-slate-500">
      {formatTime(item.created_at)}
    </span>

    {isMine(item.sender_id) && (
      <CheckCheck
        className={`w-4 h-4 ${
          Number(item.is_read) === 1
            ? 'text-blue-500'
            : 'text-slate-400'
        }`}
      />
    )}
  </div>
</div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    )}

                    <div ref={bottomRef} />
                  </div>

                  {/* Message composer */}
                  <form
                    onSubmit={sendMessage}
                    className="p-3 md:p-4 border-t border-slate-200 bg-white"
                  >

                    {/* Reply preview */}
{replyingTo && (
  <div className="mb-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
    <div className="w-1 self-stretch rounded-full bg-emerald-600" />

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
        <Reply className="w-4 h-4" />
        Replying to {replyingTo.sender_name}
      </div>

      <p className="text-xs text-slate-600 truncate mt-1">
        {replyingTo.body ||
          (replyingTo.attachments?.length
            ? 'Attachment'
            : 'Message')}
      </p>
    </div>

    <button
      type="button"
      onClick={cancelReply}
      className="p-2 rounded-lg hover:bg-emerald-100 text-slate-500"
      title="Cancel reply"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
)}
                    {/* Typing indicator */}
                    {otherIsTyping && (
                      <div className="px-3 pb-2 text-xs text-emerald-600 font-medium animate-pulse">
                        {selected.other_user_name} is typing...
                      </div>
                    )}

                    {/* Selected attachments */}
                    {selectedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 max-w-full"
                          >
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}

                            <span className="text-xs text-slate-700 truncate max-w-40">
                              {file.name}
                            </span>

                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              className="text-slate-500 hover:text-red-600"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm"
                        onChange={handleFileSelection}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        disabled={sending || selectedFiles.length >= 10}
                        className="p-3 rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                        title="Attach files"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>

                      <input
                        value={message}
                        onChange={event =>
                          updateTyping(event.target.value)
                        }
                        placeholder="Write a message..."
                        maxLength={5000}
                        className="flex-1 min-w-0 rounded-full bg-[#f0f2f5] border border-transparent px-5 py-3 text-sm outline-none focus:border-emerald-500"
                      />

                      <button
                        type="submit"
                        disabled={
                          (!message.trim() &&
                            selectedFiles.length === 0) ||
                          sending
                        }
                        className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition text-white"
                        title="Send message"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-2 ml-2">
                      Up to 10 files · Maximum 50 MB per file
                    </p>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-emerald-600" />
                  </div>

                  <h3 className="text-lg font-semibold">
                    Your messages
                  </h3>

                  <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    Select a conversation or start a new one to message another student privately.
                  </p>

                  <button
                    onClick={() => {
                      setShowNewMessage(true);
                      setSearch('');
                    }}
                    className="mt-5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white"
                  >
                    New message
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
