import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, TrendingUp, Users } from 'lucide-react';

export function MarketExpansion() {
  const [activePhase, setActivePhase] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Auto-cycle through phases
          const interval = setInterval(() => {
            setActivePhase(prev => (prev + 1) % 3);
          }, 4000);
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('market-expansion');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const phases = [
    {
      id: 'lebanon',
      title: "Dominating Lebanon's Logistics Landscape",
      subtitle: "Phase 1 • Active",
      status: "active",
      description: "Revolutionizing local delivery operations across all Lebanese regions",
      stats: [
        { label: "Cities Covered", value: "26+" },
        { label: "Active Clients", value: "500+" },
        { label: "Daily Orders", value: "15K+" }
      ],
      color: "from-[#DB271E] to-[#c0211a]",
      countries: ["Lebanon"],
      progress: 85
    },
    {
      id: 'gulf',
      title: "Gulf & Middle East Expansion",
      subtitle: "Phase 2 • Coming 2024",
      status: "coming",
      description: "Scaling across UAE, Saudi Arabia, Qatar, and regional markets",
      stats: [
        { label: "Target Markets", value: "8" },
        { label: "Projected Clients", value: "2K+" },
        { label: "Expected Orders", value: "100K+" }
      ],
      color: "from-blue-500 to-blue-600",
      countries: ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain"],
      progress: 25
    },
    {
      id: 'global',
      title: "Global Logistics Revolution",
      subtitle: "Phase 3 • Vision 2025",
      status: "vision",
      description: "Worldwide platform deployment across emerging and developed markets",
      stats: [
        { label: "Continents", value: "5" },
        { label: "Target Countries", value: "50+" },
        { label: "Global Vision", value: "1M+" }
      ],
      color: "from-purple-500 to-purple-600",
      countries: ["Europe", "Asia", "Africa", "Americas"],
      progress: 5
    }
  ];

  const currentPhase = phases[activePhase];

  return (
    <section 
      id="market-expansion"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden"
    >
      {/* Background World Map Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 1000 500">
          <path d="M100,200 Q200,150 300,200 T500,200" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M500,200 Q600,180 700,200 T900,200" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="150" cy="200" r="4" fill="currentColor" />
          <circle cx="350" cy="200" r="4" fill="currentColor" />
          <circle cx="650" cy="200" r="4" fill="currentColor" />
          <circle cx="850" cy="200" r="4" fill="currentColor" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#DB271E]/10 text-[#DB271E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Global Expansion
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            From Lebanon{' '}
            <span className="bg-gradient-to-r from-[#DB271E] to-[#c0211a] bg-clip-text text-transparent">
              to the World
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Be part of the movement that's reshaping how the world moves packages
          </p>
        </div>

        {/* Phase Timeline */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4 sm:gap-8">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center">
                <button
                  onClick={() => setActivePhase(index)}
                  className={`relative group flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                    activePhase === index ? 'bg-card/50 backdrop-blur-sm' : 'hover:bg-card/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                    activePhase === index 
                      ? `bg-gradient-to-r ${phase.color} shadow-lg` 
                      : 'bg-muted'
                  }`}>
                    <span className={`text-sm font-bold ${
                      activePhase === index ? 'text-white' : 'text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium mb-1 ${
                      activePhase === index ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      Phase {index + 1}
                    </div>
                    <Badge 
                      variant={phase.status === 'active' ? 'default' : 'secondary'}
                      className={phase.status === 'active' ? 'bg-green-500 text-white' : ''}
                    >
                      {phase.status === 'active' ? 'Active' : phase.status === 'coming' ? 'Coming' : 'Vision'}
                    </Badge>
                  </div>
                </button>
                
                {/* Connector */}
                {index < phases.length - 1 && (
                  <div className={`hidden sm:block w-12 h-0.5 mx-4 transition-all duration-300 ${
                    activePhase > index ? 'bg-[#DB271E]' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Phase Content */}
        <Card className="border-none bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Phase Details */}
              <div className="p-8 lg:p-12">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentPhase.color} flex items-center justify-center`}>
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {currentPhase.subtitle}
                        </Badge>
                        <h3 className="text-2xl lg:text-3xl font-bold">
                          {currentPhase.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {currentPhase.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Penetration</span>
                      <span className="text-sm text-muted-foreground">{currentPhase.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${currentPhase.color} transition-all duration-1000 ease-out`}
                        style={{ width: isVisible ? `${currentPhase.progress}%` : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Countries/Regions */}
                  <div>
                    <h4 className="font-semibold mb-3">Target Markets</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentPhase.countries.map((country, index) => (
                        <Badge key={index} variant="outline" className="bg-background/50">
                          <MapPin className="w-3 h-3 mr-1" />
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="bg-muted/30 p-8 lg:p-12">
                <div className="space-y-8">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Key Metrics
                  </h4>
                  
                  <div className="grid gap-6">
                    {currentPhase.stats.map((stat, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {stat.label}
                          </span>
                          <span className={`text-2xl font-bold bg-gradient-to-r ${currentPhase.color} bg-clip-text text-transparent`}>
                            {stat.value}
                          </span>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full bg-gradient-to-r ${currentPhase.color} transition-all duration-1000 ease-out delay-${index * 200}`}
                            style={{ width: isVisible ? '100%' : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Join the movement before we reach your market
                    </p>
                    <button className={`w-full bg-gradient-to-r ${currentPhase.color} text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105`}>
                      Get Early Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}