import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, Users, Zap } from 'lucide-react';

export function SpeedMetrics() {
  const [progress, setProgress] = useState({
    launch: 0,
    efficiency: 0,
    satisfaction: 0,
    coding: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('speed-metrics');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setProgress(prev => ({
          launch: Math.min(prev.launch + 2, 100),
          efficiency: Math.min(prev.efficiency + 1.8, 90),
          satisfaction: Math.min(prev.satisfaction + 1, 50),
          coding: Math.min(prev.coding + 0, 0)
        }));
      }, 50);

      setTimeout(() => clearInterval(timer), 3000);
      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const metrics = [
    {
      icon: Clock,
      title: "60 seconds",
      subtitle: "to launch your dashboard",
      value: progress.launch,
      color: "from-[#DB271E] to-[#c0211a]",
      description: "From signup to fully operational logistics command center"
    },
    {
      icon: TrendingUp,
      title: "90% reduction",
      subtitle: "in order processing time",
      value: progress.efficiency,
      color: "from-green-500 to-green-600",
      description: "Automated workflows eliminate manual data entry"
    },
    {
      icon: Users,
      title: "500% increase",
      subtitle: "in customer satisfaction",
      value: progress.satisfaction,
      color: "from-blue-500 to-blue-600",
      description: "Real-time tracking and communication transform experience"
    },
    {
      icon: Zap,
      title: "Zero coding",
      subtitle: "required",
      value: 100,
      color: "from-purple-500 to-purple-600",
      description: "Configure everything through our intuitive interface"
    }
  ];

  return (
    <section 
      id="speed-metrics"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/10 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(219,39,30,0.05)_49%,rgba(219,39,30,0.05)_51%,transparent_52%)] bg-[length:20px_20px]" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#DB271E]/10 text-[#DB271E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Performance Metrics
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Numbers That{' '}
            <span className="bg-gradient-to-r from-[#DB271E] to-[#c0211a] bg-clip-text text-transparent">
              Actually Matter
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real performance improvements from companies who made the switch to TOPSPEED
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            
            return (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-none bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 hover:scale-105"
              >
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${metric.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Metric Title */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {metric.title}
                    </h3>
                    <p className="text-muted-foreground font-medium">
                      {metric.subtitle}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3 mb-4">
                    <Progress 
                      value={metric.value} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Before</span>
                      <span className="font-semibold">{metric.value}%</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {metric.description}
                  </p>

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Speed Gauge Visualization */}
        <div className="mt-20 text-center">
          <div className="relative inline-block">
            <div className="w-64 h-32 relative mx-auto mb-8">
              {/* Gauge Background */}
              <svg 
                width="256" 
                height="128" 
                viewBox="0 0 256 128" 
                className="absolute inset-0"
              >
                <path
                  d="M 20 108 A 108 108 0 0 1 236 108"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 108 A 108 108 0 0 1 236 108"
                  stroke="url(#speedGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="339.29"
                  strokeDashoffset={isVisible ? "50" : "339.29"}
                  className="transition-all duration-3000 ease-out"
                />
                <defs>
                  <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DB271E" />
                    <stop offset="100%" stopColor="#c0211a" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Gauge Needle */}
              <div 
                className="absolute top-1/2 left-1/2 w-1 h-16 bg-[#DB271E] origin-bottom transition-transform duration-3000 ease-out"
                style={{ 
                  transform: `translate(-50%, -100%) rotate(${isVisible ? '60deg' : '-90deg'})`,
                  transformOrigin: 'bottom center'
                }}
              />

              {/* Center Point */}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-[#DB271E] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Speed Index: {isVisible ? '85' : '0'}/100</h3>
              <p className="text-muted-foreground">Operational Efficiency Score</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}