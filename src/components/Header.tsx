
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Home, ShoppingBag, Calendar, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (sectionId: string) => {
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (path: string, sectionId: string) => {
    if (isHomePage) {
      scrollToSection(sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-bold text-foreground">Oruma</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {isHomePage ? (
              <>
                <button 
                  onClick={() => scrollToSection('feed')} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Feed
                </button>
                <button 
                  onClick={() => scrollToSection('marketplace')} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </button>
                <button 
                  onClick={() => scrollToSection('apartments')} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Apartments
                </button>
                <button 
                  onClick={() => scrollToSection('events')} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </button>
                <button 
                  onClick={() => scrollToSection('blogs')} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Blogs
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/feed"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Feed
                </Link>
                <Link 
                  to="/marketplace"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </Link>
                <Link 
                  to="/apartments"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Apartments
                </Link>
                <Link 
                  to="/events"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link 
                  to="/blogs"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Blogs
                </Link>
              </>
            )}
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
