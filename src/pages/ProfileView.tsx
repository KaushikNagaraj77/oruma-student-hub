import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Edit3, 
  MessageCircle, 
  UserPlus, 
  Users, 
  MapPin, 
  Calendar,
  Trophy,
  Star,
  Award,
  GraduationCap,
  Book,
  Clock,
  Mail,
  CheckCircle,
  Heart,
  MessageSquare,
  Share2,
  Eye
} from "lucide-react";
import campusCover from "@/assets/campus-cover.jpg";
import kaushikProfile from "@/assets/kaushik-profile.jpg";

const ProfileView = () => {
  const [activeTab, setActiveTab] = useState("posts");

  const posts = [
    {
      id: 1,
      type: "study",
      title: "Advanced Algorithms Study Session",
      description: "Great study session for upcoming midterms! Thanks to everyone who joined 📚",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
      time: "2h ago",
      likes: 24,
      comments: 8,
      shares: 3
    },
    {
      id: 2,
      type: "food",
      title: "New Sushi Bar in Dining Hall",
      description: "Finally some good food on campus! 🍣 Perfect for a quick lunch between classes",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
      time: "1d ago",
      likes: 67,
      comments: 15,
      shares: 8
    },
    {
      id: 3,
      type: "project",
      title: "React Native App Demo",
      description: "Just finished my mobile app project for Software Engineering class. Built a campus navigation app 📱",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
      time: "3d ago",
      likes: 45,
      comments: 12,
      shares: 6
    }
  ];

  const photos = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1515169067868-5387ec121f5f?w=300&h=300&fit=crop"
  ];

  const achievements = [
    {
      title: "Dean's List Fall 2024",
      description: "Achieved GPA above 3.7 for exceptional academic performance",
      icon: Trophy,
      date: "December 2024",
      color: "text-yellow-600"
    },
    {
      title: "Scholarship Recipient",
      description: "Merit-based scholarship for Computer Science excellence",
      icon: Star,
      date: "September 2024",
      color: "text-blue-600"
    },
    {
      title: "Certified Python Tutor",
      description: "Qualified to tutor introductory Python programming courses",
      icon: Award,
      date: "August 2024",
      color: "text-green-600"
    },
    {
      title: "Study Group Leader",
      description: "Successfully organized and led 15+ study sessions",
      icon: Users,
      date: "Ongoing",
      color: "text-purple-600"
    }
  ];

  const skills = [
    { name: "Python", level: 90 },
    { name: "JavaScript", level: 85 },
    { name: "React", level: 80 },
    { name: "Data Structures", level: 85 },
    { name: "Machine Learning", level: 70 },
    { name: "SQL", level: 75 }
  ];

  return (
    <div className="min-h-screen bg-oruma-light-gray">
      {/* Header with Cover Photo */}
      <div className="relative">
        <div 
          className="h-80 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${campusCover})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Edit Button */}
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute top-4 right-4 z-10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>

        </div>

        {/* Profile Photo positioned to bridge background and content */}
        <div className="relative -mt-20 z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-center md:justify-start">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={kaushikProfile} alt="Kaushik Nagraj" />
                <AvatarFallback>KN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Content Section - Border starts from middle of profile picture */}
        <div className="bg-white -mt-24 pt-16">
          <div className="max-w-6xl mx-auto px-6 pb-6">
            {/* Profile Info Card */}
            <Card className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <h1 className="text-3xl font-bold">
                        <span className="text-blue-500">Kaushik</span> <span className="text-orange-500">Nagraj</span>
                      </h1>
                      <Badge variant="secondary" className="bg-blue-500 text-white border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <span className="text-lg font-medium text-gray-800">Stevens Institute of Technology</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 font-medium mb-2">Computer Science • Junior Year</p>
                    <p className="text-gray-600 text-sm mb-1">Data Science Grad Student | Machine Learning Engineer | AI Enthusiast</p>
                    <p className="text-gray-600 text-sm">Passionate about transforming data into meaningful insights and building solutions that drive impactful change.</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <p className="bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent font-medium text-lg">234 people in your circle</p>
                  
                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-blue-500 to-orange-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-orange-500 hover:text-white transition-all duration-300">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add to Circle
                    </Button>
                    <Button variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Study Together
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <p className="text-gray-600 mt-4 text-center md:text-left">Passionate CS student who loves building apps and organizing study groups 🚀</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-4 mb-6 bg-white border border-gray-200">
            <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">Posts</TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">Photos</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">Achievements</TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">About</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{post.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.time}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square relative overflow-hidden rounded-lg hover:opacity-80 transition-opacity cursor-pointer">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 text-white">
                      <achievement.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
                      <p className="text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{achievement.date}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Skills & Endorsements</h3>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Academic Info */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Academic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Major</p>
                    <p className="font-medium">Computer Science</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">Junior (Class of 2026)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GPA</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">3.8/4.0</p>
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">University only</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Courses</p>
                    <p className="font-medium">Data Structures, Algorithms, Software Engineering, Database Systems</p>
                  </div>
                </div>
              </Card>

              {/* Campus Involvement */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Campus Involvement
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Study Groups</p>
                    <p className="font-medium">CS Study Circle, Algorithm Masters, Python Programmers</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organizations</p>
                    <p className="font-medium">Computer Science Society, Tech Entrepreneurs Club</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Events Attended</p>
                    <p className="font-medium">45+ campus events this semester</p>
                  </div>
                </div>
              </Card>

              {/* Study Preferences */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Study Preferences
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Best Study Times</p>
                    <p className="font-medium">Evening (6-10 PM), Weekends</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Preferred Subjects</p>
                    <p className="font-medium">Programming, Algorithms, Math, Software Engineering</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Study Locations</p>
                    <p className="font-medium">Library, Computer Labs, Study Rooms</p>
                  </div>
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">University Email</p>
                    <p className="font-medium">knagraj@stevens.edu</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Study Availability</p>
                    <p className="font-medium">Available for study sessions Mon-Fri after 4 PM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <p className="font-medium">Hoboken, NJ</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;