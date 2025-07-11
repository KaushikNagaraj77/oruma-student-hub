import { useState, useEffect, useCallback, useRef } from 'react';
import { universitiesApi, University, UniversitySearchResponse } from '@/services/universitiesApi';

interface UseUniversitySearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  initialLimit?: number;
  autoSearch?: boolean;
}

interface UseUniversitySearchResult {
  universities: University[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  retry: () => Promise<void>;
}

export const useUniversitySearch = (
  options: UseUniversitySearchOptions = {}
): UseUniversitySearchResult => {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    initialLimit = 50,
    autoSearch = true,
  } = options;

  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);

  const performSearch = useCallback(async (
    query: string, 
    isLoadMore: boolean = false,
    signal?: AbortSignal
  ) => {
    try {
      setError(null);
      if (!isLoadMore) {
        setIsLoading(true);
        setUniversities([]);
      }

      console.log('🔄 Hook performing search:', { query, isLoadMore });

      const response: UniversitySearchResponse = await universitiesApi.searchUniversities(
        query,
        {
          limit: initialLimit,
          cursor: isLoadMore ? cursor : undefined,
          useCache: true,
        }
      );

      console.log('📋 Hook received response:', response);

      // Check if request was aborted
      if (signal?.aborted) {
        console.log('🚫 Request was aborted');
        return;
      }

      if (isLoadMore) {
        setUniversities(prev => [...prev, ...response.universities]);
      } else {
        setUniversities(response.universities);
      }

      setHasMore(response.hasMore);
      setTotal(response.total);
      setCursor(response.nextCursor);
      
      console.log('✅ Hook state updated:', {
        universitiesCount: response.universities.length,
        total: response.total,
        hasMore: response.hasMore
      });
      
    } catch (err) {
      // Don't set error if request was aborted
      if (signal?.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to search universities';
      console.error('❌ Hook search error:', errorMessage);
      setError(errorMessage);
      
      if (!isLoadMore) {
        setUniversities([]);
        setHasMore(false);
        setTotal(0);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [initialLimit, cursor]);

  const search = useCallback(async (query: string) => {
    console.log('🎯 Search called with query:', query);
    
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setCurrentQuery(query);
    setCursor(undefined);

    // If query is too short, clear results
    if (query.length < minQueryLength) {
      console.log('📝 Query too short, clearing results');
      setUniversities([]);
      setHasMore(false);
      setTotal(0);
      setError(null);
      return;
    }

    // Debounce the search
    console.log(`⏱️ Debouncing search for ${debounceMs}ms`);
    debounceTimer.current = setTimeout(async () => {
      console.log('🚀 Debounce complete, starting search');
      abortController.current = new AbortController();
      await performSearch(query, false, abortController.current.signal);
    }, debounceMs);
  }, [debounceMs, minQueryLength, performSearch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !currentQuery) return;

    await performSearch(currentQuery, true);
  }, [hasMore, isLoading, currentQuery, performSearch]);

  const clearResults = useCallback(() => {
    setUniversities([]);
    setHasMore(false);
    setTotal(0);
    setError(null);
    setCursor(undefined);
    setCurrentQuery('');
    
    // Cancel any pending requests
    if (abortController.current) {
      abortController.current.abort();
    }
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (currentQuery) {
      await performSearch(currentQuery, false);
    }
  }, [currentQuery, performSearch]);

  // Load initial popular universities
  useEffect(() => {
    if (autoSearch && isInitialMount.current) {
      isInitialMount.current = false;
      
      // Load popular universities initially
      const loadInitialUniversities = async () => {
        try {
          setIsLoading(true);
          console.log('🔄 Loading initial universities...');
          
          // Try to get popular universities by searching for common ones
          const popularQueries = ['harvard', 'stanford', 'mit'];
          
          for (const query of popularQueries) {
            console.log(`🎓 Trying initial search with: ${query}`);
            const response = await universitiesApi.searchUniversities(query, {
              limit: 50,
              useCache: true,
            });
            
            console.log(`📊 Initial search "${query}" returned:`, response);
            
            if (response.universities.length > 0) {
              setUniversities(response.universities);
              setHasMore(response.hasMore);
              setTotal(response.total);
              console.log(`✅ Initial universities loaded: ${response.universities.length}`);
              break;
            }
          }
          
          // If no results, load some fallback data
          if (universities.length === 0) {
            console.log('🆘 No initial results, searching for empty query to get fallback data');
            const fallbackResponse = await universitiesApi.searchUniversities('', {
              limit: 50,
              useCache: true,
            });
            
            if (fallbackResponse.universities.length > 0) {
              setUniversities(fallbackResponse.universities);
              setHasMore(fallbackResponse.hasMore);
              setTotal(fallbackResponse.total);
              console.log(`✅ Fallback universities loaded: ${fallbackResponse.universities.length}`);
            }
          }
        } catch (err) {
          console.warn('❌ Failed to load initial universities:', err);
          // Don't show error for initial load failure
        } finally {
          setIsLoading(false);
        }
      };

      loadInitialUniversities();
    }
  }, [autoSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    universities,
    isLoading,
    error,
    hasMore,
    total,
    search,
    loadMore,
    clearResults,
    clearError,
    retry,
  };
};