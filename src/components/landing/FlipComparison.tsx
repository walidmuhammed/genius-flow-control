import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle } from 'lucide-react';

export function FlipComparison() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const comparisons = [
    {
      before: { title: 'WhatsApp Chaos', icon: X, color: 'text-red-400' },
      after: { title: 'Smart Dashboard', icon: CheckCircle, color: 'text-primary' },
      description: 'From scattered conversations to centralized command'
    },
    {
      before: { title: 'Excel Sheets', icon: X, color: 'text-red-400' },
      after: { title: 'Real-time Analytics', icon: CheckCircle, color: 'text-primary' },
      description: 'From static data to live business intelligence'
    },
    {
      before: { title: 'Manual Calls', icon: X, color: 'text-red-400' },
      after: { title: 'Automated Workflows', icon: CheckCircle, color: 'text-primary' },
      description: 'From human bottlenecks to AI-powered efficiency'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const cards = sectionRef.current?.querySelectorAll('[data-index]');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Why TOPSPEED Dominates
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your logistics operations from chaos to control with revolutionary technology
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {comparisons.map((comparison, index) => {
            const isVisible = visibleCards.includes(index);
            const BeforeIcon = comparison.before.icon;
            const AfterIcon = comparison.after.icon;

            return (
              <div
                key={index}
                data-index={index}
                className="relative perspective-1000"
              >
                <div className={`flip-card-inner ${isVisible ? 'flipped' : ''}`}>
                  {/* Before card */}
                  <div className="flip-card-front glass-card rounded-3xl p-8 h-64 flex flex-col items-center justify-center text-center">
                    <BeforeIcon className={`w-16 h-16 ${comparison.before.color} mb-4`} />
                    <h3 className="text-2xl font-bold text-muted-foreground mb-4">
                      {comparison.before.title}
                    </h3>
                    <p className="text-muted-foreground">The old way...</p>
                  </div>

                  {/* After card */}
                  <div className="flip-card-back glass-card rounded-3xl p-8 h-64 flex flex-col items-center justify-center text-center premium-glow">
                    <AfterIcon className={`w-16 h-16 ${comparison.after.color} mb-4`} />
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      {comparison.after.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {comparison.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance metrics */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="group">
              <div className="text-4xl font-bold text-primary mb-2">60s</div>
              <div className="text-muted-foreground">Deployment vs weeks</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-primary mb-2">500%</div>
              <div className="text-muted-foreground">Efficiency increase</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-primary mb-2">0</div>
              <div className="text-muted-foreground">Coding required</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
}