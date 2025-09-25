import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Conversation, Message } from '../types';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    }
  }, [conversationId, fetchMessages]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedConversation || !user) return;
      
      const recipientId = selectedConversation.participantIds.find(id => id !== user.id)!;
      
      await api.sendMessage(selectedConversation.id, user.id, newMessage, recipientId, selectedConversation.productId);
      setNewMessage('');
      fetchMessages(selectedConversation.id); // Re-fetch messages
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
                return (
                <div 
                    key={convo.id}
                    onClick={() => navigate(`/dashboard/messages/${convo.id}`)}
                    className={`p-4 cursor-pointer border-l-4 ${convo.id === conversationId ? 'border-brand-blue bg-gray-100 dark:bg-gray-700' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                    <p className="font-semibold">{otherUsername}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{convo.productTitle}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 truncate">{convo.lastMessage.text}</p>
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
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="w-full px-4 py-2 border rounded-full dark:bg-gray-700 dark:border-gray-600"/>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-full font-semibold">Send</button>
              </form>
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