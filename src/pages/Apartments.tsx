
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Bed, Bath, Car, Wifi, Star, Search, Filter } from "lucide-react";
import Header from "@/components/Header";

const Apartments = () => {
  const apartments = [
    {
      id: 1,
      title: "Modern 2BR near Stanford Campus",
      price: "$2,800/month",
      location: "Palo Alto, CA",
      distance: "0.5 miles from campus",
      bedrooms: 2,
      bathrooms: 2,
      parking: true,
      wifi: true,
      rating: 4.8,
      reviews: 24,
      image: "photo-1522708323590-d24dbb6b0267",
      description: "Spacious apartment with modern amenities, perfect for students."
    },
    {
      id: 2,
      title: "Cozy Studio - Walking Distance",
      price: "$1,500/month",
      location: "Berkeley, CA",
      distance: "0.3 miles from campus",
      bedrooms: 1,
      bathrooms: 1,
      parking: false,
      wifi: true,
      rating: 4.6,
      reviews: 18,
      image: "photo-1484154218962-a197022b5858",
      description: "Perfect studio for individual students, fully furnished."
    },
    {
      id: 3,
      title: "Shared 4BR House",
      price: "$900/month per room",
      location: "Los Angeles, CA",
      distance: "1.2 miles from campus",
      bedrooms: 4,
      bathrooms: 3,
      parking: true,
      wifi: true,
      rating: 4.9,
      reviews: 31,
      image: "photo-1570129477492-45c003edd2be",
      description: "Great for students looking to share with roommates."
    },
    {
      id: 4,
      title: "Luxury 1BR with Amenities",
      price: "$2,200/month",
      location: "Cambridge, MA",
      distance: "0.8 miles from campus",
      bedrooms: 1,
      bathrooms: 1,
      parking: true,
      wifi: true,
      rating: 4.7,
      reviews: 15,
      image: "photo-1502672260266-1c1ef2d93688",
      description: "Premium apartment with gym, pool, and study areas."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Student <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Apartments</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect home for your university years. Browse apartments near your campus with student-friendly features and verified listings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by location, university, or apartment type..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <Card key={apartment.id} className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/${apartment.image}?auto=format&fit=crop&w=500&h=375`}
                    alt={apartment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-2">{apartment.title}</CardTitle>
                    <span className="text-lg font-bold text-primary">{apartment.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{apartment.location}</span>
                  </div>
                  <CardDescription className="text-sm text-secondary">
                    {apartment.distance}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{apartment.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{apartment.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{apartment.bathrooms}</span>
                    </div>
                    {apartment.parking && (
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>Parking</span>
                      </div>
                    )}
                    {apartment.wifi && (
                      <div className="flex items-center gap-1">
                        <Wifi className="w-4 h-4" />
                        <span>WiFi</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{apartment.rating}</span>
                      <span className="text-sm text-muted-foreground">({apartment.reviews})</span>
                    </div>
                    <Button size="sm" variant="hero">View Details</Button>
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

export default Apartments;
