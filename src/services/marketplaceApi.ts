import { tokenManager } from '../utils/tokenManager';
import Config from '../utils/config';

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  category: string;
  images: string[];
  specifications?: { label: string; value: string }[];
  seller: {
    id: string;
    name: string;
    username: string;
    university: string;
    rating: number;
    reviewCount: number;
    avatar?: string;
  };
  location?: string;
  tags?: string[];
  status: 'available' | 'sold' | 'reserved';
  views: number;
  saves: number;
  saved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceItemsResponse {
  items: MarketplaceItem[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}

export interface CreateItemRequest {
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  images?: File[];
  specifications?: { label: string; value: string }[];
  location?: string;
  tags?: string[];
}

export interface CreateItemResponse {
  item: MarketplaceItem;
}

export interface UpdateItemRequest {
  title?: string;
  description?: string;
  price?: number;
  condition?: string;
  category?: string;
  specifications?: { label: string; value: string }[];
  location?: string;
  tags?: string[];
  status?: 'available' | 'sold' | 'reserved';
}

export interface SearchFilters {
  category?: string;
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  university?: string;
  tags?: string[];
  sortBy?: 'recent' | 'price_low' | 'price_high' | 'popular';
}

export interface SaveItemResponse {
  saved: boolean;
  savesCount: number;
}

export interface CategoryResponse {
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

class MarketplaceApiService {
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

  async getItems(
    cursor?: string, 
    limit = 20, 
    filters?: SearchFilters
  ): Promise<MarketplaceItemsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.condition) {
        filters.condition.forEach(c => params.append('condition', c));
      }
      if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
      if (filters.university) params.append('university', filters.university);
      if (filters.tags) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    return this.request<MarketplaceItemsResponse>(`${Config.MARKETPLACE_ENDPOINT}/items?${params}`);
  }

  async getItem(itemId: string): Promise<MarketplaceItem> {
    return this.request<MarketplaceItem>(`${Config.MARKETPLACE_ENDPOINT}/items/${itemId}`);
  }

  async createItem(data: CreateItemRequest): Promise<CreateItemResponse> {
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('condition', data.condition);
      formData.append('category', data.category);
      
      if (data.location) formData.append('location', data.location);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));
      if (data.specifications) formData.append('specifications', JSON.stringify(data.specifications));
      
      data.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      return this.uploadRequest<CreateItemResponse>(`${Config.MARKETPLACE_ENDPOINT}/items`, formData);
    } else {
      return this.request<CreateItemResponse>(`${Config.MARKETPLACE_ENDPOINT}/items`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }

  async updateItem(itemId: string, data: UpdateItemRequest): Promise<MarketplaceItem> {
    return this.request<MarketplaceItem>(`${Config.MARKETPLACE_ENDPOINT}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    return this.request<void>(`${Config.MARKETPLACE_ENDPOINT}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async saveItem(itemId: string): Promise<SaveItemResponse> {
    return this.request<SaveItemResponse>(`${Config.MARKETPLACE_ENDPOINT}/items/${itemId}/save`, {
      method: 'POST',
    });
  }

  async searchItems(
    query: string, 
    cursor?: string, 
    limit = 20, 
    filters?: SearchFilters
  ): Promise<MarketplaceItemsResponse> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.condition) {
        filters.condition.forEach(c => params.append('condition', c));
      }
      if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
      if (filters.university) params.append('university', filters.university);
      if (filters.tags) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    return this.request<MarketplaceItemsResponse>(`${Config.MARKETPLACE_ENDPOINT}/items/search?${params}`);
  }

  async getCategories(): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`${Config.MARKETPLACE_ENDPOINT}/categories`);
  }

  async getUserItems(
    userId: string, 
    cursor?: string, 
    limit = 20
  ): Promise<MarketplaceItemsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<MarketplaceItemsResponse>(`${Config.MARKETPLACE_ENDPOINT}/users/${userId}/items?${params}`);
  }

  async getSavedItems(cursor?: string, limit = 20): Promise<MarketplaceItemsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<MarketplaceItemsResponse>(`${Config.MARKETPLACE_ENDPOINT}/saved?${params}`);
  }

  async getSimilarItems(itemId: string, limit = 6): Promise<MarketplaceItem[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await this.request<{ items: MarketplaceItem[] }>(`${Config.MARKETPLACE_ENDPOINT}/items/${itemId}/similar?${params}`);
    return response.items;
  }

  async uploadImage(file: File): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.uploadRequest<{ url: string; id: string }>(`${Config.MARKETPLACE_ENDPOINT}/upload/image`, formData);
  }

  async reportItem(itemId: string, reason: string, description?: string): Promise<void> {
    return this.request<void>(`${Config.MARKETPLACE_ENDPOINT}/items/${itemId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });
  }

  async markAsViewed(itemId: string): Promise<void> {
    return this.request<void>(`${Config.MARKETPLACE_ENDPOINT}/items/${itemId}/view`, {
      method: 'POST',
    });
  }
}

export const marketplaceApi = new MarketplaceApiService();