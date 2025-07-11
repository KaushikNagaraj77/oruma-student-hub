import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  searchTerms?: string[];
  category?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  onSearchChange?: (query: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  maxHeight?: number;
  itemHeight?: number;
  showSearch?: boolean;
  allowClear?: boolean;
  notFoundText?: string;
  loadingText?: string;
  isLoading?: boolean;
}

const VirtualizedList: React.FC<{
  items: SearchableSelectOption[];
  itemHeight: number;
  maxHeight: number;
  selectedValue?: string;
  onItemClick: (option: SearchableSelectOption) => void;
}> = ({ items, itemHeight, maxHeight, selectedValue, onItemClick }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(maxHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ maxHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={item.value}
              className={cn(
                'absolute w-full px-2 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2',
                selectedValue === item.value && 'bg-accent text-accent-foreground'
              )}
              style={{
                top: actualIndex * itemHeight,
                height: itemHeight,
              }}
              onClick={() => onItemClick(item)}
            >
              <Check
                className={cn(
                  'h-4 w-4',
                  selectedValue === item.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              <div className="flex-1 truncate">
                <div className="truncate">{item.label}</div>
                {item.category && (
                  <div className="text-xs text-muted-foreground truncate">
                    {item.category}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  onSearchChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  className,
  disabled = false,
  maxHeight = 300,
  itemHeight = 40,
  showSearch = true,
  allowClear = true,
  notFoundText = 'No options found',
  loadingText = 'Loading...',
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SearchableSelectOption[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle search query changes
  useEffect(() => {
    // Call external search handler if provided
    if (onSearchChange) {
      onSearchChange(searchQuery);
    }

    // Also filter local options if no external handler or as fallback
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = options.filter(option => {
      const labelMatch = option.label.toLowerCase().includes(query);
      const searchTermsMatch = option.searchTerms?.some(term =>
        term.toLowerCase().includes(query)
      );
      const categoryMatch = option.category?.toLowerCase().includes(query);

      return labelMatch || searchTermsMatch || categoryMatch;
    });

    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [searchQuery, options, onSearchChange]);

  // Update filtered options when options prop changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
    }
  }, [options, searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  const handleOptionSelect = useCallback((option: SearchableSelectOption) => {
    onValueChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
  }, [onValueChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
    setSearchQuery('');
  }, [onValueChange]);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
          disabled && 'pointer-events-none',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn(
          'truncate',
          !selectedOption && 'text-muted-foreground'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {allowClear && value && !disabled && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-50 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-0 text-popover-foreground shadow-md">
          {showSearch && (
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-8 pr-4 text-sm bg-transparent border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                />
              </div>
            </div>
          )}

          <div className="p-1">
            {isLoading ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                {loadingText}
              </div>
            ) : filteredOptions.length > 0 ? (
              <VirtualizedList
                items={filteredOptions}
                itemHeight={itemHeight}
                maxHeight={maxHeight}
                selectedValue={value}
                onItemClick={handleOptionSelect}
              />
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                {notFoundText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};