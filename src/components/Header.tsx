
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Home, ShoppingBag, Calendar, FileText, User, Settings, LogOut, Eye, Edit, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, logout } = useAuth();

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
              to="/olive"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Olive
            </Link>
            <Link 
              to="/blogs"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <FileText className="w-4 h-4" />
              Blogs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">{user.name.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border border-gray-200 rounded-lg">
                <DropdownMenuItem asChild className="hover:bg-blue-50 transition-colors">
                  <Link to="/profile/view" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-blue-50 transition-colors">
                  <Link to="/profile" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-blue-50 transition-colors">
                  <Link to="/messages" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
