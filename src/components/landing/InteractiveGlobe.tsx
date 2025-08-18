import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export function InteractiveGlobe() {
  const [activePhase, setActivePhase] = useState(0);

  const phases = [
    {
      title: 'Lebanon',
      subtitle: 'Active Now',
      status: 'active',
      color: 'text-primary',
      glow: 'shadow-[0_0_30px_hsl(0_79%_50%/0.4)]',
      description: 'Dominating Lebanon\'s logistics landscape with 500+ companies'
    },
    {
      title: 'Gulf & Middle East',
      subtitle: 'Coming Soon',
      status: 'coming',
      color: 'text-orange-400',
      glow: 'shadow-[0_0_20px_hsl(25_100%_50%/0.3)]',
      description: 'Expanding to revolutionize regional logistics operations'
    },
    {
      title: 'Global Domination',
      subtitle: 'Vision 2025',
      status: 'vision',
      color: 'text-white',
      glow: 'shadow-[0_0_15px_hsl(0_0%_100%/0.2)]',
      description: 'Worldwide logistics transformation platform'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % phases.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            From Lebanon to the World
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Be part of the movement that's reshaping how the world moves packages
          </p>
        </div>

        {/* Globe visualization */}
        <div className="relative flex items-center justify-center h-96 mb-16">
          {/* Globe background */}
          <div className="absolute w-80 h-80 rounded-full border-2 border-border/20 bg-gradient-to-br from-card/30 to-card/10 backdrop-blur-sm">
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              {/* Lebanon to Gulf */}
              <path
                d="M160 120 Q200 140 220 180"
                stroke="hsl(25 100% 50%)"
                strokeWidth="2"
                fill="none"
                opacity={activePhase >= 1 ? 0.8 : 0.2}
                className="transition-opacity duration-1000"
              />
              {/* Gulf to Global */}
              <path
                d="M220 180 Q180 220 120 240"
                stroke="hsl(0 0% 100%)"
                strokeWidth="2"
                fill="none"
                opacity={activePhase >= 2 ? 0.8 : 0.2}
                className="transition-opacity duration-1000"
              />
            </svg>

            {/* Location markers */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className={`w-4 h-4 rounded-full ${phases[0].glow} transition-all duration-1000 ${
                activePhase === 0 ? `bg-primary scale-150 ${phases[0].glow}` : 'bg-primary/60 scale-100'
              }`} />
            </div>
            
            <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
              <div className={`w-4 h-4 rounded-full transition-all duration-1000 ${
                activePhase === 1 ? `bg-orange-400 scale-150 ${phases[1].glow}` : 'bg-orange-400/40 scale-100'
              }`} />
            </div>
            
            <div className="absolute bottom-1/3 left-1/3 transform -translate-x-1/2 translate-y-1/2">
              <div className={`w-4 h-4 rounded-full transition-all duration-1000 ${
                activePhase === 2 ? `bg-white scale-150 ${phases[2].glow}` : 'bg-white/40 scale-100'
              }`} />
            </div>
          </div>

          {/* Floating particles */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Phase timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={`text-center cursor-pointer transition-all duration-500 ${
                activePhase === index ? 'scale-105' : 'scale-100'
              }`}
              onClick={() => setActivePhase(index)}
            >
              <div className={`glass-card rounded-3xl p-8 ${
                activePhase === index ? 'premium-glow border-primary/20' : 'border-border/10'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  <MapPin className={`w-8 h-8 ${phase.color}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  activePhase === index ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {phase.title}
                </h3>
                <p className={`text-sm font-medium mb-4 ${phase.color}`}>
                  {phase.subtitle}
                </p>
                <p className={`text-sm leading-relaxed ${
                  activePhase === index ? 'text-muted-foreground' : 'text-muted-foreground/60'
                }`}>
                  {phase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}