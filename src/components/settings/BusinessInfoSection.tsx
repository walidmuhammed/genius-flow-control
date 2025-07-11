
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Globe, Facebook, Instagram, ShoppingBag, Package, Truck, Smartphone } from 'lucide-react';

const BusinessInfoSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    businessNameEn: '',
    businessNameAr: '',
    industry: '',
    salesChannels: [] as string[],
    channelUrls: {} as Record<string, string>
  });

  const salesChannelOptions = [
    { value: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'Enter Facebook Page URL' },
    { value: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'Enter Instagram Profile URL' },
    { value: 'whatsapp', label: 'WhatsApp', icon: Smartphone, placeholder: 'Enter WhatsApp Business Number' },
    { value: 'shopify', label: 'Shopify', icon: ShoppingBag, placeholder: 'Enter Shopify Store URL' },
    { value: 'website', label: 'Custom Website', icon: Globe, placeholder: 'Enter Website URL' },
    { value: 'tiktok', label: 'TikTok', icon: Smartphone, placeholder: 'Enter TikTok Profile URL' },
    { value: 'amazon', label: 'Amazon', icon: Package, placeholder: 'Enter Amazon Store URL' },
    { value: 'ebay', label: 'eBay', icon: Package, placeholder: 'Enter eBay Store URL' },
    { value: 'marketplace', label: 'Local Marketplace', icon: ShoppingBag, placeholder: 'Enter Marketplace URL' },
    { value: 'retail', label: 'Physical Retail', icon: Truck, placeholder: 'Enter Store Address' }
  ];

  const industryOptions = [
    'Fashion & Apparel',
    'Electronics & Gadgets', 
    'Cosmetics & Beauty',
    'Books & Stationery',
    'Gifts & Handicrafts',
    'Baby Products',
    'Furniture',
    'Jewelry & Accessories',
    'Tools & Hardware',
    'Food & Beverages',
    'Frozen Goods',
    'Grocery & Mini Markets',
    'Medical Supplies & Pharmacies',
    'Event Supplies',
    'Florists',
    'Tech Services / Repairs',
    'Toys & Games',
    'Cleaning & Home Care',
    'Sports & Fitness Equipment',
    'Pet Supplies'
  ];

  useEffect(() => {
    fetchBusinessInfo();
  }, [user]);

  const fetchBusinessInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('business_name, business_type')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFormData(prev => ({
          ...prev,
          businessNameEn: data.business_name || '',
          industry: data.business_type || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching business info:', error);
    }
  };

  const validateEnglishInput = (value: string) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };

  const validateArabicInput = (value: string) => {
    return /^[\u0600-\u06FF\s]*$/.test(value);
  };

  const handleEnglishNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateEnglishInput(value)) {
      setFormData(prev => ({ ...prev, businessNameEn: value }));
      setHasUnsavedChanges(true);
    }
  };

  const handleArabicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateArabicInput(value)) {
      setFormData(prev => ({ ...prev, businessNameAr: value }));
      setHasUnsavedChanges(true);
    }
  };

  const handleSalesChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      salesChannels: checked
        ? [...prev.salesChannels, channel]
        : prev.salesChannels.filter(c => c !== channel)
    }));
    setHasUnsavedChanges(true);
  };

  const handleChannelUrlChange = (channel: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      channelUrls: { ...prev.channelUrls, [channel]: url }
    }));
    setHasUnsavedChanges(true);
  };

  const handleIndustryChange = (value: string) => {
    setFormData(prev => ({ ...prev, industry: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: formData.businessNameEn,
          business_type: formData.industry
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Business information updated successfully');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating business info:', error);
      toast.error('Failed to update business information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Business Information</h2>
        <p className="text-muted-foreground">Setup your business details and sales channels</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessNameEn">Business Name (English)</Label>
              <Input 
                id="businessNameEn" 
                value={formData.businessNameEn}
                onChange={handleEnglishNameChange}
                placeholder="Enter business name in English"
              />
              <p className="text-xs text-muted-foreground">English letters only</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessNameAr">Business Name (Arabic)</Label>
              <Input 
                id="businessNameAr" 
                value={formData.businessNameAr}
                onChange={handleArabicNameChange}
                placeholder="أدخل اسم العمل بالعربية"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground">Arabic letters only</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={formData.industry} onValueChange={handleIndustryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sales Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesChannelOptions.map((channel) => {
              const IconComponent = channel.icon;
              const isSelected = formData.salesChannels.includes(channel.value);
              return (
                <div key={channel.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={channel.value}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSalesChannelChange(channel.value, checked as boolean)}
                  />
                  <Label htmlFor={channel.value} className="flex items-center gap-2 cursor-pointer">
                    <IconComponent className="h-4 w-4" />
                    {channel.label}
                  </Label>
                </div>
              );
            })}
          </div>
          
          {/* Channel URL Inputs */}
          {formData.salesChannels.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Channel Details</h4>
              {formData.salesChannels.map((channelValue) => {
                const channel = salesChannelOptions.find(c => c.value === channelValue);
                if (!channel) return null;
                
                const IconComponent = channel.icon;
                return (
                  <div key={channelValue} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {channel.label}
                    </Label>
                    <Input
                      placeholder={channel.placeholder}
                      value={formData.channelUrls[channelValue] || ''}
                      onChange={(e) => handleChannelUrlChange(channelValue, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Channel Summary */}
          {formData.salesChannels.length > 0 && Object.keys(formData.channelUrls).some(key => formData.channelUrls[key]) && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-3">Active Channels</h4>
              <div className="space-y-2">
                {Object.entries(formData.channelUrls).map(([channelValue, url]) => {
                  if (!url) return null;
                  const channel = salesChannelOptions.find(c => c.value === channelValue);
                  if (!channel) return null;
                  
                  const IconComponent = channel.icon;
                  return (
                    <div key={channelValue} className="flex items-center gap-2 text-sm">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{channel.label}:</span>
                      <span className="text-muted-foreground truncate">{url}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {hasUnsavedChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Business Information'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoSection;
