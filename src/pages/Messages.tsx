import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMessaging, mockUsers } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { Search, MessageSquare, Clock } from 'lucide-react';

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

const getUserById = (id: string) => {
  return mockUsers.find(user => user.id === id);
};

export default function Messages() {
  const { user } = useAuth();
  const { conversations } = useMessaging();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Please sign in to view your messages.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p !== '1');
    const otherUser = otherParticipant ? getUserById(otherParticipant) : null;
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Messages
                  {totalUnread > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {totalUnread}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  Start a conversation by messaging someone from the marketplace or events!
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(p => p !== '1');
                  const otherUser = otherParticipant ? getUserById(otherParticipant) : null;
                  
                  if (!otherUser) return null;

                  return (
                    <Link
                      key={conversation.id}
                      to={`/messages/${conversation.id}`}
                      className="block hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                            <AvatarFallback>
                              {otherUser.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                {conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {otherUser.name}
                            </h3>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Clock className="h-3 w-3" />
                              {conversation.lastMessage && formatTimestamp(conversation.lastMessage.timestamp)}
                            </div>
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className={`text-sm truncate ${
                              conversation.unreadCount > 0 
                                ? 'text-foreground font-medium' 
                                : 'text-muted-foreground'
                            }`}>
                              {conversation.lastMessage.senderId === '1' && 'You: '}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {conversation.lastMessage && (
                            <div className="flex items-center gap-1">
                              {conversation.lastMessage.senderId === '1' && (
                                <div className={`w-2 h-2 rounded-full ${
                                  conversation.lastMessage.status === 'read' ? 'bg-blue-500' :
                                  conversation.lastMessage.status === 'delivered' ? 'bg-gray-400' :
                                  'bg-gray-300'
                                }`} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}