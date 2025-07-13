
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Star, Search, Plus, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { CreateEventModal } from "@/components/CreateEventModal";
import { useEvents } from "@/contexts/EventsContext";
import { format } from "date-fns";

const Events = () => {
  const navigate = useNavigate();
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    events,
    loading,
    error,
    hasMore,
    searchQuery,
    loadEvents,
    searchEvents,
    registerForEvent,
    markAsViewed
  } = useEvents();

  const getCategoryColor = (category: string) => {
    const colors = {
      Academic: "bg-green-100 text-green-800",
      Social: "bg-blue-100 text-blue-800",
      Sports: "bg-orange-100 text-orange-800",
      Workshop: "bg-purple-100 text-purple-800",
      Networking: "bg-indigo-100 text-indigo-800",
      Career: "bg-emerald-100 text-emerald-800",
      Cultural: "bg-pink-100 text-pink-800",
      Other: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchEvents(searchTerm, true);
    } else {
      loadEvents(true);
    }
  };

  const handleEventClick = (event: any) => {
    markAsViewed(event.id);
    navigate(`/events/${event.id}`);
  };

  const handleRegisterClick = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    registerForEvent(eventId);
  };

  const loadMoreEvents = () => {
    if (hasMore && !loading) {
      if (searchQuery) {
        searchEvents(searchQuery, false);
      } else {
        loadEvents(false);
      }
    }
  };

  useEffect(() => {
    loadEvents(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
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

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search events by name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" variant="outline" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button type="button" variant="hero" size="lg" onClick={() => setCreateEventModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </form>

          {loading && events.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => loadEvents(true)} variant="outline">
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? `No events found for "${searchQuery}"` : 'No events available'}
              </p>
              {searchQuery && (
                <Button onClick={() => { setSearchTerm(''); loadEvents(true); }} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => handleEventClick(event)}>
                    <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
                      {event.bannerImage ? (
                        <img 
                          src={event.bannerImage}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
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
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatEventTime(event.startTime, event.endTime)}</span>
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
                          <div className={`w-2 h-2 rounded-full ${
                            event.status === 'upcoming' ? 'bg-green-500' :
                            event.status === 'ongoing' ? 'bg-blue-500' :
                            event.status === 'completed' ? 'bg-gray-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-muted-foreground capitalize">{event.status}</span>
                        </div>
                        {event.registrationRequired && (
                          <Button 
                            size="sm" 
                            variant={event.isRegistered ? "outline" : "hero"}
                            onClick={(e) => handleRegisterClick(e, event.id)}
                            disabled={event.attendees >= event.maxAttendees && !event.isRegistered}
                          >
                            {event.isRegistered ? 'Registered' : 
                             event.attendees >= event.maxAttendees ? 'Full' : 'Register'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button 
                    onClick={loadMoreEvents}
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Events'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <CreateEventModal open={createEventModalOpen} onOpenChange={setCreateEventModalOpen} />
    </div>
  );
};

export default Events;
