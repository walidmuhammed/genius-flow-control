import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, MapPin, BarChart3, Bell, Route, CreditCard, Shield } from 'lucide-react';

export function PlatformShowcaseNew() {
  const [activePanel, setActivePanel] = useState(0);

  const panels = [
    {
      title: 'Admin Panel',
      subtitle: 'Command Center for Logistics Leaders',
      description: 'Orchestrate your entire operation from one intelligent dashboard',
      icon: Settings,
      color: 'from-blue-500 to-cyan-500',
      features: [
        { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live performance insights' },
        { icon: Route, title: 'Automated Routing', desc: 'AI-powered optimization' },
        { icon: Users, title: 'Team Management', desc: 'Unified workforce control' },
        { icon: Shield, title: 'Security Dashboard', desc: 'Enterprise-grade protection' },
      ],
      mockup: {
        title: 'Operations Command Center',
        stats: [
          { label: 'Active Orders', value: '1,247', trend: '+12%' },
          { label: 'Fleet Status', value: '94%', trend: '+3%' },
          { label: 'Revenue Today', value: '$47,529', trend: '+18%' },
        ],
      },
    },
    {
      title: 'Client Panel',
      subtitle: 'Self-Service Portal That Clients Actually Love',
      description: 'Let customers track, modify, and manage their orders independently',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      features: [
        { icon: MapPin, title: 'Live Tracking', desc: 'Real-time delivery updates' },
        { icon: Bell, title: 'Smart Notifications', desc: 'Proactive communication' },
        { icon: CreditCard, title: 'Payment Integration', desc: 'Seamless transactions' },
        { icon: Users, title: 'Account Management', desc: 'Self-service capabilities' },
      ],
      mockup: {
        title: 'Customer Experience Hub',
        stats: [
          { label: 'Orders Tracking', value: '23', trend: 'Active' },
          { label: 'Satisfaction', value: '4.9★', trend: 'Excellent' },
          { label: 'Saved Locations', value: '12', trend: 'Ready' },
        ],
      },
    },
    {
      title: 'Courier Panel',
      subtitle: 'Field Operations Made Effortless',
      description: 'Empower your drivers with smart route optimization and instant updates',
      icon: MapPin,
      color: 'from-primary to-red-500',
      features: [
        { icon: Route, title: 'GPS Optimization', desc: 'Fastest route calculation' },
        { icon: MapPin, title: 'Digital Proof', desc: 'Instant delivery confirmation' },
        { icon: CreditCard, title: 'Earnings Tracker', desc: 'Real-time payment tracking' },
        { icon: Bell, title: 'Instant Updates', desc: 'Live order modifications' },
      ],
      mockup: {
        title: 'Driver Mobile Command',
        stats: [
          { label: 'Today\'s Routes', value: '8', trend: 'Optimized' },
          { label: 'Earnings', value: '$247', trend: '+$32' },
          { label: 'Deliveries', value: '23/25', trend: '92%' },
        ],
      },
    },
  ];

  const currentPanel = panels[activePanel];
  const Icon = currentPanel.icon;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Three Dashboards,{' '}
            <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              Infinite Possibilities
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every stakeholder gets their perfect interface. Every workflow becomes effortless.
          </p>
        </div>

        {/* Panel Selector */}
        <div className="flex flex-col lg:flex-row justify-center gap-4 mb-16">
          {panels.map((panel, index) => {
            const PanelIcon = panel.icon;
            const isActive = activePanel === index;
            
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "outline"}
                size="lg"
                onClick={() => setActivePanel(index)}
                className={`group relative flex-1 max-w-sm h-auto p-6 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${panel.color} text-white shadow-lg shadow-primary/25 scale-105` 
                    : 'hover:bg-card/50 hover:scale-105'
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isActive ? 'bg-white/20' : 'bg-primary/10'
                  }`}>
                    <PanelIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{panel.title}</div>
                    <div className={`text-sm ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {panel.subtitle}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Active Panel Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features */}
          <div className="space-y-8">
            <div>
              <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${currentPanel.color} text-white px-4 py-2 rounded-full text-sm font-medium mb-4`}>
                <Icon className="w-4 h-4" />
                {currentPanel.title}
              </div>
              <h3 className="text-3xl font-bold mb-4">{currentPanel.subtitle}</h3>
              <p className="text-xl text-muted-foreground">{currentPanel.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {currentPanel.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <Card key={index} className="group bg-card/20 backdrop-blur-sm border-border/20 hover:bg-card/30 transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPanel.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <FeatureIcon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right: Interactive Mockup */}
          <div className="relative">
            <div className="relative bg-card/10 backdrop-blur-sm border border-border/20 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">
              {/* Mock Device Frame */}
              <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentPanel.color}`} />
                    <div>
                      <div className="font-bold">{currentPanel.mockup.title}</div>
                      <div className="text-xs text-muted-foreground">TOPSPEED Platform</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {currentPanel.mockup.stats.map((stat, index) => (
                    <div key={index} className="bg-background/50 rounded-xl p-4 border border-border/10">
                      <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-green-400">{stat.trend}</div>
                    </div>
                  ))}
                </div>

                {/* Mock Chart/Content */}
                <div className="bg-background/30 rounded-xl p-4 h-24 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${currentPanel.color} opacity-10`} />
                  <div className="relative flex items-center justify-center h-full">
                    <Icon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </div>
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary rounded-full animate-float" />
            </div>

            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentPanel.color} opacity-0 hover:opacity-5 blur-3xl transition-opacity duration-500 -z-10`} />
          </div>
        </div>
      </div>
    </section>
  );
}