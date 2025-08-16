
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { PlatformShowcase } from '@/components/landing/PlatformShowcase';
import { SpeedMetrics } from '@/components/landing/SpeedMetrics';
import { MarketExpansion } from '@/components/landing/MarketExpansion';
import { CallToAction } from '@/components/landing/CallToAction';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TOPSPEED - Launch Your Logistics Empire in 60 Seconds";
    
    // Redirect authenticated users to their dashboard
    if (user && profile) {
      const redirectPath = profile.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/client';
      navigate(redirectPath);
    }
  }, [user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-[#DB271E] mx-auto mb-4" />
            <div className="absolute inset-0 h-12 w-12 bg-[#DB271E]/20 rounded-full animate-ping mx-auto" />
          </div>
          <p className="text-muted-foreground">Preparing your logistics revolution...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Problem-Solution Section */}
      <ProblemSolutionSection />
      
      {/* Platform Showcase */}
      <PlatformShowcase />
      
      {/* Speed & Efficiency Metrics */}
      <SpeedMetrics />
      
      {/* Market Expansion Vision */}
      <MarketExpansion />
      
      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default Index;
