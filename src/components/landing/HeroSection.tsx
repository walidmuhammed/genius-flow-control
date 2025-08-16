import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Zap, Globe, TrendingUp } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    companies: 0,
    orders: 0,
    timeSaved: 0
  });

  useEffect(() => {
    // Animate counters
    const interval = setInterval(() => {
      setStats(prev => ({
        companies: Math.min(prev.companies + 17, 500),
        orders: Math.min(prev.orders + 12847, 2847392),
        timeSaved: Math.min(prev.timeSaved + 2341, 892341)
      }));
    }, 50);

    setTimeout(() => clearInterval(interval), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-background/95">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(219,39,30,0.1),transparent_50%)] animate-pulse" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(219,39,30,0.05)_50%,transparent_75%)] animate-[slide_20s_ease-in-out_infinite]" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#DB271E]/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <div className="space-y-8">
          <div className="relative">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground via-[#DB271E] to-foreground bg-clip-text text-transparent leading-tight">
              Launch Your Logistics
              <br />
              <span className="relative">
                Empire in 60 Seconds
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#DB271E] to-transparent animate-pulse" />
              </span>
            </h1>
          </div>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            The only platform that transforms delivery companies from chaos to control 
            <span className="text-[#DB271E] font-semibold"> faster than you can say 'TOPSPEED'</span>
          </p>

          {/* Stats Counter */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto py-8">
            <div className="relative group">
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 group-hover:bg-card/60 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold text-[#DB271E] mb-2">
                  {stats.companies.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground font-medium">Companies Launched</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#DB271E]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="relative group">
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 group-hover:bg-card/60 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold text-[#DB271E] mb-2">
                  {stats.orders.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground font-medium">Orders Processed</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#DB271E]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="relative group">
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 group-hover:bg-card/60 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold text-[#DB271E] mb-2">
                  {stats.timeSaved.toLocaleString()}h
                </div>
                <div className="text-sm text-muted-foreground font-medium">Time Saved</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#DB271E]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate('/auth/client-signup')}
              className="group relative overflow-hidden bg-gradient-to-r from-[#DB271E] to-[#c0211a] hover:from-[#c0211a] hover:to-[#a61c16] text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg shadow-[#DB271E]/25 hover:shadow-[#DB271E]/40 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start My Speed Journey
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth/client-signin')}
              className="group border-[#DB271E]/30 text-[#DB271E] hover:bg-[#DB271E]/10 hover:border-[#DB271E] font-semibold px-8 py-4 text-lg rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Watch Demo
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12">
            <p className="text-sm text-muted-foreground mb-6">
              Join 500+ logistics companies who ditched spreadsheets for smart dashboards
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Lebanon → Gulf → World</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">500% Growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}