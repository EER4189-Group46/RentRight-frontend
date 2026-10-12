import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  User,
  Package,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  Search,
  Building2,
  Tag,
  ArrowLeft
} from 'lucide-react';

export default function MessagesPage({ initialRecipient, onNavigate }) {
  const { user, token, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeOtherUser, setActiveOtherUser] = useState(initialRecipient?.user || null);
  const [activeItemContext, setActiveItemContext] = useState(initialRecipient?.item || null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages with active user
  const fetchConversationMessages = async (otherUserId, isSilent = false) => {
    if (!token || !otherUserId) return;
    if (!isSilent) setLoadingMessages(true);

    try {
      const res = await fetch(`/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data.messages || []);
        if (data.data.other_user && !activeOtherUser) {
          setActiveOtherUser(data.data.other_user);
        }
      }
    } catch (err) {
      if (!isSilent) setError('Failed to load conversation history');
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, token]);

  // When initialRecipient is passed (e.g. from Message Provider button)
  useEffect(() => {
    if (initialRecipient?.user) {
      setActiveOtherUser(initialRecipient.user);
      setActiveItemContext(initialRecipient.item || null);
      fetchConversationMessages(initialRecipient.user.id);
    } else if (conversations.length > 0 && !activeOtherUser) {
      // Pick first conversation by default on desktop
      const first = conversations[0];
      setActiveOtherUser({
        id: first.other_user_id,
        name: first.other_user_name,
        role: first.other_user_role,
        email: first.other_user_email,
      });
      if (first.item_id) {
        setActiveItemContext({ id: first.item_id, name: first.item_name });
      }
      fetchConversationMessages(first.other_user_id);
    }
  }, [initialRecipient, conversations]);

  // Periodic polling for active conversation (every 4 seconds)
  useEffect(() => {
    if (!activeOtherUser?.id || !token) return;

    const interval = setInterval(() => {
      fetchConversationMessages(activeOtherUser.id, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeOtherUser, token]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveOtherUser({
      id: conv.other_user_id,
      name: conv.other_user_name,
      role: conv.other_user_role,
      email: conv.other_user_email,
    });
    if (conv.item_id) {
      setActiveItemContext({ id: conv.item_id, name: conv.item_name });
    } else {
      setActiveItemContext(null);
    }
    fetchConversationMessages(conv.other_user_id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeOtherUser?.id || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: activeOtherUser.id,
          item_id: activeItemContext?.id || null,
          content,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Append message locally immediately
      setMessages((prev) => [...prev, data.data]);
      fetchConversations();
    } catch (err) {
      setError(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-sm text-slate-500">Please sign in to send and view rental messages.</p>
        <button
          onClick={() => onNavigate && onNavigate('login')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Messages & Inquiries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Chat directly with item providers and renters regarding equipment availability
          </p>
        </div>

        <button
          onClick={() => {
            fetchConversations();
            if (activeOtherUser?.id) fetchConversationMessages(activeOtherUser.id);
          }}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition"
          title="Refresh Messages"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[600px] max-h-[750px]">
        {/* Left Pane: Conversations List */}
        <div className="lg:col-span-1 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Conversations ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" /> Loading chats...
              </div>
            ) : conversations.length === 0 && !activeOtherUser ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No conversations yet.</p>
                <p className="text-[11px]">Click "Message Provider" on any item listing to start a conversation.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeOtherUser?.id === conv.other_user_id;
                return (
                  <button
                    key={conv.other_user_id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition ${
                      isSelected
                        ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                      {conv.other_user_name ? conv.other_user_name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {conv.other_user_name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.last_message_time).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate">{conv.last_message_content}</p>

                      {conv.item_name && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md truncate max-w-full">
                          <Package className="w-3 h-3 shrink-0" />
                          <span className="truncate">{conv.item_name}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-white">
          {activeOtherUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-sm font-black shadow-sm">
                    {activeOtherUser.name ? activeOtherUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{activeOtherUser.name}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {activeOtherUser.role || 'User'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{activeOtherUser.email || 'Online'}</p>
                  </div>
                </div>

                {activeItemContext && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {activeItemContext.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Item Context Strip (Mobile) */}
              {activeItemContext && (
                <div className="sm:hidden px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 text-xs text-slate-700">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Inquiry about: <strong>{activeItemContext.name}</strong></span>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-slate-50/40">
                {loadingMessages ? (
                  <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" /> Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2 text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">No messages yet with {activeOtherUser.name}.</p>
                    <p className="text-[11px]">Send a message below to start the discussion.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 px-1">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                {error && (
                  <div className="mb-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${activeOtherUser.name}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Select a Conversation</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Choose a chat thread from the left or inquire about an item listing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
