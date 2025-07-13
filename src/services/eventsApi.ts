import { tokenManager } from '../utils/tokenManager';
import Config from '../utils/config';

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location: string;
  capacity: number;
  registrationRequired: boolean;
  bannerImage?: string;
  organizer: {
    id: string;
    name: string;
    username: string;
    university: string;
    avatar?: string;
  };
  attendees: number;
  maxAttendees: number;
  isRegistered: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags?: string[];
  university: string;
  views: number;
  saves: number;
  saved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended';
}

export interface EventsResponse {
  events: Event[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location: string;
  capacity: number;
  registrationRequired: boolean;
  bannerImage?: File;
  tags?: string[];
}

export interface CreateEventResponse {
  event: Event;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  registrationRequired?: boolean;
  tags?: string[];
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventFilters {
  category?: string;
  university?: string;
  date?: string; // ISO date string for filtering by specific date
  dateFrom?: string; // ISO date string for date range
  dateTo?: string; // ISO date string for date range
  location?: string;
  tags?: string[];
  status?: 'upcoming' | 'ongoing' | 'completed';
  sortBy?: 'date' | 'popularity' | 'recent' | 'capacity';
}

export interface RegisterEventResponse {
  registered: boolean;
  attendeesCount: number;
}

export interface SaveEventResponse {
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

class EventsApiService {
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

  async getEvents(
    cursor?: string, 
    limit = 20, 
    filters?: EventFilters
  ): Promise<EventsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.university) params.append('university', filters.university);
      if (filters.date) params.append('date', filters.date);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.location) params.append('location', filters.location);
      if (filters.status) params.append('status', filters.status);
      if (filters.tags) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    return this.request<EventsResponse>(`${Config.EVENTS_ENDPOINT}?${params}`);
  }

  async getEvent(eventId: string): Promise<Event> {
    return this.request<Event>(`${Config.EVENTS_ENDPOINT}/${eventId}`);
  }

  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    if (data.bannerImage) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('date', data.date);
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      formData.append('location', data.location);
      formData.append('capacity', data.capacity.toString());
      formData.append('registrationRequired', data.registrationRequired.toString());
      
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));
      formData.append('bannerImage', data.bannerImage);

      return this.uploadRequest<CreateEventResponse>(`${Config.EVENTS_ENDPOINT}`, formData);
    } else {
      return this.request<CreateEventResponse>(`${Config.EVENTS_ENDPOINT}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }

  async updateEvent(eventId: string, data: UpdateEventRequest): Promise<Event> {
    return this.request<Event>(`${Config.EVENTS_ENDPOINT}/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    return this.request<void>(`${Config.EVENTS_ENDPOINT}/${eventId}`, {
      method: 'DELETE',
    });
  }

  async registerForEvent(eventId: string): Promise<RegisterEventResponse> {
    return this.request<RegisterEventResponse>(`${Config.EVENTS_ENDPOINT}/${eventId}/register`, {
      method: 'POST',
    });
  }

  async unregisterFromEvent(eventId: string): Promise<RegisterEventResponse> {
    return this.request<RegisterEventResponse>(`${Config.EVENTS_ENDPOINT}/${eventId}/unregister`, {
      method: 'POST',
    });
  }

  async saveEvent(eventId: string): Promise<SaveEventResponse> {
    return this.request<SaveEventResponse>(`${Config.EVENTS_ENDPOINT}/${eventId}/save`, {
      method: 'POST',
    });
  }

  async searchEvents(
    query: string, 
    cursor?: string, 
    limit = 20, 
    filters?: EventFilters
  ): Promise<EventsResponse> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.university) params.append('university', filters.university);
      if (filters.date) params.append('date', filters.date);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.location) params.append('location', filters.location);
      if (filters.status) params.append('status', filters.status);
      if (filters.tags) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    return this.request<EventsResponse>(`${Config.EVENTS_ENDPOINT}/search?${params}`);
  }

  async getCategories(): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`${Config.EVENTS_ENDPOINT}/categories`);
  }

  async getUserEvents(
    userId: string, 
    cursor?: string, 
    limit = 20
  ): Promise<EventsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<EventsResponse>(`${Config.EVENTS_ENDPOINT}/users/${userId}/events?${params}`);
  }

  async getRegisteredEvents(cursor?: string, limit = 20): Promise<EventsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return this.request<EventsResponse>(`${Config.EVENTS_ENDPOINT}/registered?${params}`);
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return this.request<EventRegistration[]>(`${Config.EVENTS_ENDPOINT}/${eventId}/registrations`);
  }

  async uploadImage(file: File): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.uploadRequest<{ url: string; id: string }>(`${Config.EVENTS_ENDPOINT}/upload/image`, formData);
  }

  async markAsViewed(eventId: string): Promise<void> {
    return this.request<void>(`${Config.EVENTS_ENDPOINT}/${eventId}/view`, {
      method: 'POST',
    });
  }

  async reportEvent(eventId: string, reason: string, description?: string): Promise<void> {
    return this.request<void>(`${Config.EVENTS_ENDPOINT}/${eventId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });
  }
}

export const eventsApi = new EventsApiService();