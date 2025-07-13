import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { marketplaceApi, MarketplaceItem, MarketplaceItemsResponse, SearchFilters } from '../services/marketplaceApi';
import { useToast } from '../hooks/use-toast';

interface MarketplaceContextType {
  // State
  items: MarketplaceItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
  selectedCategory?: string;
  searchQuery: string;
  filters: SearchFilters;
  savedItems: Set<string>;
  
  // Actions
  loadItems: (reset?: boolean) => Promise<void>;
  searchItems: (query: string, reset?: boolean) => Promise<void>;
  setCategory: (category?: string) => void;
  setFilters: (filters: SearchFilters) => void;
  saveItem: (itemId: string) => Promise<void>;
  createItem: (data: any) => Promise<void>;
  updateItem: (itemId: string, data: any) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  refreshItems: () => Promise<void>;
  clearSearch: () => void;
  
  // Item details
  currentItem: MarketplaceItem | null;
  loadingItem: boolean;
  loadItem: (itemId: string) => Promise<void>;
  similarItems: MarketplaceItem[];
  loadSimilarItems: (itemId: string) => Promise<void>;
  markAsViewed: (itemId: string) => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

interface MarketplaceProviderProps {
  children: React.ReactNode;
}

export const MarketplaceProvider: React.FC<MarketplaceProviderProps> = ({ children }) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFiltersState] = useState<SearchFilters>({});
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  
  // Item details state
  const [currentItem, setCurrentItem] = useState<MarketplaceItem | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [similarItems, setSimilarItems] = useState<MarketplaceItem[]>([]);
  
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

  const loadItems = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const cursor = reset ? undefined : nextCursor;
      const currentFilters = selectedCategory ? { ...filters, category: selectedCategory } : filters;
      
      const response: MarketplaceItemsResponse = await marketplaceApi.getItems(cursor, 20, currentFilters);
      
      if (reset) {
        setItems(response.items);
      } else {
        setItems(prev => [...prev, ...response.items]);
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      
      // Update saved items set
      const newSavedItems = new Set(savedItems);
      response.items.forEach(item => {
        if (item.saved) {
          newSavedItems.add(item.id);
        } else {
          newSavedItems.delete(item.id);
        }
      });
      setSavedItems(newSavedItems);
      
    } catch (error) {
      handleError(error, 'Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  }, [nextCursor, selectedCategory, filters, savedItems, handleError]);

  const searchItems = useCallback(async (query: string, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      
      if (!query.trim()) {
        await loadItems(true);
        return;
      }
      
      const cursor = reset ? undefined : nextCursor;
      const currentFilters = selectedCategory ? { ...filters, category: selectedCategory } : filters;
      
      const response: MarketplaceItemsResponse = await marketplaceApi.searchItems(query, cursor, 20, currentFilters);
      
      if (reset) {
        setItems(response.items);
      } else {
        setItems(prev => [...prev, ...response.items]);
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      
      // Update saved items set
      const newSavedItems = new Set(savedItems);
      response.items.forEach(item => {
        if (item.saved) {
          newSavedItems.add(item.id);
        } else {
          newSavedItems.delete(item.id);
        }
      });
      setSavedItems(newSavedItems);
      
    } catch (error) {
      handleError(error, 'Failed to search marketplace items');
    } finally {
      setLoading(false);
    }
  }, [nextCursor, selectedCategory, filters, savedItems, handleError, loadItems]);

  const setCategory = useCallback((category?: string) => {
    setSelectedCategory(category);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  const saveItem = useCallback(async (itemId: string) => {
    try {
      const response = await marketplaceApi.saveItem(itemId);
      
      // Update saved items set
      const newSavedItems = new Set(savedItems);
      if (response.saved) {
        newSavedItems.add(itemId);
      } else {
        newSavedItems.delete(itemId);
      }
      setSavedItems(newSavedItems);
      
      // Update items in state
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, saved: response.saved, saves: response.savesCount }
          : item
      ));
      
      // Update current item if it's the same
      if (currentItem?.id === itemId) {
        setCurrentItem(prev => prev ? { ...prev, saved: response.saved, saves: response.savesCount } : null);
      }
      
      toast({
        title: response.saved ? 'Item Saved' : 'Item Unsaved',
        description: response.saved ? 'Item added to your saved list' : 'Item removed from your saved list',
      });
      
    } catch (error) {
      handleError(error, 'Failed to save item');
    }
  }, [savedItems, currentItem, toast, handleError]);

  const createItem = useCallback(async (data: any) => {
    try {
      const response = await marketplaceApi.createItem(data);
      
      // Add new item to the beginning of the list
      setItems(prev => [response.item, ...prev]);
      
      toast({
        title: 'Item Created',
        description: 'Your item has been successfully listed in the marketplace',
      });
      
    } catch (error) {
      handleError(error, 'Failed to create item');
      throw error; // Re-throw so components can handle it
    }
  }, [toast, handleError]);

  const updateItem = useCallback(async (itemId: string, data: any) => {
    try {
      const updatedItem = await marketplaceApi.updateItem(itemId, data);
      
      // Update item in state
      setItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      
      // Update current item if it's the same
      if (currentItem?.id === itemId) {
        setCurrentItem(updatedItem);
      }
      
      toast({
        title: 'Item Updated',
        description: 'Your item has been successfully updated',
      });
      
    } catch (error) {
      handleError(error, 'Failed to update item');
      throw error;
    }
  }, [currentItem, toast, handleError]);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      await marketplaceApi.deleteItem(itemId);
      
      // Remove item from state
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      // Clear current item if it's the same
      if (currentItem?.id === itemId) {
        setCurrentItem(null);
      }
      
      // Remove from saved items
      const newSavedItems = new Set(savedItems);
      newSavedItems.delete(itemId);
      setSavedItems(newSavedItems);
      
      toast({
        title: 'Item Deleted',
        description: 'Your item has been removed from the marketplace',
      });
      
    } catch (error) {
      handleError(error, 'Failed to delete item');
      throw error;
    }
  }, [currentItem, savedItems, toast, handleError]);

  const refreshItems = useCallback(async () => {
    await loadItems(true);
  }, [loadItems]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setItems([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  const loadItem = useCallback(async (itemId: string) => {
    try {
      setLoadingItem(true);
      setError(null);
      
      const item = await marketplaceApi.getItem(itemId);
      setCurrentItem(item);
      
      // Update saved items set
      const newSavedItems = new Set(savedItems);
      if (item.saved) {
        newSavedItems.add(item.id);
      } else {
        newSavedItems.delete(item.id);
      }
      setSavedItems(newSavedItems);
      
    } catch (error) {
      handleError(error, 'Failed to load item details');
    } finally {
      setLoadingItem(false);
    }
  }, [savedItems, handleError]);

  const loadSimilarItems = useCallback(async (itemId: string) => {
    try {
      const items = await marketplaceApi.getSimilarItems(itemId, 6);
      setSimilarItems(items);
    } catch (error) {
      console.error('Failed to load similar items:', error);
      // Don't show error toast for similar items as it's not critical
    }
  }, []);

  const markAsViewed = useCallback(async (itemId: string) => {
    try {
      await marketplaceApi.markAsViewed(itemId);
    } catch (error) {
      console.error('Failed to mark item as viewed:', error);
      // Don't show error toast for view tracking as it's not critical
    }
  }, []);

  // Load items on mount and when category/filters change
  useEffect(() => {
    if (searchQuery) {
      searchItems(searchQuery, true);
    } else {
      loadItems(true);
    }
  }, [selectedCategory, filters]); // Note: Don't include searchItems/loadItems to avoid infinite loops

  const value: MarketplaceContextType = {
    // State
    items,
    loading,
    error,
    hasMore,
    nextCursor,
    selectedCategory,
    searchQuery,
    filters,
    savedItems,
    
    // Actions
    loadItems,
    searchItems,
    setCategory,
    setFilters,
    saveItem,
    createItem,
    updateItem,
    deleteItem,
    refreshItems,
    clearSearch,
    
    // Item details
    currentItem,
    loadingItem,
    loadItem,
    similarItems,
    loadSimilarItems,
    markAsViewed,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};