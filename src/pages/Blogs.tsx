
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Eye, ThumbsUp, Search, Filter } from "lucide-react";

const Blogs = () => {
  const blogs = [
    {
      id: 1,
      title: "Top 10 Study Tips for Final Exams",
      excerpt: "Discover proven strategies to maximize your study efficiency and ace your final exams with confidence.",
      author: "Dr. Sarah Johnson",
      university: "Stanford University",
      date: "March 10, 2024",
      readTime: "5 min read",
      views: 1240,
      likes: 89,
      category: "Academic",
      image: "photo-1434030216411-0b793f4b4173",
      featured: true
    },
    {
      id: 2,
      title: "Mental Health Resources on Campus",
      excerpt: "A comprehensive guide to mental health support services available to students and how to access them.",
      author: "Campus Wellness Team",
      university: "UC Berkeley",
      date: "March 8, 2024",
      readTime: "7 min read",
      views: 856,
      likes: 142,
      category: "Wellness",
      image: "photo-1559757148-5c350d0d3c56",
      featured: false
    },
    {
      id: 3,
      title: "Building Your Professional Network",
      excerpt: "Learn how to create meaningful connections that will benefit your career long after graduation.",
      author: "Career Services",
      university: "MIT",
      date: "March 5, 2024",
      readTime: "6 min read",
      views: 632,
      likes: 73,
      category: "Career",
      image: "photo-1521737604893-d14cc237f11d",
      featured: false
    },
    {
      id: 4,
      title: "Campus Sustainability Initiatives",
      excerpt: "Explore the latest environmental programs and how students can contribute to a greener campus.",
      author: "Environmental Committee",
      university: "UCLA",
      date: "March 3, 2024",
      readTime: "4 min read",
      views: 421,
      likes: 56,
      category: "Environment",
      image: "photo-1542601906990-b4d3fb778b09",
      featured: false
    },
    {
      id: 5,
      title: "International Student Support Guide",
      excerpt: "Everything international students need to know about adapting to campus life and academic expectations.",
      author: "International Office",
      university: "Harvard University",
      date: "February 28, 2024",
      readTime: "8 min read",
      views: 923,
      likes: 167,
      category: "Student Life",
      image: "photo-1523050854058-8df90110c9d1",
      featured: true
    },
    {
      id: 6,
      title: "Research Opportunities for Undergraduates",
      excerpt: "How to find and apply for research positions that will enhance your academic and professional development.",
      author: "Research Office",
      university: "Yale University",
      date: "February 25, 2024",
      readTime: "6 min read",
      views: 745,
      likes: 94,
      category: "Research",
      image: "photo-1532094349884-543bc11b234d",
      featured: false
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      Academic: "bg-blue-100 text-blue-800",
      Wellness: "bg-green-100 text-green-800",
      Career: "bg-purple-100 text-purple-800",
      Environment: "bg-emerald-100 text-emerald-800",
      "Student Life": "bg-pink-100 text-pink-800",
      Research: "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              University <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Blogs</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest insights, tips, and announcements from your university community and beyond.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search articles by title, author, or topic..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter className="w-4 h-4 mr-2" />
              Categories
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {blogs.filter(blog => blog.featured).map((blog) => (
                <Card key={blog.id} className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img 
                        src={`https://images.unsplash.com/${blog.image}?auto=format&fit=crop&w=400&h=300`}
                        alt={blog.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(blog.category)}`}>
                            {blog.category}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Featured
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold hover:text-primary transition-colors cursor-pointer">
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {blog.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{blog.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{blog.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{blog.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{blog.likes}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Recent Articles</h3>
                <div className="space-y-4">
                  {blogs.filter(blog => !blog.featured).map((blog) => (
                    <Card key={blog.id} className="hover:shadow-[var(--shadow-card)] transition-all duration-300">
                      <CardHeader className="pb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getCategoryColor(blog.category)}`}>
                          {blog.category}
                        </span>
                        <CardTitle className="text-base font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-2">
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {blog.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{blog.date}</span>
                          <span>{blog.readTime}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{blog.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{blog.likes}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
