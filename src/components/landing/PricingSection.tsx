import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';

export function PricingSection() {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const plans = [
    {
      name: 'Starter',
      subtitle: 'Launch Your Journey',
      price: 99,
      period: 'month',
      description: 'Perfect for growing businesses ready to transform',
      icon: Rocket,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Up to 1,000 orders/month',
        'Basic analytics dashboard',
        'Mobile app access',
        'Email support',
        'Standard integrations',
        '2 team members',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      subtitle: 'Scale Your Operations',
      price: 299,
      period: 'month',
      description: 'For established operations demanding excellence',
      icon: Zap,
      gradient: 'from-primary to-red-500',
      features: [
        'Unlimited orders',
        'Advanced analytics & reports',
        'AI route optimization',
        'Priority support',
        'Custom integrations',
        'Unlimited team members',
        'Multi-location support',
        'API access',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      subtitle: 'Dominate Your Market',
      price: 'Custom',
      period: 'contact us',
      description: 'Tailored solutions for industry leaders',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Everything in Professional',
        'White-label solution',
        'Dedicated success manager',
        'Custom development',
        'SLA guarantees',
        'Advanced security',
        'Training & consulting',
        '24/7 phone support',
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              Speed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Every plan includes 14-day free trial, no credit card required, cancel anytime
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isHovered = hoveredPlan === index;
            const isPopular = plan.popular;
            
            return (
              <Card
                key={index}
                className={`group relative overflow-hidden transition-all duration-500 transform hover:scale-105 ${
                  isPopular 
                    ? 'bg-card/30 border-primary/30 shadow-2xl shadow-primary/20 scale-105' 
                    : 'bg-card/10 border-border/20 hover:bg-card/20'
                }`}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`bg-gradient-to-r ${plan.gradient} text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg`}>
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-12">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-muted-foreground mb-4">{plan.subtitle}</p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    {typeof plan.price === 'number' ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold">{plan.price}</div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          isPopular ? 'text-primary' : 'text-green-400'
                        }`} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className={`w-full group/btn ${
                      isPopular
                        ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white shadow-lg`
                        : 'border-primary/30 text-primary hover:bg-primary/10'
                    } transition-all duration-300`}
                    variant={isPopular ? "default" : "outline"}
                  >
                    <span className="flex items-center gap-2">
                      {typeof plan.price === 'number' ? 'Start Free Trial' : 'Contact Sales'}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </CardContent>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-card/20 backdrop-blur-sm border border-border/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-4">
              Not sure which plan is right for you?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Book a personalized demo with our logistics experts. We'll analyze your current setup 
              and recommend the perfect solution for your business.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Book Strategy Call
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}