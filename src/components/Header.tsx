import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Home, ShoppingBag, Calendar, FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-bold text-foreground">Oruma</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#feed" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Users className="w-4 h-4" />
              Feed
            </a>
            <a href="#marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Marketplace
            </a>
            <a href="#apartments" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
              Apartments
            </a>
            <a href="#events" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Calendar className="w-4 h-4" />
              Events
            </a>
            <a href="#publications" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <FileText className="w-4 h-4" />
              Publications
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button variant="hero" size="lg">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;