import React from 'react';

export function TrustedBySection() {
  const companies = [
    'Aramex', 'DHL', 'UPS', 'FedEx', 'TNT', 'USPS', 'Amazon Logistics', 'PostNL'
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,hsl(var(--primary)_/_0.02)_49%,hsl(var(--primary)_/_0.02)_51%,transparent_52%)] bg-[length:30px_30px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <p className="text-muted-foreground text-lg mb-12 font-medium">
          Trusted by the industry leaders who move the world
        </p>

        {/* Infinite scroll animation */}
        <div className="relative overflow-hidden">
          <div className="flex animate-slide-in">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 group"
                style={{
                  animation: `slideIn 20s linear infinite`,
                  animationDelay: `${index * 0.5}s`,
                }}
              >
                <div className="text-2xl md:text-3xl font-bold text-muted-foreground/60 hover:text-foreground transition-colors duration-300 group-hover:scale-110 transform transition-transform">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-border/20">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Enterprise Security</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">24/7 Support</span>
          </div>
        </div>
      </div>

    </section>
  );
}