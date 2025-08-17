import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Shield, Cpu, Zap, Database, Globe, Smartphone, BarChart3 } from 'lucide-react';

export function TechStackShowcase() {
  const [hoveredTech, setHoveredTech] = useState<number | null>(null);

  const technologies = [
    {
      icon: Cloud,
      title: 'Cloud-Native Architecture',
      description: 'Built for infinite scale and zero downtime',
      features: ['Auto-scaling infrastructure', '99.99% uptime SLA', 'Global CDN distribution'],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade protection for your data',
      features: ['End-to-end encryption', 'SOC 2 Type II certified', 'GDPR compliant'],
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Cpu,
      title: 'AI-Powered Intelligence',
      description: 'Machine learning that gets smarter with every delivery',
      features: ['Predictive analytics', 'Route optimization', 'Demand forecasting'],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Perfect experience on every device',
      features: ['Progressive Web App', 'Offline capabilities', 'Native performance'],
      gradient: 'from-primary to-red-500',
    },
  ];

  const integrations = [
    { name: 'REST APIs', icon: Globe },
    { name: 'Real-time Sync', icon: Zap },
    { name: 'Analytics Engine', icon: BarChart3 },
    { name: 'Data Pipeline', icon: Database },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Cpu className="w-4 h-4" />
            Technology Stack
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Built for{' '}
            <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              the Future
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enterprise-grade security meets startup agility. Every component engineered for scale.
          </p>
        </div>

        {/* Main Tech Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            const isHovered = hoveredTech === index;
            
            return (
              <Card
                key={index}
                className="group relative overflow-hidden bg-card/10 backdrop-blur-sm border-border/20 hover:bg-card/20 transition-all duration-500 hover:scale-105 cursor-pointer"
                onMouseEnter={() => setHoveredTech(index)}
                onMouseLeave={() => setHoveredTech(null)}
              >
                <CardContent className="p-8 h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{tech.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {tech.description}
                  </p>

                  {/* Features */}
                  <div className={`space-y-2 transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
                  }`}>
                    {tech.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tech.gradient}`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration Network */}
        <div className="relative">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Seamless Integrations
            </h3>
            <p className="text-muted-foreground">
              Connect with your existing tools and scale infinitely
            </p>
          </div>

          {/* Central Hub */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
              {/* Central TOPSPEED Node */}
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 relative z-10">
                <div className="text-white font-bold text-lg">TOPSPEED</div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-red-500 rounded-full animate-ping opacity-20" />
              </div>

              {/* Integration Nodes */}
              {integrations.map((integration, index) => {
                const Icon = integration.icon;
                const angle = (index * 360) / integrations.length;
                const radius = 120;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <div key={index}>
                    {/* Connection Line */}
                    <div
                      className="absolute w-px bg-gradient-to-r from-primary/50 to-transparent"
                      style={{
                        height: `${radius}px`,
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'top',
                        transform: `rotate(${angle}deg)`,
                      }}
                    />
                    
                    {/* Integration Node */}
                    <div
                      className="absolute w-16 h-16 bg-card/20 backdrop-blur-sm border border-border/20 rounded-full flex items-center justify-center group hover:scale-110 transition-all duration-300 hover:bg-card/40"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      
                      {/* Label */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="text-xs font-medium text-muted-foreground">
                          {integration.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-border/20">
          {[
            { value: '99.99%', label: 'Uptime SLA' },
            { value: '<100ms', label: 'Response Time' },
            { value: '256-bit', label: 'Encryption' },
            { value: '24/7', label: 'Monitoring' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}