import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, User, Users, Share2, Heart, UserCheck, Star } from "lucide-react";
import Header from "@/components/Header";
import { format } from "date-fns";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

  // Mock data - in real app, this would come from API
  const event = {
    id: 1,
    title: "Python Workshop for Beginners",
    description: "Join us for an intensive Python programming workshop designed for students with little to no programming experience. This hands-on session will cover Python basics, data structures, and practical applications in data science and web development. By the end of this workshop, you'll have built your first Python project and gained confidence to continue learning on your own.",
    category: "Academic",
    date: new Date("2024-01-25"),
    startTime: "14:00",
    endTime: "17:00",
    location: "Computer Science Building, Room 101",
    organizer: {
      name: "Dr. Sarah Chen",
      role: "Computer Science Professor",
      university: "Stanford University",
      rating: 4.9,
      eventsOrganized: 23
    },
    capacity: 50,
    registeredCount: 42,
    bannerImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=600",
    agenda: [
      { time: "2:00 PM", title: "Welcome & Setup", description: "Getting Python environment ready" },
      { time: "2:30 PM", title: "Python Basics", description: "Variables, data types, and basic operations" },
      { time: "3:30 PM", title: "Break", description: "15-minute refreshment break" },
      { time: "3:45 PM", title: "Data Structures", description: "Lists, dictionaries, and loops" },
      { time: "4:30 PM", title: "Hands-on Project", description: "Build a simple calculator app" },
      { time: "5:00 PM", title: "Q&A & Wrap-up", description: "Questions and next steps" }
    ],
    tags: ["Python", "Programming", "Beginner-Friendly", "Hands-on", "CS"],
    requirements: [
      "Bring your laptop",
      "No prior programming experience required",
      "Install Python 3.8+ beforehand (instructions will be sent)"
    ]
  };

  const relatedEvents = [
    {
      id: 2,
      title: "JavaScript Fundamentals",
      date: new Date("2024-01-30"),
      time: "10:00 AM",
      location: "Tech Hub",
      category: "Academic",
      image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=400&h=300"
    },
    {
      id: 3,
      title: "Data Science with R",
      date: new Date("2024-02-05"),
      time: "2:00 PM",
      location: "Statistics Lab",
      category: "Academic",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=300"
    },
    {
      id: 4,
      title: "Web Development Bootcamp",
      date: new Date("2024-02-10"),
      time: "9:00 AM",
      location: "Innovation Center",
      category: "Workshop",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&h=300"
    }
  ];

  const handleRegistration = () => {
    setIsRegistered(!isRegistered);
  };

  const spotsLeft = event.capacity - event.registeredCount;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button 
            onClick={() => navigate('/events')}
            className="hover:text-primary transition-colors"
          >
            Events
          </button>
          <span>•</span>
          <span>{event.category}</span>
          <span>•</span>
          <span className="text-foreground">{event.title}</span>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="aspect-[16/6] bg-muted rounded-lg overflow-hidden">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="mb-2 bg-white/20 text-white border-white/30">
                    {event.category}
                  </Badge>
                  <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(event.date, "EEEE, MMMM do, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">{event.description}</p>
                
                {/* Requirements */}
                <div className="space-y-3">
                  <h4 className="font-semibold">What to Bring</h4>
                  <ul className="space-y-2">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Agenda */}
            <Card>
              <CardHeader>
                <CardTitle>Event Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.agenda.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-20 text-sm font-medium text-primary">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">{item.title}</h5>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Topics Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registration</CardTitle>
                  <Badge variant={spotsLeft > 10 ? "secondary" : "destructive"}>
                    {spotsLeft} spots left
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-medium">{event.registeredCount}/{event.capacity}</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                  />
                </div>

                <Button 
                  className="w-full" 
                  variant={isRegistered ? "outline" : "hero"}
                  onClick={handleRegistration}
                  disabled={spotsLeft === 0 && !isRegistered}
                >
                  {isRegistered ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Registered
                    </>
                  ) : spotsLeft === 0 ? (
                    "Event Full"
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Free for university students
                </p>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.organizer.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{event.organizer.role}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{event.organizer.rating}</span>
                      </div>
                      <span>{event.organizer.eventsOrganized} events organized</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.organizer.university}</span>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{format(event.date, "EEEE, MMMM do")}</p>
                    <p className="text-sm text-muted-foreground">{format(event.date, "yyyy")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{event.startTime} - {event.endTime}</p>
                    <p className="text-sm text-muted-foreground">3 hours duration</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-muted-foreground">Stanford University</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((relatedEvent) => (
              <Card key={relatedEvent.id} className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="aspect-[16/10] bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={relatedEvent.image}
                    alt={relatedEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {relatedEvent.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">{relatedEvent.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{format(relatedEvent.date, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{relatedEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{relatedEvent.location}</span>
                    </div>
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

export default EventDetail;