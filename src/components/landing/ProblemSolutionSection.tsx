import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageSquare, FileSpreadsheet, Smartphone, BarChart3, Clock, Shield } from 'lucide-react';

export function ProblemSolutionSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Traditional Chaos",
      subtitle: "The Old Way",
      description: "WhatsApp messages lost, Excel sheets corrupted, customers angry, drivers confused",
      icon: MessageSquare,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "The TOPSPEED Moment",
      subtitle: "The Transformation",
      description: "60 seconds to launch your smart dashboard and transform your entire operation",
      icon: Clock,
      color: "text-[#DB271E]",
      bgColor: "bg-[#DB271E]/10"
    },
    {
      title: "Logistics Mastery",
      subtitle: "The New Way",
      description: "Real-time tracking, automated workflows, happy customers, profitable operations",
      icon: BarChart3,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#DB271E]/10 text-[#DB271E] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            From Chaos to Control
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Still managing orders with{' '}
            <span className="text-[#DB271E]">WhatsApp and Excel?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your competitors are leaving you in the dust. Time to join the logistics revolution.
          </p>
        </div>

        {/* Interactive Transformation Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            
            return (
              <Card
                key={index}
                className={`relative overflow-hidden cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                  isActive ? 'ring-2 ring-[#DB271E] shadow-xl shadow-[#DB271E]/25' : 'hover:shadow-lg'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        {step.subtitle}
                      </div>
                      <h3 className="text-xl font-bold">
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Progress Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DB271E] to-[#c0211a]" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Before/After Comparison */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Before */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <h3 className="text-2xl font-bold text-red-500">Before TOPSPEED</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  "Managing orders through WhatsApp",
                  "Excel sheets for tracking deliveries",
                  "Manual phone calls for updates",
                  "No real-time visibility",
                  "Angry customers calling constantly",
                  "Drivers getting lost without GPS"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 opacity-75">
                    <FileSpreadsheet className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-[#DB271E] to-[#c0211a] p-4 rounded-full">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* After */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <h3 className="text-2xl font-bold text-green-500">After TOPSPEED</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  "Smart dashboard with real-time data",
                  "Automated order processing",
                  "Instant customer notifications",
                  "GPS tracking for all deliveries",
                  "Self-service customer portal",
                  "Optimized routes saving 40% time"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#DB271E] to-[#c0211a] hover:from-[#c0211a] hover:to-[#a61c16] text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-[#DB271E]/25 transition-all duration-300 transform hover:scale-105"
            >
              Transform My Business Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}