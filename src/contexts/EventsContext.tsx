import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { eventsApi, Event, EventsResponse, EventFilters, CreateEventRequest } from '../services/eventsApi';
import { useToast } from '../hooks/use-toast';

interface EventsContextType {
  // State
  events: Event[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
  selectedCategory?: string;
  searchQuery: string;
  filters: EventFilters;
  registeredEvents: Set<string>;
  
  // Actions
  loadEvents: (reset?: boolean) => Promise<void>;
  searchEvents: (query: string, reset?: boolean) => Promise<void>;
  setCategory: (category?: string) => void;
  setFilters: (filters: EventFilters) => void;
  registerForEvent: (eventId: string) => Promise<void>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  createEvent: (data: CreateEventRequest) => Promise<void>;
  updateEvent: (eventId: string, data: any) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  clearSearch: () => void;
  
  // Event details
  currentEvent: Event | null;
  loadingEvent: boolean;
  loadEvent: (eventId: string) => Promise<void>;
  markAsViewed: (eventId: string) => Promise<void>;
  
  // Categories
  categories: Array<{ id: string; name: string; count: number }>;
  loadCategories: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

interface EventsProviderProps {
  children: React.ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFiltersState] = useState<EventFilters>({});
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  
  // Event details state
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number }>>([]);
  
  const { toast } = useToast();

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    const errorMessage = error instanceof Error ? error.message : message;
    setError(errorMessage);
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }, [toast]);

  const loadEvents = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const cursor = reset ? undefined : nextCursor;
      const currentFilters = selectedCategory ? { ...filters, category: selectedCategory } : filters;
      
      const response: EventsResponse = await eventsApi.getEvents(cursor, 20, currentFilters);
      
      if (reset) {
        setEvents(response.events);
      } else {
        setEvents(prev => [...prev, ...response.events]);
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      
      // Update registered events set
      const newRegisteredEvents = new Set(registeredEvents);
      response.events.forEach(event => {
        if (event.isRegistered) {
          newRegisteredEvents.add(event.id);
        } else {
          newRegisteredEvents.delete(event.id);
        }
      });
      setRegisteredEvents(newRegisteredEvents);
      
    } catch (error) {
      handleError(error, 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [nextCursor, selectedCategory, filters, registeredEvents, handleError]);

  const searchEvents = useCallback(async (query: string, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      
      if (!query.trim()) {
        await loadEvents(true);
        return;
      }
      
      const cursor = reset ? undefined : nextCursor;
      const currentFilters = selectedCategory ? { ...filters, category: selectedCategory } : filters;
      
      const response: EventsResponse = await eventsApi.searchEvents(query, cursor, 20, currentFilters);
      
      if (reset) {
        setEvents(response.events);
      } else {
        setEvents(prev => [...prev, ...response.events]);
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      
      // Update registered events set
      const newRegisteredEvents = new Set(registeredEvents);
      response.events.forEach(event => {
        if (event.isRegistered) {
          newRegisteredEvents.add(event.id);
        } else {
          newRegisteredEvents.delete(event.id);
        }
      });
      setRegisteredEvents(newRegisteredEvents);
      
    } catch (error) {
      handleError(error, 'Failed to search events');
    } finally {
      setLoading(false);
    }
  }, [nextCursor, selectedCategory, filters, registeredEvents, handleError, loadEvents]);

  const setCategory = useCallback((category?: string) => {
    setSelectedCategory(category);
    setEvents([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  const setFilters = useCallback((newFilters: EventFilters) => {
    setFiltersState(newFilters);
    setEvents([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  const registerForEvent = useCallback(async (eventId: string) => {
    try {
      const response = await eventsApi.registerForEvent(eventId);
      
      // Update registered events set
      const newRegisteredEvents = new Set(registeredEvents);
      if (response.registered) {
        newRegisteredEvents.add(eventId);
      } else {
        newRegisteredEvents.delete(eventId);
      }
      setRegisteredEvents(newRegisteredEvents);
      
      // Update events in state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, isRegistered: response.registered, attendees: response.attendeesCount }
          : event
      ));
      
      // Update current event if it's the same
      if (currentEvent?.id === eventId) {
        setCurrentEvent(prev => prev ? { ...prev, isRegistered: response.registered, attendees: response.attendeesCount } : null);
      }
      
      toast({
        title: response.registered ? 'Registered Successfully' : 'Registration Cancelled',
        description: response.registered ? 'You are now registered for this event' : 'You have been unregistered from this event',
      });
      
    } catch (error) {
      handleError(error, 'Failed to register for event');
    }
  }, [registeredEvents, currentEvent, toast, handleError]);

  const unregisterFromEvent = useCallback(async (eventId: string) => {
    try {
      const response = await eventsApi.unregisterFromEvent(eventId);
      
      // Update registered events set
      const newRegisteredEvents = new Set(registeredEvents);
      newRegisteredEvents.delete(eventId);
      setRegisteredEvents(newRegisteredEvents);
      
      // Update events in state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, isRegistered: false, attendees: response.attendeesCount }
          : event
      ));
      
      // Update current event if it's the same
      if (currentEvent?.id === eventId) {
        setCurrentEvent(prev => prev ? { ...prev, isRegistered: false, attendees: response.attendeesCount } : null);
      }
      
      toast({
        title: 'Unregistered Successfully',
        description: 'You have been removed from this event',
      });
      
    } catch (error) {
      handleError(error, 'Failed to unregister from event');
    }
  }, [registeredEvents, currentEvent, toast, handleError]);

  const createEvent = useCallback(async (data: CreateEventRequest) => {
    try {
      const response = await eventsApi.createEvent(data);
      
      // Add new event to the beginning of the list
      setEvents(prev => [response.event, ...prev]);
      
      toast({
        title: 'Event Created',
        description: 'Your event has been successfully created and is now visible to students',
      });
      
    } catch (error) {
      handleError(error, 'Failed to create event');
      throw error; // Re-throw so components can handle it
    }
  }, [toast, handleError]);

  const updateEvent = useCallback(async (eventId: string, data: any) => {
    try {
      const updatedEvent = await eventsApi.updateEvent(eventId, data);
      
      // Update event in state
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
      
      // Update current event if it's the same
      if (currentEvent?.id === eventId) {
        setCurrentEvent(updatedEvent);
      }
      
      toast({
        title: 'Event Updated',
        description: 'Your event has been successfully updated',
      });
      
    } catch (error) {
      handleError(error, 'Failed to update event');
      throw error;
    }
  }, [currentEvent, toast, handleError]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await eventsApi.deleteEvent(eventId);
      
      // Remove event from state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Clear current event if it's the same
      if (currentEvent?.id === eventId) {
        setCurrentEvent(null);
      }
      
      // Remove from registered events
      const newRegisteredEvents = new Set(registeredEvents);
      newRegisteredEvents.delete(eventId);
      setRegisteredEvents(newRegisteredEvents);
      
      toast({
        title: 'Event Deleted',
        description: 'Your event has been removed successfully',
      });
      
    } catch (error) {
      handleError(error, 'Failed to delete event');
      throw error;
    }
  }, [currentEvent, registeredEvents, toast, handleError]);

  const refreshEvents = useCallback(async () => {
    await loadEvents(true);
  }, [loadEvents]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setEvents([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  const loadEvent = useCallback(async (eventId: string) => {
    try {
      setLoadingEvent(true);
      setError(null);
      
      const event = await eventsApi.getEvent(eventId);
      setCurrentEvent(event);
      
      // Update registered events set
      const newRegisteredEvents = new Set(registeredEvents);
      if (event.isRegistered) {
        newRegisteredEvents.add(event.id);
      } else {
        newRegisteredEvents.delete(event.id);
      }
      setRegisteredEvents(newRegisteredEvents);
      
    } catch (error) {
      handleError(error, 'Failed to load event details');
    } finally {
      setLoadingEvent(false);
    }
  }, [registeredEvents, handleError]);

  const markAsViewed = useCallback(async (eventId: string) => {
    try {
      await eventsApi.markAsViewed(eventId);
    } catch (error) {
      console.error('Failed to mark event as viewed:', error);
      // Don't show error toast for view tracking as it's not critical
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await eventsApi.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Don't show error toast for categories as it's not critical
    }
  }, []);

  // Load events on mount and when category/filters change
  useEffect(() => {
    if (searchQuery) {
      searchEvents(searchQuery, true);
    } else {
      loadEvents(true);
    }
  }, [selectedCategory, filters]); // Note: Don't include searchEvents/loadEvents to avoid infinite loops

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const value: EventsContextType = {
    // State
    events,
    loading,
    error,
    hasMore,
    nextCursor,
    selectedCategory,
    searchQuery,
    filters,
    registeredEvents,
    
    // Actions
    loadEvents,
    searchEvents,
    setCategory,
    setFilters,
    registerForEvent,
    unregisterFromEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
    clearSearch,
    
    // Event details
    currentEvent,
    loadingEvent,
    loadEvent,
    markAsViewed,
    
    // Categories
    categories,
    loadCategories,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};