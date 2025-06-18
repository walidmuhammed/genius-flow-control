
import React, { useState } from 'react';
import { User, Lock, Building2, Receipt, Users, ServerCog, Plug, FileCheck, ShieldAlert, MapPin, Menu } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import PersonalInfoSection from '@/components/settings/PersonalInfoSection';
import BusinessInfoSection from '@/components/settings/BusinessInfoSection';
import BusinessLocationsSection from '@/components/settings/BusinessLocationsSection';
import SecuritySection from '@/components/settings/SecuritySection';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: <User className="h-5 w-5" />, label: 'Personal Info', value: 'personal' },
    { icon: <Building2 className="h-5 w-5" />, label: 'Business Information', value: 'business-info' },
    { icon: <MapPin className="h-5 w-5" />, label: 'Business Locations', value: 'business-locations' },
    { icon: <Lock className="h-5 w-5" />, label: 'Security', value: 'security' },
    { icon: <FileCheck className="h-5 w-5" />, label: 'Pricing Plan', value: 'pricing' },
    { icon: <Receipt className="h-5 w-5" />, label: 'Payout Methods', value: 'payout' },
    { icon: <Receipt className="h-5 w-5" />, label: 'Subscriptions', value: 'subscriptions' },
    { icon: <ShieldAlert className="h-5 w-5" />, label: 'Insurance', value: 'insurance' },
    { icon: <Users className="h-5 w-5" />, label: 'Team Members', value: 'team' },
    { icon: <ServerCog className="h-5 w-5" />, label: 'API Integration', value: 'api' },
    { icon: <Plug className="h-5 w-5" />, label: 'Plugins', value: 'plugins' },
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'h-full' : 'h-full'}`}>
      <div className="p-6 border-b">
        <h1 className="text-lg font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your dashboard and account preferences.</p>
      </div>
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <button 
              key={item.value}
              onClick={() => {
                setActiveTab(item.value);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all w-full text-left ${
                activeTab === item.value 
                  ? 'bg-muted text-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <MainLayout className="p-0">
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 border-r h-full">
          <SidebarContent />
        </div>
        
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">Configure your preferences</p>
              </div>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>
          </div>
          
          <div className="p-4 lg:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="personal">
                <PersonalInfoSection />
              </TabsContent>
              
              <TabsContent value="business-info">
                <BusinessInfoSection />
              </TabsContent>
              
              <TabsContent value="business-locations">
                <BusinessLocationsSection />
              </TabsContent>
              
              <TabsContent value="security">
                <SecuritySection />
              </TabsContent>
              
              <TabsContent value="pricing">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Pricing Plan</h2>
                    <p className="text-muted-foreground">Manage your pricing plan and billing</p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Coming soon...
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payout">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Payout Methods</h2>
                    <p className="text-muted-foreground">Manage your payout methods</p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Coming soon...
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="subscriptions">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Subscriptions</h2>
                    <p className="text-muted-foreground">Manage your subscriptions</p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Coming soon...
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="insurance">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Insurance</h2>
                    <p className="text-muted-foreground">Manage your insurance settings</p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Coming soon...
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="team">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Team Members</h2>
                    <p className="text-muted-foreground">Manage your team members</p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Coming soon...
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="api">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">API Integration</h2>
                    <p className="text-muted-foreground">Manage your API integrations</p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Coming soon...
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="plugins">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Plugins</h2>
                    <p className="text-muted-foreground">Manage your plugins</p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Coming soon...
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
