import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
            <Sparkles className="w-4 h-4" />
            Join the Student Revolution
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Ready to Transform Your
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
              University Experience?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who've already discovered the power of Oruma. 
            Sign up today and unlock the ultimate campus life companion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">🎓</div>
              <div className="text-sm text-muted-foreground mt-2">Student Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">🔒</div>
              <div className="text-sm text-muted-foreground mt-2">Secure & Safe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">📱</div>
              <div className="text-sm text-muted-foreground mt-2">Mobile Ready</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">⚡</div>
              <div className="text-sm text-muted-foreground mt-2">Lightning Fast</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;