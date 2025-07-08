
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, MessageSquare, Share, User } from "lucide-react";
import Header from "@/components/Header";

const Feed = () => {
  const posts = [
    {
      id: 1,
      author: "Sarah Johnson",
      university: "Stanford University",
      time: "2 hours ago",
      content: "Looking for a female roommate for my 2BR apartment near campus! Clean, quiet, and great for studying. DM me if interested! 🏠",
      likes: 12,
      comments: 5,
      image: null
    },
    {
      id: 2,
      author: "Mike Chen",
      university: "UC Berkeley",
      time: "4 hours ago", 
      content: "Just aced my Computer Science midterm! 🎉 Anyone else feeling the relief? Coffee study sessions really do work!",
      likes: 28,
      comments: 8,
      image: null
    },
    {
      id: 3,
      author: "Emma Rodriguez",
      university: "UCLA", 
      time: "6 hours ago",
      content: "Campus life hack: The library on the 3rd floor has the best WiFi and quietest study spots. Thank me later! 📚",
      likes: 45,
      comments: 12,
      image: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary)/0.05)_1px,transparent_1px,transparent_50px,hsl(var(--secondary)/0.05)_51px)] bg-[length:52px_52px]"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Campus
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Social Hub
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Connect with fellow students, share experiences, discover events, and build meaningful relationships within your university community.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Campus events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Study groups</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">

          <Card className="border-2 border-dashed border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="What's happening on campus today?"
                    className="w-full p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button variant="hero">Post</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-[var(--shadow-card)] transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">{post.author}</CardTitle>
                      <CardDescription className="text-sm">{post.university} • {post.time}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center gap-6 pt-3 border-t border-border/50">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Share className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
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
