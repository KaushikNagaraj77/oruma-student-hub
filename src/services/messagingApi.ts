import { tokenManager } from '../utils/tokenManager';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  conversationId: string;
  failed?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
  hasMore: boolean;
  nextCursor?: string;
}

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

interface CreateConversationRequest {
  participantId: string;
}

interface SendMessageRequest {
  conversationId: string;
  content: string;
  receiverId: string;
}

interface SendMessageResponse {
  message: Message;
}

class MessagingApiService {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private getAuthHeaders(): Record<string, string> {
    const token = tokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getConversations(cursor?: string, limit = 20): Promise<ConversationsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<ConversationsResponse>(`/conversations?${params}`);
  }

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(conversationId: string, cursor?: string, limit = 50): Promise<MessagesResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<MessagesResponse>(`/conversations/${conversationId}/messages?${params}`);
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    return this.request<void>(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    return this.request<void>(`/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    return this.request<User[]>(`/users/search?${params}`);
  }

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }
}

export const messagingApi = new MessagingApiService();