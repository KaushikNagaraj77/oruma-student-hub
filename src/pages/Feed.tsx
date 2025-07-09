
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share, Bookmark, MoreHorizontal, User, MapPin, ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { NewPostData } from "@/components/CreatePostModal";
import { formatDistanceToNow } from 'date-fns';

interface Post extends Omit<NewPostData, 'images' | 'isScheduled'> {
  id: number | string;
  likes: number;
  comments: number;
  saves: number;
  images: string[] | File[];
  liked: boolean;
  saved: boolean;
}

interface FeedProps {
  isCreatePostModalOpen: boolean;
  toggleCreatePostModal: (open?: boolean) => void;
  setFeedPostHandler: (handler: (data: NewPostData) => void) => void; // App.tsx provides this setter
  currentUser: { name: string; username: string; university: string };
}

const Feed = ({ toggleCreatePostModal, setFeedPostHandler, currentUser }: FeedProps) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Sarah Johnson",
      username: "@sarah_studies",
      university: "Stanford University",
      time: formatDistanceToNow(new Date(Date.now() - 2 * 60 * 60 * 1000)) + " ago",
      location: "Green Library",
      caption: "Late night grind at the library! Finals week energy 📚⚡ #StudyGroup #FinalsWeek #StanfordLife",
      likes: 147,
      comments: 23,
      saves: 12,
      images: ["photo-1481627834876-b7833e8f5570"],
      liked: false,
      saved: false,
      postType: "study",
      privacy: "public",
    },
    {
      id: 2,
      author: "Mike Chen",
      username: "@mike_eats",
      university: "UC Berkeley",
      time: formatDistanceToNow(new Date(Date.now() - 4 * 60 * 60 * 1000)) + " ago",
      location: "Crossroads Dining",
      caption: "Dining hall actually served something decent today 😱🍕 The pizza bar was on point! #UCBFood #DiningHall #Blessed",
      likes: 89,
      comments: 31,
      saves: 5,
      images: ["photo-1565299624946-b28f40a0ca4b"],
      liked: true,
      saved: false,
      postType: "food",
      privacy: "public",
    },
    {
      id: 3,
      author: "Emma Rodriguez",
      username: "@emma_achieves",
      university: "UCLA",
      time: formatDistanceToNow(new Date(Date.now() - 6 * 60 * 60 * 1000)) + " ago",
      location: "Powell Library",
      caption: "Just got accepted to the Dean's List! Hard work pays off 🎓✨ Thank you to everyone who supported me! #DeansList #UCLA #Achievement",
      likes: 234,
      comments: 47,
      saves: 18,
      images: ["photo-1523050854058-8df90110c9f1"],
      liked: false,
      saved: true,
      postType: "achievement",
      privacy: "public",
    },
  ]);

  const [expandedComments, setExpandedComments] = useState<Set<number | string>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [localImageUrls, setLocalImageUrls] = useState<{ [postId: string]: string[] }>({});

  const handleAddNewPost = useCallback((newPostData: NewPostData) => {
    const newPost: Post = {
      ...newPostData,
      id: `post-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      likes: 0,
      comments: 0,
      saves: 0,
      liked: false,
      saved: false,
      time: "Just now",
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);

    if (newPost.images.every(img => img instanceof File)) {
      const fileImages = newPost.images as File[];
      const urls = fileImages.map(file => URL.createObjectURL(file));
      setLocalImageUrls(prev => ({ ...prev, [newPost.id]: urls }));
    }
  }, []); // Empty dependency array as it doesn't depend on Feed's scope variables that change

  useEffect(() => {
    // Register the post handler with App.tsx when Feed component mounts
    setFeedPostHandler(() => handleAddNewPost);

    // Clean up by unregistering or setting to null if necessary, though for this pattern
    // it might not be strictly needed unless App.tsx could receive handlers from multiple sources.
    return () => {
      // setFeedPostHandler(null); // Optional: if App.tsx needs to know when Feed is unmounted
    };
  }, [setFeedPostHandler, handleAddNewPost]);


  const handleLike = (postId: number | string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: number | string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const toggleComments = (postId: number | string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const nextImage = (postId: number | string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [String(postId)]: ((prev[String(postId)] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (postId: number | string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [String(postId)]: ((prev[String(postId)] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const renderHashtagsAndMentions = (text: string) => {
    return text.split(/(\s+)/).map((word, index) => { // Keep spaces for layout
      if (word.startsWith('#') && word.length > 1) {
        return <span key={index} className="text-primary font-medium">{word}</span>;
      } else if (word.startsWith('@') && word.length > 1) {
        return <span key={index} className="text-secondary font-medium">{word}</span>;
      }
      return word;
    });
  };

  // Clean up local object URLs when component unmounts or posts change
  useEffect(() => {
    return () => {
      Object.values(localImageUrls).forEach(urls => urls.forEach(url => URL.revokeObjectURL(url)));
    };
  }, [localImageUrls]);


  return (
    <div className="min-h-screen bg-background">
      {/* Header is now rendered by App.tsx and provides onOpenCreatePostModal */}
      {/* <Header onOpenCreatePostModal={() => toggleCreatePostModal(true)} /> */}
      
      {/* Simplified Sub-Header for Feed Page Title */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-16 z-30"> {/* Adjusted sticky top due to main header */}
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="max-w-lg mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campus Feed
            </h1>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Create Post Trigger */}
          <Card
            className="border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => toggleCreatePostModal(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" /> {/* Placeholder for current user avatar */}
                </div>
                <div className="flex-1">
                  <div className="w-full p-3 rounded-full border border-input bg-muted/30 text-muted-foreground">
                    Share what's happening on campus...
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-primary">
                    <Edit3 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          <div className="space-y-6">
            {posts.map((post) => {
              const currentIdx = currentImageIndex[String(post.id)] || 0;
              const postImages = localImageUrls[String(post.id)] || (post.images as string[]).map(imgId =>
                imgId.startsWith("photo-") ? `https://images.unsplash.com/${imgId}?auto=format&fit=crop&w=600&h=600` : imgId
              );

              return (
              <Card key={post.id} className="border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                          {/* TODO: User avatar if available */}
                          <User className="w-6 h-6 text-white" />
                        </div>
                        {/* Online indicator example */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{post.author}</h3>
                          <span className="text-sm text-muted-foreground">{post.username}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                          <span>{post.university}</span>
                          <span className="mx-0.5">•</span>
                          <span>{post.time}</span>
                          {post.location && (
                            <>
                              <span className="mx-0.5">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{post.location}</span>
                              </div>
                            </>
                          )}
                           {post.postType && (
                            <>
                              <span className="mx-0.5">•</span>
                              <span className="capitalize bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm text-[10px] font-medium">{post.postType}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {renderHashtagsAndMentions(post.caption)}
                  </div>

                  {postImages && postImages.length > 0 && (
                    <div className="relative -mx-6 group"> {/* Negative margin to make image bleed to card edges if CardContent has padding */}
                      <div className="aspect-square bg-muted overflow-hidden"> {/* Removed rounded-lg if images are full width */}
                        <img 
                          src={postImages[currentIdx]}
                          alt={`Post by ${post.author} ${currentIdx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {postImages.length > 1 && (
                          <>
                            <button 
                              onClick={() => prevImage(post.id, postImages.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => nextImage(post.id, postImages.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {postImages.map((_, index) => (
                                <div 
                                  key={index}
                                  onClick={() => setCurrentImageIndex(prev => ({...prev, [String(post.id)]: index}))}
                                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                    index === currentIdx
                                      ? 'bg-white scale-125'
                                      : 'bg-white/50 hover:bg-white/80'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-all duration-200 group/action ${
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
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group/action"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group/action">
                        <Share className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleSave(post.id)}
                      className={`transition-all duration-200 group/action ${
                        post.saved 
                          ? 'text-primary scale-110' 
                          : 'text-muted-foreground hover:text-primary hover:scale-105'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {expandedComments.has(post.id) && (
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      {/* Dummy Comments */}
                      <div className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-xl px-3 py-1.5 text-sm">
                            <span className="font-medium text-xs text-foreground">@commenter_one</span>
                            <p className="text-muted-foreground">This is a sample comment! Great post. 🎉</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/80">
                            <span>1h</span> <button className="hover:text-primary">Reply</button> <button className="hover:text-primary">👍 5</button>
                          </div>
                        </div>
                      </div>
                       <div className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-pink-500 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-xl px-3 py-1.5 text-sm">
                            <span className="font-medium text-xs text-foreground">@another_user</span>
                            <p className="text-muted-foreground">Love this! Where was this picture taken?</p>
                          </div>
                           <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/80">
                            <span>45m</span> <button className="hover:text-primary">Reply</button> <button className="hover:text-primary">👍 2</button>
                          </div>
                        </div>
                      </div>
                      {/* Add Comment Input */}
                      <div className="flex gap-2.5 pt-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                           <User className="w-4 h-4 text-white" /> {/* Current user avatar */}
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full p-2.5 text-sm rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      </div>
      {/* CreatePostModal is now rendered by App.tsx */}
      {/* <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onOpenChange={toggleCreatePostModal}
        onPostSubmit={effectiveOnPostSubmit} // Use the wrapper
        currentUser={currentUser}
      /> */}
    </div>
  );
};

export default Feed;
