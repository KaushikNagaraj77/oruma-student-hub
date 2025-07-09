import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMessaging, mockUsers } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getUserById = (id: string) => {
  return mockUsers.find(user => user.id === id);
};

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const { conversations, messages, sendMessage, markAsRead } = useMessaging();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(conv => conv.id === conversationId);
  const conversationMessages = conversationId ? messages[conversationId] || [] : [];
  
  const otherParticipant = conversation?.participants.find(p => p !== '1');
  const otherUser = otherParticipant ? getUserById(otherParticipant) : null;

  useEffect(() => {
    if (conversationId && conversation) {
      markAsRead(conversationId);
    }
  }, [conversationId, conversation, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !otherParticipant) return;

    sendMessage(conversationId, newMessage.trim(), otherParticipant);
    setNewMessage('');
  };

  const handleTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Please sign in to view messages.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!conversation || !otherUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Conversation not found.</p>
              <Button asChild className="mt-4">
                <Link to="/messages">Back to Messages</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8 max-w-4xl">
        <Card className="h-[calc(100vh-12rem)]">
          {/* Chat Header */}
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/messages')}
                  className="lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                  <AvatarFallback>
                    {otherUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold">{otherUser.name}</h3>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Avatar className="h-16 w-16 mb-4">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                      <AvatarFallback className="text-xl">
                        {otherUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg mb-2">{otherUser.name}</h3>
                    <p className="text-muted-foreground">
                      Start your conversation with {otherUser.name.split(' ')[0]}
                    </p>
                  </div>
                ) : (
                  <>
                    {conversationMessages.map((message, index) => {
                      const isOwnMessage = message.senderId === '1';
                      const showTimestamp = index === 0 || 
                        (conversationMessages[index - 1].timestamp.getTime() - message.timestamp.getTime()) > 5 * 60 * 1000;

                      return (
                        <div key={message.id}>
                          {showTimestamp && (
                            <div className="text-center text-xs text-muted-foreground my-4">
                              {formatTimestamp(message.timestamp)}
                            </div>
                          )}
                          
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                              {!isOwnMessage && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                  <AvatarFallback className="text-xs">
                                    {otherUser.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <div className={`flex items-center gap-1 mt-1 ${
                                  isOwnMessage ? 'justify-end' : 'justify-start'
                                }`}>
                                  <span className={`text-xs ${
                                    isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    {message.timestamp.toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })}
                                  </span>
                                  {isOwnMessage && (
                                    <div className={`w-2 h-2 rounded-full ml-1 ${
                                      message.status === 'read' ? 'bg-blue-400' :
                                      message.status === 'delivered' ? 'bg-gray-300' :
                                      'bg-gray-400'
                                    }`} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-end gap-2 max-w-[70%]">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                            <AvatarFallback className="text-xs">
                              {otherUser.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-2xl px-4 py-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder={`Message ${otherUser.name.split(' ')[0]}...`}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}