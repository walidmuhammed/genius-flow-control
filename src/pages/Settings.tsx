
import React, { useState } from 'react';
import { User, Lock, Building2, Receipt, Users, ServerCog, Plug, FileCheck, ShieldAlert } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const Settings: React.FC = () => {
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyType>('USD');

  const menuItems = [
    { icon: <User className="h-5 w-5" />, label: 'Personal Info', value: 'personal' },
    { icon: <Lock className="h-5 w-5" />, label: 'Security', value: 'security' },
    { icon: <Building2 className="h-5 w-5" />, label: 'Business Account', value: 'business' },
    { icon: <Receipt className="h-5 w-5" />, label: 'Subscriptions', value: 'subscriptions' },
    { icon: <ShieldAlert className="h-5 w-5" />, label: 'Insurance', value: 'insurance' },
    { icon: <FileCheck className="h-5 w-5" />, label: 'Pricing Plan', value: 'pricing' },
    { icon: <Building2 className="h-5 w-5" />, label: 'Business Locations', value: 'locations' },
    { icon: <Receipt className="h-5 w-5" />, label: 'Payout Methods', value: 'payout' },
    { icon: <Users className="h-5 w-5" />, label: 'Team Members', value: 'team' },
    { icon: <ServerCog className="h-5 w-5" />, label: 'API Integration', value: 'api' },
    { icon: <Plug className="h-5 w-5" />, label: 'Plugins', value: 'plugins' },
  ];

  // Fix the onChange handler for RadioGroup
  const handleCurrencyChange = (value: string) => {
    setDefaultCurrency(value as CurrencyType);
  };

  return (
    <MainLayout className="p-0">
      <div className="flex h-full">
        <div className="w-72 border-r h-full">
          <div className="p-6 border-b">
            <h1 className="text-lg font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your dashboard and account preferences.</p>
          </div>
          <div className="py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <a 
                  key={item.value}
                  href={`#${item.value}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-6" id="personal">
              <div>
                <h2 className="text-2xl font-bold">Personal Info</h2>
                <p className="text-muted-foreground">Setup your personal info</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <div className="flex">
                    <Input id="first-name" defaultValue="Walid" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none border-l-0">
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <div className="flex">
                    <Input id="last-name" defaultValue="Mohammed" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none border-l-0">
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone number</Label>
                  <div className="flex">
                    <Input id="phone-number" defaultValue="+20114626333" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none border-l-0">
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex">
                    <Input id="email" defaultValue="walidmuhammed@gmail.com" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none border-l-0">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="space-y-6" id="security">
              <div>
                <h2 className="text-2xl font-bold">Security</h2>
                <p className="text-muted-foreground">Change your password</p>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                  Reset Password
                </Button>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Currency Settings</h3>
                  <div className="space-y-2">
                    <Label className="text-base">Default Currency for Transactions</Label>
                    <RadioGroup 
                      defaultValue={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value as CurrencyType)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="USD" id="usd" />
                        <Label htmlFor="usd">USD (US Dollar)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="LBP" id="lbp" />
                        <Label htmlFor="lbp">LBP (Lebanese Pound)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="space-y-6" id="delete-account">
              <div>
                <h2 className="text-2xl font-bold text-destructive">Delete account</h2>
                <p className="text-muted-foreground">This will delete your account, Genius Store and Team members.</p>
              </div>
              
              <div className="space-y-4">
                <Button variant="destructive">
                  Delete account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
