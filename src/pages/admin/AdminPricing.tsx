
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PricingKPICards from '@/components/admin/pricing/PricingKPICards';
import GlobalPricingSection from '@/components/admin/pricing/GlobalPricingSection';
import ZonePricingSection from '@/components/admin/pricing/ZonePricingSection';
import { GlobalPackageExtrasSection } from '@/components/admin/pricing/GlobalPackageExtrasSection';
import ClientPricingSection from '@/components/admin/pricing/ClientPricingSection';

import PricingChangeLogsSection from '@/components/admin/pricing/PricingChangeLogsSection';

const AdminPricing = () => {
  document.title = "Pricing Management - Admin Panel";
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Pricing Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Master pricing system for TopSpeed - Configure global and client-specific delivery fees
          </p>
        </div>
        
        <PricingKPICards />
        <GlobalPricingSection />
        <ZonePricingSection />
        <GlobalPackageExtrasSection />
        <ClientPricingSection />
        
        <PricingChangeLogsSection />
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
