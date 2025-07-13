import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/Header';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  BookOpen, 
  Award, 
  Shield, 
  MapPin, 
  Eye, 
  EyeOff,
  Star,
  TrendingUp,
  Activity,
  BookMarked,
  Coffee,
  CheckCircle,
  Globe,
  Building2,
  GraduationCap,
  Target,
  Heart,
  PlusCircle
} from 'lucide-react';

export default function ProfileView() {
  const { user } = useAuth();
  const [showGPA, setShowGPA] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    profile: 'All Universities',
    academic: 'My University Only',
    activities: 'Circle Only'
  });

  const profileData = {
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex.johnson@university.edu',
    university: 'Stanford University',
    year: 'Junior',
    major: 'Computer Science',
    minor: 'Mathematics',
    gpa: 3.8,
    progress: 75,
    avatar: user?.avatar || '',
    verified: true,
    currentCourses: 5,
    bio: 'Passionate about technology and connecting with fellow students. Always up for study groups and campus events!'
  };

  const achievements = [
    { title: "Dean's List Fall 2024", icon: Award, color: "text-yellow-600" },
    { title: "Scholarship Recipient", icon: Star, color: "text-blue-600" },
    { title: "Certified Python Tutor", icon: BookMarked, color: "text-green-600" },
    { title: "Study Group Leader", icon: Users, color: "text-purple-600" }
  ];

  const recentActivities = [
    {
      type: 'post',
      content: 'Just finished my Data Structures assignment! Looking for study partners for the upcoming exam.',
      engagement: '12 likes • 5 comments',
      time: '2 hours ago'
    },
    {
      type: 'event',
      content: 'Attended "AI in Healthcare" seminar',
      engagement: 'Networked with 8 students',
      time: '1 day ago'
    },
    {
      type: 'study',
      content: 'Led Calculus III study group',
      engagement: '6 participants',
      time: '3 days ago'
    }
  ];

  const studyGroups = [
    { name: 'Organic Chemistry Masters', role: 'Leader', members: 12, subject: 'Chemistry' },
    { name: 'Data Structures & Algorithms', role: 'Member', members: 8, subject: 'Computer Science' },
    { name: 'Linear Algebra Study Circle', role: 'Member', members: 6, subject: 'Mathematics' },
    { name: 'Machine Learning Enthusiasts', role: 'Co-leader', members: 15, subject: 'AI/ML' }
  ];

  const recentEvents = [
    { name: 'Tech Career Fair', date: 'Nov 15', attendees: 200, type: 'attended' },
    { name: 'Study Skills Workshop', date: 'Nov 10', attendees: 45, type: 'organized' },
    { name: 'CS Department Mixer', date: 'Nov 5', attendees: 80, type: 'attended' }
  ];

  const endorsements = [
    { skill: 'Python Programming', count: 23 },
    { skill: 'Study Leadership', count: 18 },
    { skill: 'Team Collaboration', count: 15 },
    { skill: 'Mathematics Tutoring', count: 12 }
  ];

  const circleMembers = [
    { name: 'Sarah Chen', university: 'MIT', major: 'Computer Science', avatar: '' },
    { name: 'Marcus Williams', university: 'Harvard', major: 'Biology', avatar: '' },
    { name: 'Emma Rodriguez', university: 'Stanford', major: 'Engineering', avatar: '' },
    { name: 'James Kim', university: 'Berkeley', major: 'Mathematics', avatar: '' }
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
      
      <div className="container py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Academic Identity */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Header */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profileData.avatar} alt={profileData.name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {profileData.verified && (
                      <div className="absolute -bottom-1 -right-1">
                        <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {profileData.university}
                    </p>
                  </div>

                  {/* Academic Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{profileData.year} Year</span>
                      <span className="text-blue-600 font-medium">{profileData.progress}% Complete</span>
                    </div>
                    <Progress value={profileData.progress} className="h-2" />
                  </div>

                  {/* Major/Minor */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">{profileData.major}</span>
                    </div>
                    <p className="text-sm text-gray-500">{profileData.minor} Minor</p>
                  </div>

                  {/* GPA */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {showGPA ? `${profileData.gpa} GPA` : 'GPA Hidden'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGPA(!showGPA)}
                      className="h-6 w-6 p-0"
                    >
                      {showGPA ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Current Courses */}
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Taking {profileData.currentCourses} courses this semester
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Coffee className="h-4 w-4 mr-2" />
                      Study Together
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                    <span className="text-sm font-medium">{achievement.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Privacy Controls */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(privacySettings).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{key}</span>
                      <Badge variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Activity & Engagement */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Recent Activity */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4 last:pb-0">
                    <p className="text-sm font-medium text-gray-900">{activity.content}</p>
                    <p className="text-xs text-blue-600 mt-1">{activity.engagement}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Groups */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Study Groups
                </CardTitle>
                <CardDescription>
                  Leading 2 groups • Member of 4 groups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {studyGroups.map((group, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{group.name}</h4>
                        <p className="text-xs text-gray-500">{group.subject}</p>
                      </div>
                      <Badge variant={group.role === 'Leader' ? 'default' : 'secondary'} className="text-xs">
                        {group.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{group.members} members</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Events */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Campus Events
                </CardTitle>
                <CardDescription>
                  Attended 15 events • Organized 3
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentEvents.map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-gray-500">{event.date} • {event.attendees} attendees</p>
                    </div>
                    <Badge variant={event.type === 'organized' ? 'default' : 'outline'} className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Network & Skills */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Your Circle */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Your Circle
                </CardTitle>
                <CardDescription>
                  234 people across universities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {circleMembers.map((member, index) => (
                    <div key={index} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                      <Avatar className="h-12 w-12 mx-auto mb-2">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.university}</p>
                      <p className="text-xs text-blue-600">{member.major}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  View All Connections
                </Button>
              </CardContent>
            </Card>

            {/* Study Compatibility */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Study Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">Great match for:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-700">Organic Chemistry</Badge>
                  <Badge className="bg-blue-100 text-blue-700">Data Structures</Badge>
                  <Badge className="bg-purple-100 text-purple-700">Linear Algebra</Badge>
                </div>
                <div className="pt-2">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    <Users className="h-4 w-4 mr-2" />
                    Find Study Partners
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Endorsements */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Peer Endorsements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {endorsements.map((endorsement, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{endorsement.skill}</span>
                    <Badge variant="outline" className="text-xs">
                      {endorsement.count}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  Request Endorsement
                </Button>
              </CardContent>
            </Card>

            {/* Campus Organizations */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Campus Organizations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">Computer Science Club</p>
                      <p className="text-xs text-gray-500">Stanford University</p>
                    </div>
                    <Badge className="text-xs bg-blue-100 text-blue-700">
                      Vice President
                    </Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">Math Tutoring Society</p>
                      <p className="text-xs text-gray-500">Stanford University</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Member
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}