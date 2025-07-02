import { MessageSquare, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold">Oruma</span>
            </div>
            <p className="text-background/70 max-w-xs">
              Your all-in-one student life companion. Connecting students across universities for a better campus experience.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Social Feed</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Marketplace</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Apartment Finder</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Events</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">About</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-background/70" />
                <span className="text-background/70">hello@oruma.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-background/70" />
                <span className="text-background/70">Live Chat Support</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-background/70" />
                <span className="text-background/70">Campus Locations</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/70">
            © 2024 Oruma. All rights reserved. Built for students, by students.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;