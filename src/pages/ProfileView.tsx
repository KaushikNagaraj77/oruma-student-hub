import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  BookOpen, 
  Award, 
  Heart,
  Share,
  MoreHorizontal,
  Plus,
  Settings,
  UserPlus,
  Coffee,
  CheckCircle,
  Building2,
  GraduationCap,
  MapPin,
  Grid3X3,
  Camera,
  Trophy,
  Briefcase,
  Info
} from 'lucide-react';

export default function ProfileView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  const profileData = {
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex.johnson@university.edu',
    university: 'Stanford University',
    year: 'Junior',
    major: 'Computer Science',
    bio: 'Passionate CS student who loves building apps and organizing study groups 🚀 Always down for coffee chats about tech!',
    avatar: user?.avatar || '',
    coverPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop',
    circleCount: 234,
    posts: 42,
    following: 156,
    followers: 89
  };

  const posts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop',
      caption: 'Late night coding session at the library! Working on my React project 💻',
      likes: 24,
      comments: 8,
      timeAgo: '2h'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=400&auto=format&fit=crop',
      caption: 'Study group setup for our algorithms exam tomorrow! Thanks team 📚',
      likes: 31,
      comments: 12,
      timeAgo: '1d'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=400&auto=format&fit=crop',
      caption: 'Celebrating the end of midterms with some good food! 🎉',
      likes: 18,
      comments: 5,
      timeAgo: '3d'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=400&auto=format&fit=crop',
      caption: 'Beautiful sunset after a productive day on campus 🌅',
      likes: 45,
      comments: 15,
      timeAgo: '5d'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop',
      caption: 'Weekend hiking trip with the CS club! Nature is the best debugger 🏔️',
      likes: 67,
      comments: 23,
      timeAgo: '1w'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop',
      caption: 'Hackathon prep mode: activated! 48 hours to build something amazing ⚡',
      likes: 38,
      comments: 14,
      timeAgo: '1w'
    }
  ];

  const achievements = [
    { title: "Dean's List Fall 2024", icon: '🏆', description: 'Academic Excellence' },
    { title: "Hackathon Winner", icon: '🥇', description: 'Best Mobile App 2024' },
    { title: "Study Group Leader", icon: '👥', description: 'Leading 3 groups' },
    { title: "Scholarship Recipient", icon: '💰', description: 'Merit-based award' }
  ];

  const projects = [
    {
      title: 'Campus Connect App',
      description: 'Social platform connecting students across universities',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop',
      tech: ['React', 'Node.js', 'MongoDB']
    },
    {
      title: 'Study Buddy Finder',
      description: 'AI-powered matching system for study partners',
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=400&auto=format&fit=crop',
      tech: ['Python', 'TensorFlow', 'Flask']
    }
  ];

  const studyGroups = [
    { 
      name: 'Algorithms & Data Structures', 
      members: ['Sarah', 'Mike', 'Emma', '+5'],
      memberCount: 8,
      subject: 'Computer Science'
    },
    { 
      name: 'Calculus Study Circle', 
      members: ['John', 'Lisa', 'Alex', '+3'],
      memberCount: 6,
      subject: 'Mathematics'
    }
  ];

  const organizations = [
    { name: 'Computer Science Club', role: 'Vice President', logo: '💻' },
    { name: 'Coding Bootcamp', role: 'Mentor', logo: '🎓' },
    { name: 'Hackathon Society', role: 'Member', logo: '⚡' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Please sign in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Cover Photo & Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div 
          className="h-64 md:h-80 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${profileData.coverPhoto})` }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Info Overlay */}
        <div className="relative -mt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5">
              {/* Profile Picture */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Profile Info */}
              <div className="mt-6 sm:mt-0 sm:flex-1 sm:min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <div className="flex items-center space-x-2 text-gray-600 mt-1">
                      <Building2 className="h-4 w-4" />
                      <span>{profileData.university}</span>
                      <span>•</span>
                      <span>{profileData.year}</span>
                      <span>•</span>
                      <GraduationCap className="h-4 w-4" />
                      <span>{profileData.major}</span>
                    </div>
                    <p className="text-blue-600 font-semibold text-lg mt-2">
                      {profileData.circleCount} people in your circle
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add to Circle
                    </Button>
                    <Button size="sm" variant="outline">
                      <Coffee className="h-4 w-4 mr-2" />
                      Study Together
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileData.posts}</div>
                    <div className="text-sm text-gray-500">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileData.followers}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profileData.following}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-700 mt-4 max-w-lg">{profileData.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={post.image} 
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-4 text-white">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-5 w-5 mr-1" />
                          {post.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{post.timeAgo}</span>
                      <div className="flex space-x-4">
                        <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="hover:text-gray-700 transition-colors">
                          <Share className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {posts.map((post) => (
                <div key={post.id} className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src={post.image} 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{achievement.title}</h3>
                      <p className="text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Projects Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Featured Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Study Groups */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Study Groups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {studyGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-gray-500">{group.subject}</p>
                        <div className="flex -space-x-2 mt-2">
                          {group.members.map((member, idx) => (
                            <div key={idx} className="h-6 w-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs text-blue-600">
                              {member.includes('+') ? member : member[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline">{group.memberCount} members</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Organizations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Organizations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {organizations.map((org, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{org.logo}</div>
                        <div>
                          <h4 className="font-medium">{org.name}</h4>
                          <p className="text-sm text-gray-500">{org.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}