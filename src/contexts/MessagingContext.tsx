import React, { createContext, useContext, useState, useEffect } from 'react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

interface MessagingContextType {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  sendMessage: (conversationId: string, content: string, receiverId: string) => void;
  markAsRead: (conversationId: string) => void;
  startConversation: (userId: string) => string;
  getConversationId: (userId: string) => string | null;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

// Mock users data
const mockUsers = [
  { id: '1', name: 'John Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: '2', name: 'Emma Davis', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9b0c007?w=150&h=150&fit=crop&crop=face' },
  { id: '3', name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { id: '4', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: '5', name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1474176857210-7287d38d27c6?w=150&h=150&fit=crop&crop=face' }
];

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv1',
      participants: ['1', '2'],
      lastMessage: {
        id: 'msg1',
        senderId: '2',
        receiverId: '1',
        content: 'Hey! Are you still looking for a study partner for the calculus exam?',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'delivered'
      },
      unreadCount: 1,
      updatedAt: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: 'conv2',
      participants: ['1', '3'],
      lastMessage: {
        id: 'msg2',
        senderId: '1',
        receiverId: '3',
        content: 'Thanks for the textbook! Really appreciate it 📚',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'read'
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'conv3',
      participants: ['1', '4'],
      lastMessage: {
        id: 'msg3',
        senderId: '4',
        receiverId: '1',
        content: 'The apartment viewing is confirmed for tomorrow at 2pm',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'read'
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({
    'conv1': [
      {
        id: 'msg1a',
        senderId: '2',
        receiverId: '1',
        content: 'Hi John! I saw your post about needing a study group',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg1b',
        senderId: '1',
        receiverId: '2',
        content: 'Yes! I\'m really struggling with derivatives',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg1c',
        senderId: '2',
        receiverId: '1',
        content: 'Perfect! I\'m pretty good at those. Want to meet at the library tomorrow?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg1',
        senderId: '2',
        receiverId: '1',
        content: 'Hey! Are you still looking for a study partner for the calculus exam?',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'delivered'
      }
    ],
    'conv2': [
      {
        id: 'msg2a',
        senderId: '3',
        receiverId: '1',
        content: 'Hey, I have the textbook you need for organic chemistry',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg2b',
        senderId: '1',
        receiverId: '3',
        content: 'Really? That would be amazing! How much?',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg2c',
        senderId: '3',
        receiverId: '1',
        content: 'Just $50, it\'s in great condition',
        timestamp: new Date(Date.now() - 2.2 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg2',
        senderId: '1',
        receiverId: '3',
        content: 'Thanks for the textbook! Really appreciate it 📚',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'read'
      }
    ],
    'conv3': [
      {
        id: 'msg3a',
        senderId: '1',
        receiverId: '4',
        content: 'Hi! I\'m interested in the apartment listing you posted',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg3b',
        senderId: '4',
        receiverId: '1',
        content: 'Great! It\'s a 2-bedroom near campus. When would you like to see it?',
        timestamp: new Date(Date.now() - 24.5 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'msg3',
        senderId: '4',
        receiverId: '1',
        content: 'The apartment viewing is confirmed for tomorrow at 2pm',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'read'
      }
    ]
  });

  const sendMessage = (conversationId: string, content: string, receiverId: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: '1', // Current user
      receiverId,
      content,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
        : conv
    ));

    // Simulate delivery after 1 second
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      }));
    }, 1000);
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const startConversation = (userId: string) => {
    const existingConv = conversations.find(conv => 
      conv.participants.includes('1') && conv.participants.includes(userId)
    );
    
    if (existingConv) {
      return existingConv.id;
    }

    const newConvId = `conv_${Date.now()}`;
    const newConversation: Conversation = {
      id: newConvId,
      participants: ['1', userId],
      unreadCount: 0,
      updatedAt: new Date()
    };

    setConversations(prev => [newConversation, ...prev]);
    setMessages(prev => ({ ...prev, [newConvId]: [] }));
    
    return newConvId;
  };

  const getConversationId = (userId: string) => {
    const conv = conversations.find(conv => 
      conv.participants.includes('1') && conv.participants.includes(userId)
    );
    return conv?.id || null;
  };

  const value = {
    conversations,
    messages,
    sendMessage,
    markAsRead,
    startConversation,
    getConversationId
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export { mockUsers };