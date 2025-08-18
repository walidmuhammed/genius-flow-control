import React from 'react';
import { Database, Cloud, Zap, Shield, Cpu, Globe } from 'lucide-react';

export function OrbitingTech() {
  const techIcons = [
    { icon: Database, label: 'Database', delay: 0 },
    { icon: Cloud, label: 'Cloud', delay: 1 },
    { icon: Zap, label: 'Performance', delay: 2 },
    { icon: Shield, label: 'Security', delay: 3 },
    { icon: Cpu, label: 'AI/ML', delay: 4 },
    { icon: Globe, label: 'Global', delay: 5 }
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Built Different
          </h2>
        </div>

        {/* Orbiting animation container */}
        <div className="relative flex items-center justify-center h-96">
          {/* Center logo */}
          <div className="absolute z-10 glass-card rounded-3xl p-8 animate-pulse-glow">
            <div className="text-3xl font-bold text-gradient">TOPSPEED</div>
          </div>

          {/* Orbit rings */}
          <div className="absolute inset-0 border border-border/20 rounded-full opacity-30" />
          <div className="absolute inset-8 border border-border/10 rounded-full opacity-20" />

          {/* Orbiting tech icons */}
          {techIcons.map((tech, index) => {
            const Icon = tech.icon;
            const angle = (index * 60) * (Math.PI / 180); // 60 degrees apart
            const radius = 150;
            
            return (
              <div
                key={index}
                className="absolute animate-orbit"
                style={{
                  animationDelay: `${tech.delay}s`,
                  transformOrigin: 'center',
                }}
              >
                <div 
                  className="glass-card rounded-2xl p-4 group hover:scale-110 transition-all duration-300 cursor-pointer"
                  style={{
                    transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                  }}
                >
                  <Icon className="w-6 h-6 text-primary group-hover:text-foreground transition-colors duration-300" />
                </div>
              </div>
            );
          })}

          {/* Background particles */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Tech stack list */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            {techIcons.map((tech, index) => (
              <div
                key={index}
                className="flex items-center gap-2 hover:text-foreground transition-colors duration-300 cursor-pointer"
              >
                <tech.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tech.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}