import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, Zap, ArrowRight, Globe } from 'lucide-react';

export function RevolutionHero() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
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

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <section className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Dynamic gradient that follows mouse */}
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(800px at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--primary)) 0%, transparent 70%)`,
          }}
        />
        
        {/* Geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 border border-primary/20 rotate-45 animate-spin-slow" />
          <div className="absolute bottom-40 right-20 w-24 h-24 border border-primary/30 rotate-12 animate-pulse" />
          <div className="absolute top-1/2 right-10 w-40 h-40 border border-primary/10 rounded-full animate-float" />
        </div>

        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/30 animate-float"
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <Rocket className="w-4 h-4" />
            Revolutionary SAAS Platform
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="block text-foreground">From Chaos to</span>
            <span className="block bg-gradient-to-r from-primary via-primary to-red-400 bg-clip-text text-transparent">
              Control in 60 Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Join the logistics revolution. Transform your delivery business with the world's fastest 
            <span className="text-primary font-semibold"> SAAS dashboard deployment.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/auth/client-signup')}
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl shadow-primary/30 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Launch Your Revolution
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth/client-signin')}
              className="group border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <Globe className="w-6 h-6" />
                See Live Demo
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-card/10 backdrop-blur-sm border border-border/20 rounded-3xl p-8 shadow-2xl">
              <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border/10">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg" />
                    <span className="text-lg font-bold">TOPSPEED</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Orders Today', value: '1,247', change: '+12%' },
                    { label: 'Revenue', value: '$47,529', change: '+8%' },
                    { label: 'Efficiency', value: '94.2%', change: '+15%' },
                  ].map((stat, index) => (
                    <div key={index} className="bg-background/50 rounded-xl p-4 border border-border/10">
                      <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-green-400">{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Mock Chart */}
                <div className="bg-background/30 rounded-xl p-4 h-32 flex items-end justify-between gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-primary to-primary/50 rounded-t"
                      style={{ height: `${Math.random() * 80 + 20}%`, width: '8%' }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Floating elements around dashboard */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-float" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}