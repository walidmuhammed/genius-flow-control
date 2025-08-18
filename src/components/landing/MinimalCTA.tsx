import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';

export function MinimalCTA() {
  const navigate = useNavigate();

  // Generate grid particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }));

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0">
        <div className="pattern-grid opacity-20" />
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse-glow"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Main CTA content */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-8 leading-tight">
            Ready to Lead?
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
            Join 500+ companies who transformed their logistics in under 60 seconds
          </p>
          
          <p className="text-lg text-muted-foreground/80 mb-16">
            Start your free trial today. No credit card required.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/auth/client-signup')}
              className="group relative bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-12 py-6 text-xl rounded-2xl premium-glow transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Start Your Transformation Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="group border-2 border-border hover:border-primary/30 text-foreground hover:bg-primary/5 font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <Phone className="w-6 h-6" />
                Book Strategy Call
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Companies Trust Us</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">Uptime Guarantee</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>

          {/* Final message */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground/80">
              The future of logistics is here. Don't get left behind.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}