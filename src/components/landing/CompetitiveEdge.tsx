import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Code, TrendingUp, Zap, CheckCircle } from 'lucide-react';

export function CompetitiveEdge() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll('.competitive-item');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const advantages = [
    {
      icon: Clock,
      title: '60-second deployment',
      oldWay: 'weeks of setup',
      improvement: '99.7% faster',
      description: 'From signup to fully operational dashboard in under a minute',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Code,
      title: 'Zero coding required',
      oldWay: 'complex integrations',
      improvement: '100% visual',
      description: 'Point, click, configure. No technical expertise needed',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: '500% efficiency increase',
      oldWay: 'manual processes',
      improvement: 'fully automated',
      description: 'AI-powered workflows that learn and optimize automatically',
      gradient: 'from-primary to-red-500',
    },
    {
      icon: Zap,
      title: 'AI-powered route optimization',
      oldWay: 'guesswork planning',
      improvement: 'smart routing',
      description: 'Machine learning algorithms that save time and fuel costs',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: CheckCircle,
      title: 'White-glove onboarding',
      oldWay: 'figure it out yourself',
      improvement: 'expert guidance',
      description: 'Dedicated success team ensures perfect implementation',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Competitive Advantage
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Why TOPSPEED{' '}
            <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              Dominates
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We didn't just build a better logistics platform. We reimagined what's possible.
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="space-y-8">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            const isVisible = visibleItems.includes(index);
            
            return (
              <Card
                key={index}
                data-index={index}
                className={`competitive-item group relative overflow-hidden bg-card/10 backdrop-blur-sm border-border/20 hover:bg-card/20 transition-all duration-700 transform ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-4 gap-6 items-center">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${advantage.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{advantage.title}</h3>
                        <p className="text-sm text-muted-foreground">{advantage.description}</p>
                      </div>
                    </div>

                    {/* Old Way */}
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Traditional Way</div>
                      <div className="text-red-400 font-medium line-through">{advantage.oldWay}</div>
                    </div>

                    {/* Arrow/vs */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">→</div>
                      <div className="text-xs text-muted-foreground">VS</div>
                    </div>

                    {/* TOPSPEED Way */}
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">TOPSPEED Way</div>
                      <div className={`font-bold text-lg bg-gradient-to-r ${advantage.gradient} bg-clip-text text-transparent`}>
                        {advantage.improvement}
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${advantage.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm border border-border/20 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Join the companies who refuse to settle for mediocre</span>
          </div>
        </div>
      </div>
    </section>
  );
}