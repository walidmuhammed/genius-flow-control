import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export function MinimalPricing() {
  const plans = [
    {
      name: 'Starter',
      subtitle: 'Launch Your Journey',
      price: '$99',
      period: '/month',
      features: [
        'Up to 1,000 orders/month',
        'Basic dashboard analytics',
        'Email support',
        'Standard integrations',
        'Mobile app access'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      subtitle: 'Scale Your Operations',
      price: '$299',
      period: '/month',
      features: [
        'Unlimited orders',
        'Advanced analytics & reporting',
        'Priority support',
        'Custom integrations',
        'White-label options',
        'API access'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      subtitle: 'Dominate Your Market',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Everything in Professional',
        'Dedicated success manager',
        'Custom development',
        'On-premise deployment',
        'SLA guarantee',
        '24/7 phone support'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Choose Your Speed
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            14-day free trial, no credit card required, cancel anytime
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${
                plan.popular ? 'scale-105 z-10' : ''
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`glass-card rounded-3xl p-8 h-full transition-all duration-500 ${
                plan.popular 
                  ? 'premium-glow border-primary/20' 
                  : 'hover:border-primary/10 hover:scale-105'
              }`}>
                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-primary font-medium mb-6">{plan.subtitle}</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  className={`w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground premium-glow'
                      : 'bg-card hover:bg-card/80 text-foreground border border-border hover:border-primary/20'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-8">Trusted by 500+ companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}