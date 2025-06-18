
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
  const [formData, setFormData] = useState({
    businessNameEn: '',
    businessNameAr: '',
    industry: '',
    salesChannels: [] as string[],
    channelUrls: {} as Record<string, string>
  });

  const salesChannelOptions = [
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
    { value: 'shopify', label: 'Shopify', icon: ShoppingBag },
    { value: 'website', label: 'Custom Website', icon: Globe },
    { value: 'tiktok', label: 'TikTok', icon: Smartphone },
    { value: 'amazon', label: 'Amazon', icon: Package },
    { value: 'ebay', label: 'eBay', icon: Package },
    { value: 'marketplace', label: 'Local Marketplace', icon: ShoppingBag },
    { value: 'retail', label: 'Physical Retail', icon: Truck }
  ];

  const industryOptions = [
    'Fashion & Apparel',
    'Electronics & Technology',
    'Food & Beverages',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Fitness',
    'Books & Media',
    'Jewelry & Accessories',
    'Toys & Games',
    'Automotive',
    'Arts & Crafts',
    'Pet Supplies',
    'Office Supplies',
    'Musical Instruments',
    'Travel & Tourism',
    'Education & Training',
    'Professional Services',
    'Real Estate',
    'Finance & Insurance',
    'Other'
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
    }
  };

  const handleArabicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateArabicInput(value)) {
      setFormData(prev => ({ ...prev, businessNameAr: value }));
    }
  };

  const handleSalesChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      salesChannels: checked
        ? [...prev.salesChannels, channel]
        : prev.salesChannels.filter(c => c !== channel)
    }));
  };

  const handleChannelUrlChange = (channel: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      channelUrls: { ...prev.channelUrls, [channel]: url }
    }));
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
            <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
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
                <div key={channel.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
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
                  
                  {isSelected && (
                    <Input
                      placeholder={`Enter ${channel.label} URL/handle`}
                      value={formData.channelUrls[channel.value] || ''}
                      onChange={(e) => handleChannelUrlChange(channel.value, e.target.value)}
                      className="ml-6"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Business Information'}
        </Button>
      </div>
    </div>
  );
};

export default BusinessInfoSection;
