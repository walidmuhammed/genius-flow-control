import React from 'react';

export function MinimalTrust() {
  const companies = [
    'Aramex', 'DHL', 'UPS', 'FedEx', 'TNT', 'USPS', 'PostNL', 'BlueDart'
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section title */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-lg font-medium">
            Trusted by industry leaders
          </p>
        </div>

        {/* Infinite marquee */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...companies, ...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="mx-12 text-2xl md:text-3xl font-bold text-muted-foreground/50 hover:text-foreground transition-colors duration-500 flex-shrink-0"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}