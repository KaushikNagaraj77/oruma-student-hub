
import { Button } from "@/components/ui/button";
import { Users, Home, ShoppingBag, Calendar, FileText, PlusCircle, Edit3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenCreatePostModal: () => void;
}

const Header = ({ onOpenCreatePostModal }: HeaderProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Simplified scroll logic for example, actual implementation might vary
  const scrollToSection = (sectionId: string) => {
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-bold text-foreground">Oruma</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {[
              { to: "/feed", label: "Feed", icon: Users },
              { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
              { to: "/apartments", label: "Apartments", icon: Home },
              { to: "/events", label: "Events", icon: Calendar },
              { to: "/blogs", label: "Blogs", icon: FileText },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  location.pathname.startsWith(item.to) ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
           <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreatePostModal}
            className="gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 sm:hidden" />
            <PlusCircle className="w-3.5 h-3.5 hidden sm:block" />
            <span className="hidden sm:inline">Create Post</span>
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button variant="hero" size="sm"> {/* Adjusted size for consistency */}
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
