import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, ArrowRight, Zap, Clock, Users, CheckCircle, Phone, Mail } from 'lucide-react';

export function FinalCTA() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePosition({
        x: (clientX / innerWidth) * 100,
        y: (clientY / innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
  }));

  return (
    <section className="relative py-24 bg-background overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        {/* Gradient that follows mouse */}
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(1000px at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--primary)) 0%, transparent 70%)`,
          }}
        />
        
        {/* Animated particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/20 animate-float"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-primary/20 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-40 left-20 w-24 h-24 border border-primary/30 rounded-full animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Main CTA Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Rocket className="w-4 h-4" />
            Ready to Transform?
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Ready to Lead{' '}
            <span className="bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent">
              the Revolution?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Join 500+ companies who transformed their logistics in under 60 seconds.
            <span className="block mt-2 text-primary font-semibold">Your revolution starts now.</span>
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/auth/client-signup')}
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-16 py-8 text-2xl rounded-3xl shadow-2xl shadow-primary/40 transition-all duration-300 transform hover:scale-110"
            >
              <span className="relative z-10 flex items-center gap-4">
                <Zap className="w-8 h-8" />
                Start Your Transformation Now
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              
              {/* Animated background layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-red-600 animate-pulse opacity-20" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth/client-signin')}
              className="group border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary font-bold px-16 py-8 text-2xl rounded-3xl backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <span className="flex items-center gap-4">
                <Phone className="w-8 h-8" />
                Book Strategy Call
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Clock, title: '60 Seconds', subtitle: 'From chaos to control' },
              { icon: Users, title: '500+ Companies', subtitle: 'Already transformed' },
              { icon: CheckCircle, title: '14-Day Trial', subtitle: 'Risk-free guarantee' },
            ].map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xl font-bold">{indicator.title}</div>
                  <div className="text-muted-foreground">{indicator.subtitle}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="max-w-2xl mx-auto bg-card/20 backdrop-blur-sm border-border/20 mb-16">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Stay Ahead of the Revolution
            </h3>
            <p className="text-muted-foreground mb-6">
              Get exclusive insights on logistics innovation and be first to know about our global expansion.
            </p>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email for exclusive updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background/50 border-border/30"
              />
              <Button 
                className="bg-gradient-to-r from-primary to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8"
              >
                <Mail className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Final Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '60s', label: 'Setup Time' },
            { value: '500+', label: 'Companies' },
            { value: '770K+', label: 'Orders Processed' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat, index) => (
            <div key={index} className="group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/30">
          <p className="text-muted-foreground">
            © 2024 TOPSPEED. All rights reserved. • 
            <span className="text-primary ml-2">Revolutionizing logistics, one delivery at a time.</span>
          </p>
        </div>
      </div>
    </section>
  );
}