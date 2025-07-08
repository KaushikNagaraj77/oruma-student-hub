
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share, Bookmark, MoreHorizontal, User, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      username: "@sarah_studies",
      university: "Stanford University",
      time: "2 hours ago",
      location: "Green Library",
      content: "Late night grind at the library! Finals week energy 📚⚡ #StudyGroup #FinalsWeek #StanfordLife",
      likes: 147,
      comments: 23,
      saves: 12,
      images: ["photo-1481627834876-b7833e8f5570"],
      liked: false,
      saved: false,
      type: "study"
    },
    {
      id: 2,
      author: "Mike Chen",
      username: "@mike_eats",
      university: "UC Berkeley",
      time: "4 hours ago",
      location: "Crossroads Dining",
      content: "Dining hall actually served something decent today 😱🍕 The pizza bar was on point! #UCBFood #DiningHall #Blessed",
      likes: 89,
      comments: 31,
      saves: 5,
      images: ["photo-1565299624946-b28f40a0ca4b"],
      liked: true,
      saved: false,
      type: "food"
    },
    {
      id: 3,
      author: "Emma Rodriguez",
      username: "@emma_achieves",
      university: "UCLA", 
      time: "6 hours ago",
      location: "Powell Library",
      content: "Just got accepted to the Dean's List! Hard work pays off 🎓✨ Thank you to everyone who supported me! #DeansL ist #UCLA #Achievement",
      likes: 234,
      comments: 47,
      saves: 18,
      images: ["photo-1523050854058-8df90110c9f1"],
      liked: false,
      saved: true,
      type: "achievement"
    },
    {
      id: 4,
      author: "Alex Thompson",
      username: "@alex_social",
      university: "MIT",
      time: "8 hours ago",
      location: "Killian Court",
      content: "Amazing turnout at the Fall Festival! 🍂🎉 Best campus event this semester. Love our MIT community! #FallFestival #MIT #CommunityLove",
      likes: 312,
      comments: 58,
      saves: 25,
      images: ["photo-1511632765486-a01980e01a18", "photo-1492684223066-81342ee5ff30"],
      liked: true,
      saved: false,
      type: "event"
    },
    {
      id: 5,
      author: "Jessica Park",
      username: "@jess_studybuddy",
      university: "Harvard University",
      time: "12 hours ago",
      location: "Widener Library",
      content: "Study group session complete! ✅ We conquered organic chemistry together 💪 #StudyBuddies #OrganicChem #Harvard #Teamwork",
      likes: 156,
      comments: 29,
      saves: 14,
      images: ["photo-1522202176988-66273c2fd55f"],
      liked: false,
      saved: false,
      type: "study"
    }
  ]);

  const [expandedComments, setExpandedComments] = useState(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const toggleComments = (postId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const nextImage = (postId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (postId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const renderHashtagsAndMentions = (text) => {
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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Simplified Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campus Feed
            </h1>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Create Post */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Share what's happening on campus..."
                    className="w-full p-3 rounded-full border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                          <span>{post.time}</span>
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
                    {renderHashtagsAndMentions(post.content)}
                  </div>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative -mx-6 group">
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/${post.images[currentImageIndex[post.id] || 0]}?auto=format&fit=crop&w=600&h=600`}
                          alt="Post content"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Image Navigation */}
                        {post.images.length > 1 && (
                          <>
                            <button 
                              onClick={() => prevImage(post.id, post.images.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => nextImage(post.id, post.images.length)}
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
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-muted/50 rounded-2xl px-3 py-2">
                              <span className="font-medium text-sm">@student_life</span>
                              <p className="text-sm">This is amazing! Keep up the great work! 🔥</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>2h</span>
                              <button className="hover:text-primary">Reply</button>
                              <button className="hover:text-primary">👍 12</button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-muted/50 rounded-2xl px-3 py-2">
                              <span className="font-medium text-sm">@campus_news</span>
                              <p className="text-sm">So inspiring! Love seeing students succeed 📚✨</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>1h</span>
                              <button className="hover:text-primary">Reply</button>
                              <button className="hover:text-primary">👍 8</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full p-2 rounded-full border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
