import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Conversation, Message, NotificationType } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import Spinner from '../components/Spinner';

const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { notifications } = useNotifications();
  
  const selectedConversation = conversations.find(c => c.id === conversationId);

  useEffect(() => {
    if (user) {
      api.getConversations(user.id).then(setConversations).finally(() => setLoadingConvos(false));
    }
  }, [user]);
  
  const fetchMessages = useCallback(async (convoId: string) => {
    setLoadingMsgs(true);
    const msgs = await api.getMessages(convoId);
    setMessages(msgs);
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      if (user) api.markConversationRead(conversationId, user.id);
    }
  }, [conversationId, fetchMessages]);
  
  // Polling for new conversations and messages (simple interval-based)
  useEffect(() => {
    if (!user) return;
    if (isPolling) return;
    setIsPolling(true);
    const interval = setInterval(async () => {
      const convos = await api.getConversations(user.id);
      setConversations(convos);
      if (conversationId) {
        const msgs = await api.getMessages(conversationId);
        setMessages(msgs);
      }
    }, 10000); // 10s
    return () => { clearInterval(interval); setIsPolling(false); };
  }, [user, conversationId, isPolling]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Typing indicator: set typing while user is entering, fetch typing state on interval
  useEffect(() => {
    if (!selectedConversation || !user) return;
    const interval = setInterval(async () => {
      const typingUserId = await api.getTyping(selectedConversation.id);
      // update typing flag on the selected conversation
      setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, typingByUserId: typingUserId } : c));
    }, 1500);
    return () => clearInterval(interval);
  }, [selectedConversation, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedConversation || !user) return;
      
      const recipientId = selectedConversation.participantIds.find(id => id !== user.id)!;
      
      await api.sendMessage(selectedConversation.id, user.id, newMessage, recipientId, selectedConversation.productId);
      setNewMessage('');
      fetchMessages(selectedConversation.id); // Re-fetch messages
      api.setTyping(selectedConversation.id, null);
      api.markConversationRead(selectedConversation.id, user.id);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!selectedConversation || !user) return;
    api.setTyping(selectedConversation.id, value ? user.id : null);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden">
      {/* Conversations List */}
      <aside className="w-1/3 border-r dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        {loadingConvos ? <Spinner /> : (
            <div>
            {conversations.map(convo => {
                const otherUserId = convo.participantIds.find(id => id !== user?.id)!;
                const otherUsername = convo.participantUsernames[otherUserId];
                const hasUnread = notifications.some(n => n.type === NotificationType.NEW_MESSAGE && n.relatedId === convo.id && !n.isRead);
                return (
                <div 
                    key={convo.id}
                    onClick={() => navigate(`/dashboard/messages/${convo.id}`)}
                    className={`p-4 cursor-pointer border-l-4 ${convo.id === conversationId ? 'border-brand-blue bg-gray-100 dark:bg-gray-700' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                    <p className="font-semibold">{otherUsername}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{convo.productTitle}</p>
                    <p className={`text-sm truncate ${hasUnread ? 'text-brand-blue font-semibold' : 'text-gray-500 dark:text-gray-500'}`}>{convo.lastMessage.text}</p>
                </div>
                );
            })}
            </div>
        )}
      </aside>
      
      {/* Message View */}
      <main className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="font-bold text-lg">{selectedConversation.participantUsernames[selectedConversation.participantIds.find(id => id !== user?.id)!]}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedConversation.productTitle}</p>
              {selectedConversation.typingByUserId && selectedConversation.typingByUserId !== user?.id && (
                <p className="text-xs text-brand-blue mt-1">Typing...</p>
              )}
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
              {loadingMsgs ? <Spinner/> : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md px-4 py-2 rounded-lg ${msg.senderId === user?.id ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input type="text" value={newMessage} onChange={(e) => handleTyping(e.target.value)} placeholder="Type a message..." className="w-full px-4 py-2 border rounded-full dark:bg-gray-700 dark:border-gray-600"/>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-full font-semibold">Send</button>
              </form>
              {/* Read receipt: if the latest message is sent by current user and isRead by recipient */}
              {messages.length > 0 && user && messages[messages.length - 1].senderId === user.id && messages[messages.length - 1].isRead && (
                <p className="text-xs text-gray-500 mt-2">Seen</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Select a conversation to start messaging.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagingPage;