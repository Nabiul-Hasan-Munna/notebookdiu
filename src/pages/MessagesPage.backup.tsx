import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Send,
  MessageSquare,
  Plus,
  ArrowLeft,
  Loader2,
  UserCircle
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api, DirectConversation, DirectMessage, MessageStudent } from '../services/api';

export function MessagesPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [selected, setSelected] = useState<DirectConversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [students, setStudents] = useState<MessageStudent[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number, showLoader = false) => {
    if (showLoader) setMessagesLoading(true);
    try {
      const data = await api.getConversationMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
    } finally {
      if (showLoader) setMessagesLoading(false);
    }
  };

  useEffect(() => {
    void loadConversations();
    const timer = window.setInterval(() => void loadConversations(), 10000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    void loadMessages(selected.id, true);
    const timer = window.setInterval(() => {
      void loadMessages(selected.id);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [selected?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!showNewMessage || search.trim().length < 2) {
      setStudents([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await api.searchMessageStudents(search.trim());
        setStudents(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Student search failed');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, showNewMessage]);

  const openConversation = (conversation: DirectConversation) => {
    setSelected(conversation);
    setShowNewMessage(false);
    setSearch('');
    setError('');
  };

  const startConversation = async (student: MessageStudent) => {
    try {
      setError('');
      const conversationId = await api.createConversation(student.id);
      const updated = await api.getConversations();
      setConversations(updated);

      let conversation = updated.find(item => item.id === conversationId);

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

      setSelected(conversation);
      setShowNewMessage(false);
      setSearch('');
      setStudents([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start conversation');
    }
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    const body = message.trim();
    if (!body || !selected || sending) return;

    setSending(true);
    setError('');

    try {
      const sent = await api.sendDirectMessage(selected.id, body);
      setMessages(previous => [...previous, sent]);
      setMessage('');
      void loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message could not be sent');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMine = (senderId: number) => Number(senderId) === Number(user?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-slate-400 text-sm mt-1">
              Have private conversations with other students.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-3 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="h-[calc(100vh-190px)] min-h-[500px] flex overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <section className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-slate-800`}>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="font-semibold">Conversations</h2>
                <button
                  onClick={() => {
                    setShowNewMessage(true);
                    setSelected(null);
                    setSearch('');
                  }}
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
                  title="New message"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showNewMessage && (
                <div className="p-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => {
                        setShowNewMessage(false);
                        setSearch('');
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-sm">New message</span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder="Search students..."
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {searching && (
                      <div className="p-3 text-center text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Searching...
                      </div>
                    )}

                    {!searching && search.trim().length >= 2 && students.length === 0 && (
                      <p className="p-3 text-sm text-slate-500">No students found.</p>
                    )}

                    {students.map(student => (
                      <button
                        key={student.id}
                        onClick={() => void startConversation(student)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left"
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
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {student.student_id} · {student.department}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-300 font-medium">No conversations yet</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Start a new message with a student.
                    </p>
                  </div>
                ) : (
                  conversations.map(conversation => (
                    <button
                      key={conversation.id}
                      onClick={() => openConversation(conversation)}
                      className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-800/70 hover:bg-slate-800/70 transition ${
                        selected?.id === conversation.id ? 'bg-slate-800' : ''
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
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {conversation.last_message || 'Start a conversation'}
                        </p>
                      </div>

                      {conversation.unread_count > 0 && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-xs flex items-center justify-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className={`${selected ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col`}>
              {selected ? (
                <>
                  <div className="h-[70px] px-4 border-b border-slate-800 flex items-center gap-3">
                    <button
                      onClick={() => setSelected(null)}
                      className="md:hidden text-slate-400 hover:text-white"
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
                      <p className="font-semibold truncate">{selected.other_user_name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {selected.other_student_id} · {selected.other_user_department}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messagesLoading ? (
                      <div className="text-center text-slate-500 pt-10">
                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-slate-300 font-medium">Start the conversation</p>
                        <p className="text-slate-500 text-sm mt-1">
                          Send your first private message.
                        </p>
                      </div>
                    ) : (
                      messages.map(item => (
                        <div
                          key={item.id}
                          className={`flex ${isMine(item.sender_id) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isMine(item.sender_id)
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-slate-800 text-slate-100 rounded-bl-md'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{item.body}</p>
                            <p className={`text-[10px] mt-1 text-right ${
                              isMine(item.sender_id) ? 'text-indigo-200' : 'text-slate-500'
                            }`}>
                              {formatTime(item.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <form onSubmit={sendMessage} className="p-3 md:p-4 border-t border-slate-800 flex items-center gap-3">
                    <input
                      value={message}
                      onChange={event => setMessage(event.target.value)}
                      placeholder="Write a message..."
                      maxLength={5000}
                      className="flex-1 min-w-0 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      title="Send message"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Your messages</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    Select a conversation or start a new one to message another student privately.
                  </p>
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="mt-5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
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
