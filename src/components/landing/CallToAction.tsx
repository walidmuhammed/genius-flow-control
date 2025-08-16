import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Calendar, 
  MessageSquare, 
  Shield, 
  Star, 
  Zap,
  CheckCircle,
  ArrowRight,
  Clock
} from 'lucide-react';

export function CallToAction() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleStartTrial = () => {
    navigate('/auth/client-signup');
  };

  const handleBookDemo = () => {
    // Could integrate with calendar booking system
    navigate('/auth/client-signin');
  };

  const trustIndicators = [
    { icon: Shield, text: "Enterprise Security" },
    { icon: CheckCircle, text: "99.9% Uptime" },
    { icon: Star, text: "4.9/5 Rating" },
    { icon: Clock, text: "24/7 Support" }
  ];

  const benefits = [
    "Get your dashboard in under 60 seconds",
    "14-day free trial, no credit card required",
    "White-glove onboarding included",
    "Cancel anytime, no questions asked"
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(219,39,30,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(219,39,30,0.05),transparent_50%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#DB271E]/10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-500/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-green-500/10 rounded-full animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Main CTA Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#DB271E]/10 text-[#DB271E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Start Your Journey
          </div>
          
          <h2 className="text-4xl sm:text-6xl font-bold mb-6">
            Your Speed Journey{' '}
            <span className="bg-gradient-to-r from-[#DB271E] to-[#c0211a] bg-clip-text text-transparent">
              Starts Now
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Join the logistics revolution that's already changing the game. 
            Get your custom dashboard in under 60 seconds.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              onClick={handleStartTrial}
              className="group relative overflow-hidden bg-gradient-to-r from-[#DB271E] to-[#c0211a] hover:from-[#c0211a] hover:to-[#a61c16] text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl shadow-[#DB271E]/30 hover:shadow-[#DB271E]/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Start Free Trial
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-75" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleBookDemo}
              className="group border-2 border-[#DB271E]/30 text-[#DB271E] hover:bg-[#DB271E]/10 hover:border-[#DB271E] font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                Book Demo
                <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          {/* Quick Email Signup */}
          <Card className="max-w-md mx-auto border-none bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Want updates on our global expansion?
              </p>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline"
                  className="border-[#DB271E]/30 text-[#DB271E] hover:bg-[#DB271E]/10"
                >
                  Notify Me
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group border-none bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#DB271E] to-[#c0211a] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium">{benefit}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-8">
            Trusted by 500+ logistics companies worldwide
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <div key={index} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity duration-300">
                  <Icon className="w-5 h-5 text-[#DB271E]" />
                  <span className="text-sm font-medium">{indicator.text}</span>
                </div>
              );
            })}
          </div>

          {/* Security Badges */}
          <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-border/50">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Shield className="w-3 h-3 mr-1" />
              SOC 2 Certified
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              GDPR Compliant
            </Badge>
            <Badge variant="outline" className="bg-[#DB271E]/10 text-[#DB271E] border-[#DB271E]/20">
              <Star className="w-3 h-3 mr-1" />
              ISO 27001
            </Badge>
          </div>

          {/* Final Footer */}
          <div className="mt-16 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              © 2024 TOPSPEED. All rights reserved. • 
              <span className="text-[#DB271E] ml-1">Revolutionizing logistics, one delivery at a time.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}