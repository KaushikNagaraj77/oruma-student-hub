import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Image, MapPin, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { postsApi, CreatePostRequest } from '@/services/postsApi';

interface PostCreationFormProps {
  onPostCreated?: (post: any) => void;
  onError?: (error: string) => void;
}

const PostCreationForm: React.FC<PostCreationFormProps> = ({ onPostCreated, onError }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHAR_LIMIT = 500;
  const MAX_IMAGES = 4;

  const extractHashtags = (text: string): string[] => {
    const hashtags = text.match(/#[a-zA-Z0-9_]+/g);
    return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
  };

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@[a-zA-Z0-9_]+/g);
    return mentions ? mentions.map(mention => mention.substring(1)) : [];
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > MAX_IMAGES) {
      onError?.(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        onError?.('Please select only image files');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        onError?.('Image size must be less than 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  }, [selectedImages.length, onError]);

  const removeImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      onError?.('Post content cannot be empty');
      return;
    }

    if (content.length > MAX_CHAR_LIMIT) {
      onError?.(`Post content cannot exceed ${MAX_CHAR_LIMIT} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: CreatePostRequest = {
        content: content.trim(),
        location: location.trim() || undefined,
        hashtags: extractHashtags(content),
        mentions: extractMentions(content),
        images: selectedImages.length > 0 ? selectedImages : undefined,
      };

      const response = await postsApi.createPost(postData);
      
      // Clear form
      setContent('');
      setLocation('');
      setSelectedImages([]);
      setPreviewUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
      setIsExpanded(false);

      onPostCreated?.(response.post);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHAR_LIMIT) {
      setContent(value);
    }
  };

  const renderHashtagsAndMentions = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return <span key={index} className="text-primary font-medium">{word} </span>;
      } else if (word.startsWith('@')) {
        return <span key={index} className="text-secondary font-medium">{word} </span>;
      }
      return word + ' ';
    });
  };

  return (
    <Card className="border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="relative">
                <textarea
                  value={content}
                  onChange={handleTextareaChange}
                  onFocus={() => setIsExpanded(true)}
                  placeholder="Share what's happening on campus..."
                  className="w-full p-3 rounded-xl border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  rows={isExpanded ? 4 : 1}
                  disabled={isSubmitting}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {content.length}/{MAX_CHAR_LIMIT}
                </div>
              </div>

              {/* Content Preview */}
              {content && (
                <div className="p-3 bg-muted/20 rounded-lg border border-border/30">
                  <div className="text-sm text-muted-foreground mb-1">Preview:</div>
                  <div className="text-foreground text-sm leading-relaxed">
                    {renderHashtagsAndMentions(content)}
                  </div>
                </div>
              )}

              {/* Location Input */}
              {isExpanded && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (optional)"
                    className="flex-1 p-2 rounded-lg border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {isExpanded && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={isSubmitting || selectedImages.length >= MAX_IMAGES}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting || selectedImages.length >= MAX_IMAGES}
                      className="h-8 px-3"
                    >
                      <Image className="w-4 h-4 mr-1" />
                      Images ({selectedImages.length}/{MAX_IMAGES})
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setContent('');
                        setLocation('');
                        setSelectedImages([]);
                        setPreviewUrls(prev => {
                          prev.forEach(url => URL.revokeObjectURL(url));
                          return [];
                        });
                        setIsExpanded(false);
                      }}
                      disabled={isSubmitting}
                      className="h-8 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!content.trim() || isSubmitting || content.length > MAX_CHAR_LIMIT}
                      className="h-8 px-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostCreationForm;