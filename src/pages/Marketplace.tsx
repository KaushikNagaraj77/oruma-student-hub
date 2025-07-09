
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Filter, User, Star } from "lucide-react";
import Header from "@/components/Header";
import { MessageButton } from "@/components/MessageButton";

const Marketplace = () => {
  const items = [
    {
      id: 1,
      sellerId: "2",
      title: "MacBook Pro 13\" 2021",
      price: "$1,200",
      condition: "Like New",
      seller: "Emma Davis",
      university: "Stanford University",
      rating: 4.9,
      image: "photo-1496181133206-80ce9b88a853",
      description: "Barely used MacBook Pro perfect for students. Includes charger and case."
    },
    {
      id: 2,
      sellerId: "3",
      title: "Calculus Textbook Bundle",
      price: "$80",
      condition: "Good",
      seller: "Mike Johnson",
      university: "MIT",
      rating: 4.7,
      image: "photo-1481627834876-b7833e8f5570",
      description: "Complete calculus textbook set with solution manual. Great condition."
    },
    {
      id: 3,
      sellerId: "4",
      title: "Mini Fridge - Perfect for Dorms",
      price: "$150",
      condition: "Excellent",
      seller: "Sarah Wilson",
      university: "UC Berkeley",
      rating: 5.0,
      image: "photo-1556909114-f6e7ad7d3136",
      description: "Compact refrigerator ideal for dorm rooms. Energy efficient and quiet."
    },
    {
      id: 4,
      sellerId: "5",
      title: "Study Desk with Lamp",
      price: "$75",
      condition: "Good",
      seller: "Alex Chen",
      university: "UCLA",
      rating: 4.8,
      image: "photo-1586023492125-27b2c045efd7",
      description: "Sturdy wooden desk with built-in LED lamp. Perfect for late-night studying."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Student <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Marketplace</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buy and sell items within your trusted student community. From textbooks to tech, find everything you need for university life.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search for textbooks, electronics, furniture..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="hero" size="lg">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Sell Item
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=400&h=400`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-2">{item.title}</CardTitle>
                    <span className="text-lg font-bold text-primary">{item.price}</span>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    Condition: {item.condition}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{item.seller}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                    <MessageButton 
                      userId={item.sellerId} 
                      userName={item.seller}
                      size="sm"
                    />
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

export default Marketplace;
