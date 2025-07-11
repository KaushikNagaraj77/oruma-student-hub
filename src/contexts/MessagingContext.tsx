import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { messagingApi, Message, Conversation, User } from '../services/messagingApi';
import { websocketService, MessageReceivedEvent, MessageReadEvent, UserTypingEvent, UserOnlineEvent } from '../services/websocketService';
import { useAuth } from './AuthContext';

interface MessagingContextType {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  users: { [userId: string]: User };
  typingUsers: { [conversationId: string]: string[] };
  onlineUsers: Set<string>;
  isLoading: boolean;
  error: string | null;
  sendMessage: (conversationId: string, content: string, receiverId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  startConversation: (userId: string) => Promise<string>;
  getConversationId: (userId: string) => string | null;
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  retryFailedMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [users, setUsers] = useState<{ [userId: string]: User }>({});
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: string]: string[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationCursors, setConversationCursors] = useState<{ [conversationId: string]: string }>({});
  const [conversationCursor, setConversationCursor] = useState<string | undefined>();
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [pendingMessages, setPendingMessages] = useState<{ [messageId: string]: Message }>({});

  const handleError = useCallback((err: unknown) => {
    console.error('Messaging error:', err);
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const initializeWebSocket = async () => {
      try {
        await websocketService.connect();
      } catch (error) {
        handleError(error);
      }
    };

    initializeWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated, handleError]);

  // Set up WebSocket event handlers
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleMessageReceived = (data: MessageReceivedEvent) => {
      const { message } = data;
      
      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message]
      }));

      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: message.timestamp, unreadCount: conv.unreadCount + 1 }
          : conv
      ));
    };

    const handleMessageRead = (data: MessageReadEvent) => {
      const { messageId, conversationId } = data;
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        ) || []
      }));
    };

    const handleUserTyping = (data: UserTypingEvent) => {
      const { userId, conversationId, isTyping } = data;
      
      setTypingUsers(prev => {
        const currentTyping = prev[conversationId] || [];
        
        if (isTyping) {
          if (!currentTyping.includes(userId)) {
            return { ...prev, [conversationId]: [...currentTyping, userId] };
          }
        } else {
          return { ...prev, [conversationId]: currentTyping.filter(id => id !== userId) };
        }
        
        return prev;
      });
    };

    const handleUserOnline = (data: UserOnlineEvent) => {
      const { userId, isOnline } = data;
      
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    websocketService.on('message_received', handleMessageReceived);
    websocketService.on('message_read', handleMessageRead);
    websocketService.on('user_typing', handleUserTyping);
    websocketService.on('user_online', handleUserOnline);

    return () => {
      websocketService.off('message_received', handleMessageReceived);
      websocketService.off('message_read', handleMessageRead);
      websocketService.off('user_typing', handleUserTyping);
      websocketService.off('user_online', handleUserOnline);
    };
  }, [isAuthenticated]);

  // Load initial conversations
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadInitialConversations = async () => {
      try {
        setIsLoading(true);
        const response = await messagingApi.getConversations();
        setConversations(response.conversations);
        setHasMoreConversations(response.hasMore);
        setConversationCursor(response.nextCursor);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialConversations();
  }, [isAuthenticated, handleError]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await messagingApi.getMessages(conversationId);
      setMessages(prev => ({ ...prev, [conversationId]: response.messages }));
      setConversationCursors(prev => ({ ...prev, [conversationId]: response.nextCursor || '' }));
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const loadMoreMessages = useCallback(async (conversationId: string) => {
    try {
      const cursor = conversationCursors[conversationId];
      if (!cursor) return;

      const response = await messagingApi.getMessages(conversationId, cursor);
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...response.messages, ...(prev[conversationId] || [])]
      }));
      setConversationCursors(prev => ({ ...prev, [conversationId]: response.nextCursor || '' }));
    } catch (error) {
      handleError(error);
    }
  }, [conversationCursors, handleError]);

  const loadMoreConversations = useCallback(async () => {
    if (!hasMoreConversations || !conversationCursor) return;

    try {
      const response = await messagingApi.getConversations(conversationCursor);
      setConversations(prev => [...prev, ...response.conversations]);
      setHasMoreConversations(response.hasMore);
      setConversationCursor(response.nextCursor);
    } catch (error) {
      handleError(error);
    }
  }, [hasMoreConversations, conversationCursor, handleError]);

  const sendMessage = useCallback(async (conversationId: string, content: string, receiverId: string) => {
    if (!user) return;

    const tempMessage: Message = {
      id: `temp_${Date.now()}_${Math.random()}`,
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      conversationId
    };

    // Add message optimistically
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), tempMessage]
    }));

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, lastMessage: tempMessage, updatedAt: tempMessage.timestamp }
        : conv
    ));

    setPendingMessages(prev => ({ ...prev, [tempMessage.id]: tempMessage }));

    try {
      const response = await messagingApi.sendMessage({ conversationId, content, receiverId });
      const { message } = response;

      // Replace temp message with real message
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.map(msg => 
          msg.id === tempMessage.id ? message : msg
        ) || []
      }));

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: message, updatedAt: message.timestamp }
          : conv
      ));

      setPendingMessages(prev => {
        const newPending = { ...prev };
        delete newPending[tempMessage.id];
        return newPending;
      });
    } catch (error) {
      // Mark message as failed
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.map(msg => 
          msg.id === tempMessage.id ? { ...msg, status: 'sent', failed: true } : msg
        ) || []
      }));

      handleError(error);
    }
  }, [user, handleError]);

  const retryFailedMessage = useCallback(async (messageId: string) => {
    const pendingMessage = pendingMessages[messageId];
    if (!pendingMessage) return;

    try {
      const response = await messagingApi.sendMessage({
        conversationId: pendingMessage.conversationId,
        content: pendingMessage.content,
        receiverId: pendingMessage.receiverId
      });

      const { message } = response;

      setMessages(prev => ({
        ...prev,
        [pendingMessage.conversationId]: prev[pendingMessage.conversationId]?.map(msg => 
          msg.id === messageId ? message : msg
        ) || []
      }));

      setPendingMessages(prev => {
        const newPending = { ...prev };
        delete newPending[messageId];
        return newPending;
      });
    } catch (error) {
      handleError(error);
    }
  }, [pendingMessages, handleError]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await messagingApi.markConversationAsRead(conversationId);
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));

      // Send WebSocket event
      const conversationMessages = messages[conversationId] || [];
      const unreadMessages = conversationMessages.filter(msg => msg.status !== 'read' && msg.receiverId === user?.id);
      
      unreadMessages.forEach(msg => {
        websocketService.sendMessageRead(msg.id, conversationId);
      });
    } catch (error) {
      handleError(error);
    }
  }, [messages, user, handleError]);

  const startConversation = useCallback(async (userId: string) => {
    const existingConv = conversations.find(conv => 
      conv.participants.includes(user?.id || '') && conv.participants.includes(userId)
    );
    
    if (existingConv) {
      return existingConv.id;
    }

    try {
      const conversation = await messagingApi.createConversation({ participantId: userId });
      setConversations(prev => [conversation, ...prev]);
      setMessages(prev => ({ ...prev, [conversation.id]: [] }));
      return conversation.id;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [conversations, user, handleError]);

  const getConversationId = useCallback((userId: string) => {
    const conv = conversations.find(conv => 
      conv.participants.includes(user?.id || '') && conv.participants.includes(userId)
    );
    return conv?.id || null;
  }, [conversations, user]);

  const searchUsers = useCallback(async (query: string) => {
    try {
      const searchResults = await messagingApi.searchUsers(query);
      
      // Update users cache
      const userMap = searchResults.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as { [userId: string]: User });
      
      setUsers(prev => ({ ...prev, ...userMap }));
      
      return searchResults;
    } catch (error) {
      handleError(error);
      return [];
    }
  }, [handleError]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    websocketService.sendTypingIndicator(conversationId, isTyping);
  }, []);

  const value = {
    conversations,
    messages,
    users,
    typingUsers,
    onlineUsers,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    startConversation,
    getConversationId,
    loadMessages,
    loadMoreMessages,
    loadMoreConversations,
    searchUsers,
    sendTypingIndicator,
    retryFailedMessage,
    clearError,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};