import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Users, 
  Truck, 
  BarChart3, 
  Navigation, 
  CreditCard, 
  MapPin, 
  MessageSquare,
  Clock,
  Shield,
  Zap,
  Target
} from 'lucide-react';

export function PlatformShowcase() {
  const [activePanel, setActivePanel] = useState('admin');

  const panels = {
    admin: {
      title: "Admin Panel",
      subtitle: "Command Center for Logistics Leaders",
      description: "Orchestrate your entire operation from one intelligent dashboard",
      icon: Monitor,
      color: "from-[#DB271E] to-[#c0211a]",
      features: [
        { icon: BarChart3, title: "Real-time Analytics", desc: "Live performance metrics and insights" },
        { icon: Navigation, title: "Automated Routing", desc: "AI-optimized delivery paths" },
        { icon: Target, title: "Performance Insights", desc: "Data-driven operational decisions" },
        { icon: Shield, title: "Advanced Security", desc: "Enterprise-grade protection" }
      ]
    },
    client: {
      title: "Client Panel",
      subtitle: "Self-Service Portal That Clients Actually Love",
      description: "Let customers track, modify, and manage their orders independently",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      features: [
        { icon: MapPin, title: "Live Tracking", desc: "Real-time order location updates" },
        { icon: MessageSquare, title: "Instant Communication", desc: "Direct chat with delivery team" },
        { icon: CreditCard, title: "Payment Integration", desc: "Secure online payment processing" },
        { icon: Clock, title: "Order Management", desc: "Modify and reschedule deliveries" }
      ]
    },
    courier: {
      title: "Courier Panel",
      subtitle: "Field Operations Made Effortless",
      description: "Empower your drivers with smart route optimization and instant updates",
      icon: Truck,
      color: "from-green-500 to-green-600",
      features: [
        { icon: Navigation, title: "GPS Optimization", desc: "Smart route planning and navigation" },
        { icon: Zap, title: "Digital Proof", desc: "Photo and signature capture" },
        { icon: BarChart3, title: "Earnings Tracker", desc: "Real-time income monitoring" },
        { icon: MessageSquare, title: "Instant Updates", desc: "Seamless communication hub" }
      ]
    }
  };

  const currentPanel = panels[activePanel as keyof typeof panels];
  const PanelIcon = currentPanel.icon;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#DB271E]/10 text-[#DB271E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Monitor className="w-4 h-4" />
            Platform Showcase
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Three Panels,{' '}
            <span className="bg-gradient-to-r from-[#DB271E] to-[#c0211a] bg-clip-text text-transparent">
              Infinite Possibilities
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every stakeholder in your logistics operation gets their perfect interface
          </p>
        </div>

        {/* Panel Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(panels).map(([key, panel]) => {
            const Icon = panel.icon;
            const isActive = activePanel === key;
            
            return (
              <Button
                key={key}
                variant={isActive ? "default" : "outline"}
                size="lg"
                onClick={() => setActivePanel(key)}
                className={`group relative overflow-hidden ${
                  isActive 
                    ? `bg-gradient-to-r ${panel.color} text-white hover:opacity-90` 
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {panel.title}
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Panel Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Panel Description */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${currentPanel.color} flex items-center justify-center shadow-lg`}>
                  <PanelIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{currentPanel.title}</h3>
                  <p className="text-muted-foreground">{currentPanel.subtitle}</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentPanel.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {currentPanel.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                
                return (
                  <Card key={index} className="border-none bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${currentPanel.color} flex items-center justify-center`}>
                          <FeatureIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className={`bg-gradient-to-r ${currentPanel.color} hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                Explore {currentPanel.title}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border hover:bg-muted font-semibold px-8 py-3 rounded-xl"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Interactive Dashboard Mockup */}
          <div className="relative">
            <div className="bg-card/30 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
              {/* Mock Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${currentPanel.color} flex items-center justify-center`}>
                    <PanelIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{currentPanel.title}</h4>
                    <p className="text-xs text-muted-foreground">Live Dashboard</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                  ● Online
                </Badge>
              </div>

              {/* Mock Dashboard Content */}
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-background/50 rounded-xl p-4">
                      <div className="h-2 bg-muted rounded mb-2" />
                      <div className="h-6 bg-muted rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="bg-background/50 rounded-xl p-6">
                  <div className="h-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r ${currentPanel.color} opacity-20 animate-pulse`} />
                  </div>
                </div>

                {/* Action Items */}
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 bg-background/50 rounded-lg p-3">
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2 bg-muted/50 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#DB271E] rounded-full animate-bounce" />
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}