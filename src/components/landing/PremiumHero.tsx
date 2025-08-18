import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function PremiumHero() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate dot matrix pattern
  const dots = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: (i % 10) * 10,
    y: Math.floor(i / 10) * 10,
    delay: Math.random() * 2,
  }));

  return (
    <section className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Animated dot matrix background */}
      <div className="absolute inset-0">
        <div className="pattern-matrix opacity-30 w-full h-full" />
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-dot-matrix"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Headline */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight">
            <span className="block text-gradient">Logistics.</span>
            <span className="block text-gradient">Revolutionized.</span>
          </h1>

          {/* Subline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            60-second deployment. Infinite possibilities.
          </p>

          {/* CTA */}
          <Button
            size="lg"
            onClick={() => navigate('/auth/client-signup')}
            className="group relative bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 py-6 text-lg rounded-2xl shadow-lg premium-glow transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-3">
              Experience TOPSPEED
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>

        {/* Floating dashboard mockup */}
        <div className={`mt-20 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 animate-float">
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg" />
                  <span className="text-xl font-bold text-foreground">TOPSPEED</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>

              {/* Dashboard metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Active Orders', value: '2,847', trend: '+24%' },
                  { label: 'Revenue Today', value: '$89,420', trend: '+18%' },
                  { label: 'Efficiency Rate', value: '97.3%', trend: '+12%' },
                ].map((metric, index) => (
                  <div key={index} className="bg-card/50 rounded-xl p-4 border border-border/10">
                    <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                    <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                    <div className="text-xs text-primary">{metric.trend}</div>
                  </div>
                ))}
              </div>

              {/* Chart visualization */}
              <div className="bg-card/30 rounded-xl p-6 h-32 flex items-end justify-between gap-2">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-primary/60 to-primary/20 rounded-t-sm animate-pulse-glow"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`, 
                      width: '4%',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}