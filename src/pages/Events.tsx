
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Star, Search, Filter } from "lucide-react";

const Events = () => {
  const events = [
    {
      id: 1,
      title: "Tech Career Fair 2024",
      date: "March 15, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Student Union Building",
      university: "Stanford University",
      attendees: 150,
      maxAttendees: 200,
      category: "Career",
      image: "photo-1515187029135-18ee286d815b",
      description: "Connect with top tech companies and explore internship opportunities."
    },
    {
      id: 2,
      title: "Study Abroad Information Session",
      date: "March 18, 2024",
      time: "6:00 PM - 8:00 PM",
      location: "Library Auditorium",
      university: "UC Berkeley",
      attendees: 45,
      maxAttendees: 100,
      category: "Academic",
      image: "photo-1523050854058-8df90110c9d1",
      description: "Learn about international exchange programs and application processes."
    },
    {
      id: 3,
      title: "Spring Concert - Campus Band",
      date: "March 22, 2024",
      time: "7:30 PM - 10:00 PM",
      location: "Outdoor Amphitheater",
      university: "UCLA",
      attendees: 300,
      maxAttendees: 500,
      category: "Entertainment",
      image: "photo-1493225457124-a3eb161ffa5f",
      description: "Enjoy live music from talented student performers under the stars."
    },
    {
      id: 4,
      title: "Entrepreneurship Workshop",
      date: "March 25, 2024",
      time: "2:00 PM - 5:00 PM",
      location: "Business School, Room 101",
      university: "MIT",
      attendees: 25,
      maxAttendees: 50,
      category: "Workshop",
      image: "photo-1517245386807-bb43f82c33c4",
      description: "Learn from successful alumni about starting your own business."
    },
    {
      id: 5,
      title: "International Food Festival",
      date: "March 28, 2024",
      time: "11:00 AM - 6:00 PM",
      location: "Campus Quad",
      university: "Harvard University",
      attendees: 400,
      maxAttendees: 600,
      category: "Cultural",
      image: "photo-1555939594-58d7cb561ad1",
      description: "Taste cuisines from around the world prepared by international student clubs."
    },
    {
      id: 6,
      title: "Mental Health Awareness Week",
      date: "April 1-5, 2024",
      time: "Various Times",
      location: "Multiple Locations",
      university: "Yale University",
      attendees: 200,
      maxAttendees: 300,
      category: "Wellness",
      image: "photo-1506905925346-21bda4d32df4",
      description: "Week-long series of workshops, talks, and activities promoting mental wellness."
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      Career: "bg-blue-100 text-blue-800",
      Academic: "bg-green-100 text-green-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Workshop: "bg-orange-100 text-orange-800",
      Cultural: "bg-pink-100 text-pink-800",
      Wellness: "bg-teal-100 text-teal-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Campus <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Events</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Never miss out on campus happenings! Discover events, workshops, and activities that enrich your university experience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search events by name, category, or location..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/${event.image}?auto=format&fit=crop&w=500&h=375`}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{event.attendees}/{event.maxAttendees}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">{event.title}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                  <p className="text-xs text-secondary font-medium mb-4">{event.university}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-muted-foreground">Available</span>
                    </div>
                    <Button size="sm" variant="hero">Register</Button>
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

export default Events;
