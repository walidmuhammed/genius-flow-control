import React, { useState } from 'react';
import { Shield, Users, MapPin } from 'lucide-react';

export function BentoFeatures() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Shield,
      title: 'Admin Panel',
      subtitle: 'Command & Control',
      description: 'Orchestrate your entire logistics operation from one intelligent command center.',
      preview: {
        title: 'Real-time Operations',
        metrics: [
          { label: 'Active Routes', value: '847' },
          { label: 'Pending Orders', value: '1,234' },
          { label: 'Fleet Status', value: '98%' }
        ]
      }
    },
    {
      icon: Users,
      title: 'Client Portal',
      subtitle: 'Track & Manage',
      description: 'Self-service portal that clients actually want to use for all their logistics needs.',
      preview: {
        title: 'Order Tracking',
        metrics: [
          { label: 'Orders This Month', value: '156' },
          { label: 'On-Time Delivery', value: '97.2%' },
          { label: 'Cost Savings', value: '$12,430' }
        ]
      }
    },
    {
      icon: MapPin,
      title: 'Courier App',
      subtitle: 'Deliver & Optimize',
      description: 'Smart mobile app that makes every delivery route efficient and every courier productive.',
      preview: {
        title: 'Route Optimization',
        metrics: [
          { label: 'Deliveries Today', value: '42' },
          { label: 'Route Efficiency', value: '94.8%' },
          { label: 'Earnings', value: '$284' }
        ]
      }
    }
  ];

  return (
    <section className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Three Panels. One Revolution.
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredCard === index;
            
            return (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`glass-card rounded-3xl p-8 transition-all duration-500 cursor-pointer
                  ${isHovered ? 'transform scale-105 premium-glow' : 'hover:border-primary/20'}
                `}>
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-primary font-medium mb-4">{feature.subtitle}</p>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Dashboard preview */}
                  <div className={`transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-2'}`}>
                    <div className="bg-card/30 rounded-xl p-4 border border-border/10">
                      <div className="text-sm font-medium text-foreground mb-3">{feature.preview.title}</div>
                      <div className="space-y-2">
                        {feature.preview.metrics.map((metric, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{metric.label}</span>
                            <span className="text-sm font-bold text-foreground">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}