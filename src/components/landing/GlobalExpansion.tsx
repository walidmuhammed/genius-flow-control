import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Globe, Rocket, TrendingUp } from 'lucide-react';

export function GlobalExpansion() {
  const [activePhase, setActivePhase] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById('expansion-map')?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const mapElement = document.getElementById('expansion-map');
    if (mapElement) {
      mapElement.addEventListener('mousemove', handleMouseMove);
      return () => mapElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const phases = [
    {
      title: 'Phase 1: Lebanon',
      subtitle: 'Dominating Lebanon\'s Logistics Landscape',
      status: 'Active',
      color: 'from-primary to-red-500',
      position: { x: 52, y: 35 },
      stats: { companies: '250+', coverage: '100%', growth: '+340%' },
      description: 'Complete market penetration with industry-leading adoption rates',
    },
    {
      title: 'Phase 2: Gulf & Middle East',
      subtitle: 'Regional Expansion Strategy',
      status: 'Coming Q2 2024',
      color: 'from-orange-500 to-yellow-500',
      position: { x: 65, y: 40 },
      stats: { target: '1,500+', markets: '8', timeline: '6 months' },
      description: 'Strategic partnerships with regional logistics leaders',
    },
    {
      title: 'Phase 3: Global',
      subtitle: 'Worldwide Logistics Revolution',
      status: 'Vision 2025',
      color: 'from-blue-500 to-cyan-500',
      position: { x: 20, y: 45 },
      stats: { vision: '50,000+', continents: '6', impact: 'Billions' },
      description: 'Transforming global logistics infrastructure',
    },
  ];

  const currentPhase = phases[activePhase];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)_/_0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,hsl(var(--primary)_/_0.02)_49%,hsl(var(--primary)_/_0.02)_51%,transparent_52%)] bg-[length:20px_20px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Global Expansion
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            From Lebanon{' '}
            <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              to the World
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Be part of the movement that's reshaping how the world moves packages
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive World Map */}
          <div className="relative">
            <div
              id="expansion-map"
              className="relative bg-card/10 backdrop-blur-sm border border-border/20 rounded-3xl p-8 h-96 overflow-hidden cursor-none"
            >
              {/* Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-card/5 to-card/20" />
              
              {/* Dynamic cursor effect */}
              <div
                className="absolute w-32 h-32 bg-primary/10 rounded-full blur-xl transition-all duration-300 pointer-events-none"
                style={{
                  left: `${mousePosition.x}%`,
                  top: `${mousePosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Phase Markers */}
              {phases.map((phase, index) => (
                <div
                  key={index}
                  className={`absolute cursor-pointer transition-all duration-300 ${
                    activePhase === index ? 'scale-125' : 'hover:scale-110'
                  }`}
                  style={{
                    left: `${phase.position.x}%`,
                    top: `${phase.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => setActivePhase(index)}
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${phase.color} shadow-lg relative`}>
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${phase.color} animate-ping opacity-75`} />
                  </div>
                  
                  {/* Connection Lines */}
                  {index < phases.length - 1 && (
                    <svg
                      className="absolute top-3 left-3 w-24 h-16 opacity-30"
                      viewBox="0 0 100 50"
                    >
                      <path
                        d="M 0 0 Q 50 -20 100 30"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-primary"
                      />
                    </svg>
                  )}
                </div>
              ))}

              {/* Floating geographical elements */}
              <div className="absolute top-4 right-4 text-xs text-muted-foreground font-mono">
                EXPANSION.MAP.V2.0
              </div>
            </div>
          </div>

          {/* Phase Details */}
          <div className="space-y-8">
            {/* Active Phase Card */}
            <Card className="bg-card/20 backdrop-blur-sm border-border/20 overflow-hidden">
              <CardContent className="p-8">
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${currentPhase.color} text-white px-3 py-1 rounded-full text-sm font-medium mb-4`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {currentPhase.status}
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{currentPhase.title}</h3>
                <h4 className="text-lg text-muted-foreground mb-4">{currentPhase.subtitle}</h4>
                <p className="text-muted-foreground mb-6">{currentPhase.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(currentPhase.stats).map(([key, value], index) => (
                    <div key={index} className="text-center">
                      <div className={`text-2xl font-bold bg-gradient-to-r ${currentPhase.color} bg-clip-text text-transparent`}>
                        {value}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Phase Timeline */}
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    activePhase === index 
                      ? 'bg-card/30 border border-border/30' 
                      : 'hover:bg-card/10'
                  }`}
                  onClick={() => setActivePhase(index)}
                >
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${phase.color} ${
                    activePhase === index ? 'animate-pulse' : ''
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{phase.title}</div>
                    <div className="text-sm text-muted-foreground">{phase.status}</div>
                  </div>
                  {activePhase === index && (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Impact Statement */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Join the Global Revolution
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every market we enter transforms. Every company we onboard leads their industry. 
              Be part of the movement that's redefining logistics worldwide.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}