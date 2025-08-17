import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Star, TrendingUp, Users } from 'lucide-react';

export function SocialProofSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Ahmad Khalil',
      title: 'CEO, FastTrack Logistics',
      company: 'Lebanon\'s largest independent delivery service',
      quote: 'TOPSPEED transformed us from 50 orders per day to 500 in just 3 months. The ROI was immediate and exponential.',
      metrics: {
        before: '50 orders/day',
        after: '500 orders/day',
        improvement: '900% increase',
        timeframe: '3 months'
      },
      avatar: '/placeholder.svg',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Layla Mansour',
      title: 'Operations Director, SwiftSend',
      company: 'Regional e-commerce fulfillment leader',
      quote: 'Our customer satisfaction went from 3.2 to 4.9 stars. TOPSPEED didn\'t just improve our operations—it saved our business.',
      metrics: {
        before: '3.2★ rating',
        after: '4.9★ rating',
        improvement: '53% boost',
        timeframe: '6 weeks'
      },
      avatar: '/placeholder.svg',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Omar Fares',
      title: 'Founder, Lightning Delivery',
      company: 'Fastest-growing logistics startup in Beirut',
      quote: 'We eliminated 6 hours of daily admin work. Now our team focuses on growth instead of spreadsheets.',
      metrics: {
        before: '6 hours admin/day',
        after: '30 min admin/day',
        improvement: '92% time saved',
        timeframe: '2 weeks'
      },
      avatar: '/placeholder.svg',
      gradient: 'from-primary to-red-500',
    },
    {
      name: 'Rania Khoury',
      title: 'COO, Express Elite',
      company: 'Premium logistics for luxury brands',
      quote: 'The white-glove onboarding was flawless. In 60 seconds, we had what took our competitors months to build.',
      metrics: {
        before: 'Excel chaos',
        after: 'Smart dashboard',
        improvement: 'Instant transformation',
        timeframe: '60 seconds'
      },
      avatar: '/placeholder.svg',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const stats = [
    { icon: TrendingUp, value: '456%', label: 'Average ROI increase' },
    { icon: Users, value: '94%', label: 'Customer satisfaction' },
    { icon: Star, value: '4.9/5', label: 'Platform rating' },
  ];

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Quote className="w-4 h-4" />
            Success Stories
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Real Companies,{' '}
            <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
              Real Results
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's how TOPSPEED transformed Lebanon's leading logistics companies.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Testimonial Card */}
          <Card className="relative overflow-hidden bg-card/20 backdrop-blur-sm border-border/20">
            <CardContent className="p-8">
              {/* Quote Icon */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentTestimonial.gradient} flex items-center justify-center mb-6`}>
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Quote */}
              <blockquote className="text-xl leading-relaxed mb-8 text-foreground">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentTestimonial.gradient} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-foreground">{currentTestimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{currentTestimonial.title}</div>
                  <div className="text-xs text-muted-foreground">{currentTestimonial.company}</div>
                </div>
              </div>

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentTestimonial.gradient} opacity-5 pointer-events-none`} />
            </CardContent>
          </Card>

          {/* Right: Metrics */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Transformation Metrics</h3>
            
            {/* Before/After Grid */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-red-50/10 border-red-200/20">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Before TOPSPEED</div>
                  <div className="text-2xl font-bold text-red-400">{currentTestimonial.metrics.before}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50/10 border-green-200/20">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">After TOPSPEED</div>
                  <div className="text-2xl font-bold text-green-400">{currentTestimonial.metrics.after}</div>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Highlight */}
            <Card className={`bg-gradient-to-r ${currentTestimonial.gradient} p-[1px] rounded-xl`}>
              <div className="bg-background rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
                  {currentTestimonial.metrics.improvement}
                </div>
                <div className="text-sm text-muted-foreground">
                  Achieved in {currentTestimonial.metrics.timeframe}
                </div>
              </div>
            </Card>

            {/* Industry Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Testimonial Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => setActiveTestimonial(index)}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                activeTestimonial === index
                  ? `bg-gradient-to-r ${testimonial.gradient} text-white shadow-lg`
                  : 'bg-card/20 hover:bg-card/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeTestimonial === index ? 'bg-white/20' : `bg-gradient-to-r ${testimonial.gradient}`
              }`}>
                <span className={`font-bold text-sm ${
                  activeTestimonial === index ? 'text-white' : 'text-white'
                }`}>
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="text-left">
                <div className="font-medium">{testimonial.name}</div>
                <div className={`text-xs ${
                  activeTestimonial === index ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {testimonial.title}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-card/20 backdrop-blur-sm border border-border/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to write your success story?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join Lebanon's leading logistics companies who chose transformation over stagnation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.9/5 satisfaction rating</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>500+ companies transformed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}