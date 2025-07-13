import { tokenManager } from '../utils/tokenManager';
import Config from '../utils/config';

export interface Post {
  id: string;
  authorId: string;
  author: string;
  username: string;
  university: string;
  time: string;
  location?: string;
  content: string;
  likes: number;
  comments: number;
  saves: number;
  images?: string[];
  liked: boolean;
  saved: boolean;
  type: 'study' | 'food' | 'achievement' | 'event' | 'general';
  hashtags?: string[];
  mentions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  username: string;
  content: string;
  likes: number;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface CreatePostRequest {
  content: string;
  images?: File[];
  type?: string;
  location?: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface CreatePostResponse {
  post: Post;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string; // for replies
}

export interface CreateCommentResponse {
  comment: Comment;
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

class PostsApiService {
  private baseUrl = Config.API_BASE_URL;

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

  private async uploadRequest<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      method: 'POST',
      body: formData,
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

  async getPosts(cursor?: string, limit = 10): Promise<PostsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<PostsResponse>(`${Config.POSTS_ENDPOINT}?${params}`);
  }

  async getPost(postId: string): Promise<Post> {
    return this.request<Post>(`${Config.POSTS_ENDPOINT}/${postId}`);
  }

  async createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      formData.append('content', data.content);
      if (data.type) formData.append('type', data.type);
      if (data.location) formData.append('location', data.location);
      if (data.hashtags) formData.append('hashtags', JSON.stringify(data.hashtags));
      if (data.mentions) formData.append('mentions', JSON.stringify(data.mentions));
      
      data.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      return this.uploadRequest<CreatePostResponse>(Config.POSTS_ENDPOINT, formData);
    } else {
      return this.request<CreatePostResponse>(Config.POSTS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }

  async updatePost(postId: string, data: Partial<CreatePostRequest>): Promise<Post> {
    return this.request<Post>(`${Config.POSTS_ENDPOINT}/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string): Promise<void> {
    return this.request<void>(`${Config.POSTS_ENDPOINT}/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId: string): Promise<LikeResponse> {
    return this.request<LikeResponse>(`${Config.POSTS_ENDPOINT}/${postId}/like`, {
      method: 'POST',
    });
  }

  async savePost(postId: string): Promise<{ saved: boolean }> {
    return this.request<{ saved: boolean }>(`${Config.POSTS_ENDPOINT}/${postId}/save`, {
      method: 'POST',
    });
  }

  async getComments(postId: string, cursor?: string, limit = 20): Promise<CommentsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<CommentsResponse>(`${Config.POSTS_ENDPOINT}/${postId}/comments?${params}`);
  }

  async createComment(postId: string, data: CreateCommentRequest): Promise<CreateCommentResponse> {
    return this.request<CreateCommentResponse>(`${Config.POSTS_ENDPOINT}/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async likeComment(commentId: string): Promise<LikeResponse> {
    return this.request<LikeResponse>(`/api/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    return this.request<void>(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async searchPosts(query: string, cursor?: string, limit = 10): Promise<PostsResponse> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<PostsResponse>(`${Config.POSTS_ENDPOINT}/search?${params}`);
  }

  async getHashtagPosts(hashtag: string, cursor?: string, limit = 10): Promise<PostsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<PostsResponse>(`${Config.POSTS_ENDPOINT}/hashtag/${encodeURIComponent(hashtag)}?${params}`);
  }

  async getUserPosts(userId: string, cursor?: string, limit = 10): Promise<PostsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<PostsResponse>(`/api/users/${userId}/posts?${params}`);
  }

  async uploadImage(file: File): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.uploadRequest<{ url: string; id: string }>('/api/upload/image', formData);
  }
}

export const postsApi = new PostsApiService();