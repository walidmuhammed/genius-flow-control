import React, { useEffect, useState, useRef } from 'react';

export function AnimatedMetrics() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    companies: 0,
    orders: 0,
    hours: 0
  });
  
  const sectionRef = useRef<HTMLDivElement>(null);

  const finalValues = {
    companies: 500,
    orders: 770820,
    hours: 140460
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setMetrics({
        companies: Math.floor(finalValues.companies * easeOut),
        orders: Math.floor(finalValues.orders * easeOut),
        hours: Math.floor(finalValues.hours * easeOut)
      });

      if (step >= steps) {
        clearInterval(timer);
        setMetrics(finalValues);
      }
    }, stepTime);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <section ref={sectionRef} className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Companies Launched */}
          <div className="text-center group">
            <div className={`transition-all duration-700 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
              <div className="text-6xl md:text-8xl font-bold text-gradient mb-4 animate-number-tick">
                {metrics.companies}+
              </div>
              <div className="text-xl text-muted-foreground font-medium">
                Companies Launched
              </div>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4 group-hover:scale-x-150 transition-transform duration-500" />
            </div>
          </div>

          {/* Orders Processed */}
          <div className="text-center group">
            <div className={`transition-all duration-700 delay-200 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
              <div className="text-6xl md:text-8xl font-bold text-gradient mb-4 animate-number-tick">
                {formatNumber(metrics.orders)}+
              </div>
              <div className="text-xl text-muted-foreground font-medium">
                Orders Processed
              </div>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4 group-hover:scale-x-150 transition-transform duration-500" />
            </div>
          </div>

          {/* Hours Saved */}
          <div className="text-center group">
            <div className={`transition-all duration-700 delay-400 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
              <div className="text-6xl md:text-8xl font-bold text-gradient mb-4 animate-number-tick">
                {formatNumber(metrics.hours)}h
              </div>
              <div className="text-xl text-muted-foreground font-medium">
                Hours Saved Globally
              </div>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4 group-hover:scale-x-150 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}