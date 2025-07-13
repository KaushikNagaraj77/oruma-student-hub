import { tokenManager } from '../utils/tokenManager';
import { Message } from './messagingApi';
import Config from '../utils/config';

export interface WebSocketMessage {
  type: 'message_received' | 'message_read' | 'user_typing' | 'user_online' | 'user_offline' | 
        'post_liked' | 'post_unliked' | 'post_commented' | 'post_saved' | 'post_unsaved' | 'new_post';
  data: any;
}

export interface MessageReceivedEvent {
  message: Message;
}

export interface MessageReadEvent {
  messageId: string;
  conversationId: string;
  readBy: string;
}

export interface UserTypingEvent {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface UserOnlineEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface PostLikedEvent {
  postId: string;
  userId: string;
  likesCount: number;
}

export interface PostCommentedEvent {
  postId: string;
  comment: {
    id: string;
    authorId: string;
    author: string;
    content: string;
    createdAt: string;
  };
  commentsCount: number;
}

export interface PostSavedEvent {
  postId: string;
  userId: string;
}

export interface NewPostEvent {
  post: any; // Post interface from postsApi
}

export type WebSocketEventHandler = (data: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor(private wsUrl: string = Config.WEBSOCKET_URL) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      const token = tokenManager.getToken();
      
      if (!token) {
        this.isConnecting = false;
        reject(new Error('No authentication token available'));
        return;
      }

      try {
        this.ws = new WebSocket(`${this.wsUrl}?token=${token}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(eventType: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: eventType,
        data
      }));
    }
  }

  // Specific methods for messaging events
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.emit('user_typing', {
      conversationId,
      isTyping
    });
  }

  sendMessageRead(messageId: string, conversationId: string): void {
    this.emit('message_read', {
      messageId,
      conversationId
    });
  }

  // Post-related WebSocket methods
  sendPostLike(postId: string, liked: boolean): void {
    this.emit(liked ? 'post_liked' : 'post_unliked', {
      postId
    });
  }

  sendPostComment(postId: string, comment: any): void {
    this.emit('post_commented', {
      postId,
      comment
    });
  }

  sendPostSave(postId: string, saved: boolean): void {
    this.emit(saved ? 'post_saved' : 'post_unsaved', {
      postId
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws?.readyState || null;
  }
}

export const websocketService = new WebSocketService(Config.WEBSOCKET_URL);