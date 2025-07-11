import React from 'react';

interface ParsedTextProps {
  text: string;
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (username: string) => void;
  className?: string;
}

export const parseText = (
  text: string,
  onHashtagClick?: (hashtag: string) => void,
  onMentionClick?: (username: string) => void,
  className?: string
): React.ReactNode => {
  const words = text.split(/(\s+)/);
  
  return words.map((word, index) => {
    const trimmedWord = word.trim();
    
    // Handle hashtags
    if (trimmedWord.startsWith('#') && trimmedWord.length > 1) {
      const hashtag = trimmedWord.substring(1);
      return (
        <span key={index}>
          <button
            onClick={() => onHashtagClick?.(hashtag)}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            {trimmedWord}
          </button>
          {word.replace(trimmedWord, '')}
        </span>
      );
    }
    
    // Handle mentions
    if (trimmedWord.startsWith('@') && trimmedWord.length > 1) {
      const username = trimmedWord.substring(1);
      return (
        <span key={index}>
          <button
            onClick={() => onMentionClick?.(username)}
            className="text-secondary font-medium hover:underline cursor-pointer"
          >
            {trimmedWord}
          </button>
          {word.replace(trimmedWord, '')}
        </span>
      );
    }
    
    // Handle URLs
    if (isValidUrl(trimmedWord)) {
      return (
        <span key={index}>
          <a
            href={trimmedWord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {trimmedWord}
          </a>
          {word.replace(trimmedWord, '')}
        </span>
      );
    }
    
    return <span key={index}>{word}</span>;
  });
};

export const ParsedText: React.FC<ParsedTextProps> = ({
  text,
  onHashtagClick,
  onMentionClick,
  className = ''
}) => {
  return (
    <span className={className}>
      {parseText(text, onHashtagClick, onMentionClick)}
    </span>
  );
};

export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
};

export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(mention => mention.substring(1)) : [];
};

export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
};

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};