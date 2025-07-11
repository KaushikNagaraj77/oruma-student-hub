import React, { useState, useEffect, useCallback } from 'react';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { University } from '@/services/universitiesApi';
import { useUniversitySearch } from '@/hooks/useUniversitySearch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';

interface UniversitySearchProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const getUniversityTypeLabel = (type: University['type']): string => {
  switch (type) {
    case 'public': return 'Public University';
    case 'private': return 'Private University';
    case 'community': return 'Community College';
    case 'technical': return 'Technical Institute';
    case 'hbcu': return 'HBCU';
    case 'tribal': return 'Tribal College';
    case 'religious': return 'Religious Institution';
    case 'for-profit': return 'For-Profit Institution';
    default: return 'University';
  }
};

const UniversitySearch: React.FC<UniversitySearchProps> = ({
  value,
  onValueChange,
  placeholder = 'Search for your university...',
  className,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const {
    universities,
    isLoading,
    error: searchError,
    total,
    search,
    retry,
  } = useUniversitySearch({
    debounceMs: 300,
    minQueryLength: 1,
    initialLimit: 100,
    autoSearch: true,
  });

  // Debug logging for component state
  useEffect(() => {
    console.log('🎯 UniversitySearch component state:', {
      universitiesCount: universities.length,
      isLoading,
      searchError,
      total,
      searchQuery
    });
  }, [universities, isLoading, searchError, total, searchQuery]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle search input changes with logging
  const handleSearchChange = useCallback((query: string) => {
    console.log('🔤 Input changed:', query);
    setSearchQuery(query);
    search(query);
  }, [search]);

  // Convert universities to options format
  const universityOptions: SearchableSelectOption[] = universities.map(university => ({
    value: university.name,
    label: university.name,
    category: `${getUniversityTypeLabel(university.type)} • ${university.state}`,
    searchTerms: [
      ...university.searchTerms,
      university.city?.toLowerCase(),
      university.state?.toLowerCase(),
      getUniversityTypeLabel(university.type).toLowerCase(),
      university.type,
    ].filter(Boolean),
  }));

  // Debug logging for options
  useEffect(() => {
    console.log('📋 University options generated:', {
      optionsCount: universityOptions.length,
      sampleOptions: universityOptions.slice(0, 3),
      searchQuery
    });
  }, [universityOptions, searchQuery]);

  // Error handling component
  const ErrorDisplay = () => {
    if (!searchError) return null;

    return (
      <Alert className="mb-2 border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-sm">
          <div className="flex items-center justify-between">
            <span>{searchError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={retry}
              className="h-6 px-2 text-xs hover:bg-destructive/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Network status indicator
  const NetworkStatus = () => {
    if (isOnline) return null;

    return (
      <Alert className="mb-2 border-orange-500/50 bg-orange-50">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-sm text-orange-800">
          You're offline. Showing cached universities only.
        </AlertDescription>
      </Alert>
    );
  };

  // Custom search placeholder based on state
  const getSearchPlaceholder = () => {
    if (!isOnline) {
      return 'Search cached universities (offline)...';
    }
    if (isLoading) {
      return 'Searching universities...';
    }
    return 'Type to search from 4000+ US universities...';
  };

  // Custom not found text
  const getNotFoundText = () => {
    if (isLoading) {
      return 'Searching...';
    }
    if (!isOnline) {
      return 'No cached universities found. Connect to internet for full search.';
    }
    if (searchError) {
      return 'Search failed. Check your connection and try again.';
    }
    if (searchQuery && searchQuery.trim()) {
      return `No universities found for "${searchQuery}". Try different keywords like university name, city, or state.`;
    }
    return 'Start typing to search universities...';
  };

  // Loading text
  const getLoadingText = () => {
    if (!isOnline) {
      return 'Loading from cache...';
    }
    return `Searching ${total > 0 ? `${total}` : '4000+'} universities...`;
  };

  return (
    <div className="space-y-2">
      <NetworkStatus />
      <ErrorDisplay />
      
      <SearchableSelect
        options={universityOptions}
        value={value}
        onValueChange={onValueChange}
        onSearchChange={handleSearchChange}
        placeholder={placeholder}
        searchPlaceholder={getSearchPlaceholder()}
        className={className}
        disabled={disabled}
        maxHeight={400}
        itemHeight={56} // Increased for category display
        showSearch={true}
        allowClear={true}
        notFoundText={getNotFoundText()}
        loadingText={getLoadingText()}
        isLoading={isLoading}
      />
      
      {/* Search stats */}
      {total > 0 && (
        <p className="text-xs text-muted-foreground">
          {isOnline ? (
            <>
              <Wifi className="inline h-3 w-3 mr-1" />
              Found {universities.length} universities
            </>
          ) : (
            <>
              <WifiOff className="inline h-3 w-3 mr-1" />
              Showing {universities.length} cached results
            </>
          )}
        </p>
      )}

      {/* Help text */}
      {universities.length === 0 && !isLoading && !searchQuery && (
        <p className="text-xs text-muted-foreground">
          Search any US university, college, community college, or technical institute.
          Examples: "Harvard", "UC Berkeley", "Texas A&M", "Miami Dade College"
        </p>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">
            {getLoadingText()}
          </span>
        </div>
      )}
    </div>
  );
};

export default UniversitySearch;