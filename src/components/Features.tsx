
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Home, FileText, MessageSquare, Calendar, Shield, Star } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Social Feed",
      description: "Easily find roommates and share campus experiences through engaging posts in a verified student community.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Buy and sell textbooks, electronics, furniture, and more within a trusted network of verified students.",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: Home,
      title: "Apartment Finder",
      description: "Discover nearby apartments with tailored search filters to find the perfect home for your university years.",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: FileText,
      title: "University Blogs",
      description: "Stay informed with the latest official blogs and announcements from your institution in one central hub.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging",
      description: "Communicate effortlessly with fellow students and potential roommates through our secure messaging system.",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      icon: Calendar,
      title: "Event Announcements",
      description: "Never miss out on campus happenings and community events with personalized notifications and reminders.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "Connect with peers through verified student profiles ensuring a safe and secure environment for everyone.",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "Enjoy an ad-free experience with priority support and exclusive features designed for serious students.",
      gradient: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <section className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need for
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> University Life</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Oruma brings together all the essential tools and connections you need to thrive during your university journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
