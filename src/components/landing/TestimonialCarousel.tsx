import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

export function TestimonialCarousel() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Ahmad Khalil',
      title: 'CEO, FastTrack Logistics',
      company: 'FastTrack Logistics',
      content: 'TOPSPEED transformed our operations from 50 orders per day to 500 in just 3 months. The ROI was immediate and substantial.',
      rating: 5,
      metrics: { before: '50 orders/day', after: '500 orders/day', improvement: '900% growth' },
      avatar: 'AK'
    },
    {
      name: 'Sarah Mansour',
      title: 'Operations Director, QuickShip',
      company: 'QuickShip Lebanon',
      content: 'We saved 140 hours per month on manual processes. Our customer satisfaction jumped from 78% to 97% within weeks.',
      rating: 5,
      metrics: { before: '78% satisfaction', after: '97% satisfaction', improvement: '140h saved monthly' },
      avatar: 'SM'
    },
    {
      name: 'Omar Hassan',
      title: 'Founder, Beirut Express',
      company: 'Beirut Express',
      content: 'The AI-powered route optimization alone saved us $50,000 annually in fuel costs. TOPSPEED pays for itself.',
      rating: 5,
      metrics: { before: 'Manual routing', after: 'AI optimization', improvement: '$50K saved annually' },
      avatar: 'OH'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Real Companies, Real Results
          </h2>
          <p className="text-xl text-muted-foreground">
            See how Lebanese logistics leaders transformed their operations
          </p>
        </div>

        {/* Testimonial carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-12 text-center premium-glow">
            {/* Quote icon */}
            <Quote className="w-12 h-12 text-primary mx-auto mb-8 opacity-50" />

            {/* Content */}
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                "{testimonials[activeTestimonial].content}"
              </p>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-primary text-primary"
                  />
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {testimonials[activeTestimonial].avatar}
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground">
                  {testimonials[activeTestimonial].name}
                </div>
                <div className="text-muted-foreground">
                  {testimonials[activeTestimonial].title}
                </div>
                <div className="text-primary text-sm">
                  {testimonials[activeTestimonial].company}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border/20">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Before</div>
                <div className="font-bold text-foreground">
                  {testimonials[activeTestimonial].metrics.before}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">After</div>
                <div className="font-bold text-foreground">
                  {testimonials[activeTestimonial].metrics.after}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Impact</div>
                <div className="font-bold text-primary">
                  {testimonials[activeTestimonial].metrics.improvement}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Company logos */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-8">Join these industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 cursor-pointer"
              >
                {testimonial.company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}