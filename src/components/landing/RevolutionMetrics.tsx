import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Clock } from 'lucide-react';

export function RevolutionMetrics() {
  const [metrics, setMetrics] = useState({
    companies: 0,
    orders: 0,
    timeSaved: 0,
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

    const section = document.getElementById('revolution-metrics');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setMetrics(prev => ({
          companies: Math.min(prev.companies + 17, 500),
          orders: Math.min(prev.orders + 25694, 770820),
          timeSaved: Math.min(prev.timeSaved + 4682, 140460),
        }));
      }, 50);

      setTimeout(() => clearInterval(timer), 3000);
      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const stats = [
    {
      icon: Users,
      value: metrics.companies,
      suffix: '+',
      label: 'Companies Transformed',
      description: 'From chaos to control in record time',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      value: metrics.orders,
      suffix: '+',
      label: 'Orders Processed',
      description: 'Seamlessly managed through our platform',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      value: metrics.timeSaved,
      suffix: 'h',
      label: 'Time Saved Globally',
      description: 'Efficiency gains that compound daily',
      gradient: 'from-primary to-red-500',
    },
  ];

  return (
    <section id="revolution-metrics" className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            The Revolution{' '}
            <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              in Numbers
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real impact from companies who chose to lead instead of follow
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div
                key={index}
                className="group relative"
                style={{
                  animation: isVisible ? `fadeIn 0.8s ease-out ${index * 0.2}s both` : 'none',
                }}
              >
                {/* Main Card */}
                <div className="relative bg-card/20 backdrop-blur-sm border border-border/20 rounded-3xl p-8 hover:bg-card/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Metric Value */}
                  <div className="space-y-2 mb-4">
                    <div className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value.toLocaleString()}{stat.suffix}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {stat.label}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>

                  {/* Floating accent */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>

                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 -z-10`} />
              </div>
            );
          })}
        </div>

        {/* Bottom accent */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Live metrics updating in real-time
          </div>
        </div>
      </div>
    </section>
  );
}