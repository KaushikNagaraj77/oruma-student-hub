import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share, Bookmark, MoreHorizontal, User, MapPin, ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";
import Header from "@/components/Header";
import PostCreationForm from "@/components/PostCreationForm";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi, Post, Comment } from "@/services/postsApi";
import { websocketService, PostLikedEvent, PostCommentedEvent, PostSavedEvent, NewPostEvent } from "@/services/websocketService";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ParsedText, formatTimeAgo } from "@/utils/textParsing";

const Feed = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState(new Set<string>());
  const [currentImageIndex, setCurrentImageIndex] = useState<{[postId: string]: number}>({});
  const [comments, setComments] = useState<{[postId: string]: Comment[]}>({});
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});
  const [submittingComments, setSubmittingComments] = useState(new Set<string>());

  // WebSocket event handlers
  useEffect(() => {
    if (!isAuthenticated) return;

    const handlePostLiked = (data: PostLikedEvent) => {
      setPosts(prev => prev.map(post => 
        post.id === data.postId 
          ? { ...post, likes: data.likesCount, liked: data.userId === user?.id }
          : post
      ));
    };

    const handlePostCommented = (data: PostCommentedEvent) => {
      setPosts(prev => prev.map(post => 
        post.id === data.postId 
          ? { ...post, comments: data.commentsCount }
          : post
      ));
      
      setComments(prev => ({
        ...prev,
        [data.postId]: [...(prev[data.postId] || []), data.comment as Comment]
      }));
    };

    const handlePostSaved = (data: PostSavedEvent) => {
      setPosts(prev => prev.map(post => 
        post.id === data.postId 
          ? { ...post, saved: data.userId === user?.id }
          : post
      ));
    };

    const handleNewPost = (data: NewPostEvent) => {
      setPosts(prev => [data.post, ...prev]);
    };

    websocketService.on('post_liked', handlePostLiked);
    websocketService.on('post_unliked', handlePostLiked);
    websocketService.on('post_commented', handlePostCommented);
    websocketService.on('post_saved', handlePostSaved);
    websocketService.on('post_unsaved', handlePostSaved);
    websocketService.on('new_post', handleNewPost);

    return () => {
      websocketService.off('post_liked', handlePostLiked);
      websocketService.off('post_unliked', handlePostLiked);
      websocketService.off('post_commented', handlePostCommented);
      websocketService.off('post_saved', handlePostSaved);
      websocketService.off('post_unsaved', handlePostSaved);
      websocketService.off('new_post', handleNewPost);
    };
  }, [isAuthenticated, user?.id]);

  const loadPosts = useCallback(async (isLoadMore = false) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await postsApi.getPosts(isLoadMore ? cursor : undefined);
      
      setPosts(prev => isLoadMore ? [...prev, ...response.posts] : response.posts);
      setHasMore(response.hasMore);
      setCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  const loadMorePosts = useCallback(() => {
    loadPosts(true);
  }, [loadPosts]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMorePosts,
    hasMore,
    isLoading,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));

    try {
      const response = await postsApi.likePost(postId);
      websocketService.sendPostLike(postId, response.liked);
      
      // Update with server response
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, liked: response.liked, likes: response.likesCount }
          : p
      ));
    } catch (error) {
      // Revert optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, liked: post.liked, likes: post.likes }
          : p
      ));
      setError('Failed to update like');
    }
  };

  const handleSave = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, saved: !p.saved }
        : p
    ));

    try {
      const response = await postsApi.savePost(postId);
      websocketService.sendPostSave(postId, response.saved);
    } catch (error) {
      // Revert optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, saved: post.saved }
          : p
      ));
      setError('Failed to save post');
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const response = await postsApi.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: response.comments }));
    } catch (error) {
      setError('Failed to load comments');
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
    setExpandedComments(newExpanded);
  };

  const handleCommentSubmit = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content || submittingComments.has(postId)) return;

    setSubmittingComments(prev => new Set(prev).add(postId));

    try {
      const response = await postsApi.createComment(postId, { content });
      
      // Update comments
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.comment]
      }));

      // Update post comment count optimistically
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 }
          : post
      ));

      // Clear input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));

      // Send WebSocket event
      websocketService.sendPostComment(postId, response.comment);
    } catch (error) {
      setError('Failed to post comment');
    } finally {
      setSubmittingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const nextImage = (postId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (postId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleHashtagClick = (hashtag: string) => {
    // Navigate to hashtag feed
    console.log('Navigate to hashtag:', hashtag);
  };

  const handleMentionClick = (username: string) => {
    // Navigate to user profile
    console.log('Navigate to user profile:', username);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view the feed</h2>
          <p className="text-muted-foreground">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campus Feed
            </h1>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-2">
          <div className="max-w-lg mx-auto">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg text-sm">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Create Post */}
          <PostCreationForm 
            onPostCreated={handlePostCreated}
            onError={setError}
          />

          {/* Posts */}
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                
                {/* Post Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{post.author}</h3>
                          <span className="text-sm text-muted-foreground">{post.username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.university}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          {post.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{post.location}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  
                  {/* Post Content */}
                  <div className="text-foreground leading-relaxed">
                    <ParsedText 
                      text={post.content}
                      onHashtagClick={handleHashtagClick}
                      onMentionClick={handleMentionClick}
                    />
                  </div>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative -mx-6 group">
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img 
                          src={post.images[currentImageIndex[post.id] || 0]}
                          alt="Post content"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Image Navigation */}
                        {post.images.length > 1 && (
                          <>
                            <button 
                              onClick={() => prevImage(post.id, post.images!.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => nextImage(post.id, post.images!.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            
                            {/* Image Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                              {post.images.map((_, index) => (
                                <div 
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === (currentImageIndex[post.id] || 0) 
                                      ? 'bg-white' 
                                      : 'bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-all duration-200 ${
                          post.liked 
                            ? 'text-primary scale-110' 
                            : 'text-muted-foreground hover:text-primary hover:scale-105'
                        }`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Share className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleSave(post.id)}
                      className={`transition-all duration-200 ${
                        post.saved 
                          ? 'text-primary scale-110' 
                          : 'text-muted-foreground hover:text-primary hover:scale-105'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.has(post.id) && (
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      <div className="space-y-2">
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-muted/50 rounded-2xl px-3 py-2">
                                <span className="font-medium text-sm">{comment.username}</span>
                                <p className="text-sm">
                                  <ParsedText 
                                    text={comment.content}
                                    onHashtagClick={handleHashtagClick}
                                    onMentionClick={handleMentionClick}
                                  />
                                </p>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{formatTimeAgo(comment.createdAt)}</span>
                                <button className="hover:text-primary">Reply</button>
                                <button className="hover:text-primary">👍 {comment.likes}</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            placeholder="Add a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                            className="flex-1 p-2 rounded-full border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            disabled={submittingComments.has(post.id)}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCommentSubmit(post.id)}
                            disabled={!commentInputs[post.id]?.trim() || submittingComments.has(post.id)}
                            className="h-8 w-8 p-0"
                          >
                            {submittingComments.has(post.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="h-4" />

          {/* End of feed message */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              You've reached the end of the feed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;