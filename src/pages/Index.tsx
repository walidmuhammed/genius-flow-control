
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { PremiumNavigation } from '@/components/landing/PremiumNavigation';
import { PremiumHero } from '@/components/landing/PremiumHero';
import { MinimalTrust } from '@/components/landing/MinimalTrust';
import { BentoFeatures } from '@/components/landing/BentoFeatures';
import { AnimatedMetrics } from '@/components/landing/AnimatedMetrics';
import { OrbitingTech } from '@/components/landing/OrbitingTech';
import { FlipComparison } from '@/components/landing/FlipComparison';
import { InteractiveGlobe } from '@/components/landing/InteractiveGlobe';
import { MinimalPricing } from '@/components/landing/MinimalPricing';
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
import { MinimalCTA } from '@/components/landing/MinimalCTA';

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
    <div className="min-h-screen bg-background text-foreground dark">
      <PremiumNavigation />
      <PremiumHero />
      <MinimalTrust />
      <div id="features">
        <BentoFeatures />
      </div>
      <AnimatedMetrics />
      <OrbitingTech />
      <FlipComparison />
      <InteractiveGlobe />
      <div id="pricing">
        <MinimalPricing />
      </div>
      <div id="about">
        <TestimonialCarousel />
      </div>
      <div id="contact">
        <MinimalCTA />
      </div>
    </div>
  );
};

export default Index;
