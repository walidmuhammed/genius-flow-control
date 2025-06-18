
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
import { Building2, Globe, Facebook, Instagram, ShoppingBag } from 'lucide-react';

const BusinessInfoSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessNameEn: '',
    businessNameAr: '',
    industry: '',
    salesChannels: [] as string[],
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    shopifyUrl: ''
  });

  const salesChannelOptions = [
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'shopify', label: 'Shopify', icon: ShoppingBag },
    { value: 'website', label: 'Custom Website', icon: Globe },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'ebay', label: 'eBay' },
    { value: 'marketplace', label: 'Local Marketplace' },
    { value: 'retail', label: 'Physical Retail' }
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

  const handleSalesChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      salesChannels: checked
        ? [...prev.salesChannels, channel]
        : prev.salesChannels.filter(c => c !== channel)
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

  const showWebsiteField = formData.salesChannels.includes('website') || formData.salesChannels.includes('shopify');
  const showFacebookField = formData.salesChannels.includes('facebook');
  const showInstagramField = formData.salesChannels.includes('instagram');

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
                onChange={(e) => setFormData(prev => ({ ...prev, businessNameEn: e.target.value }))}
                placeholder="Enter business name in English"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessNameAr">Business Name (Arabic)</Label>
              <Input 
                id="businessNameAr" 
                value={formData.businessNameAr}
                onChange={(e) => setFormData(prev => ({ ...prev, businessNameAr: e.target.value }))}
                placeholder="أدخل اسم العمل بالعربية"
                dir="rtl"
              />
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {salesChannelOptions.map((channel) => {
              const IconComponent = channel.icon;
              return (
                <div key={channel.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={channel.value}
                    checked={formData.salesChannels.includes(channel.value)}
                    onCheckedChange={(checked) => handleSalesChannelChange(channel.value, checked as boolean)}
                  />
                  <Label htmlFor={channel.value} className="flex items-center gap-2 cursor-pointer">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {channel.label}
                  </Label>
                </div>
              );
            })}
          </div>
          
          {/* Dynamic URL fields based on selected channels */}
          <div className="space-y-4 pt-4 border-t">
            {showWebsiteField && (
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input 
                  id="websiteUrl" 
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://your-website.com"
                />
              </div>
            )}
            
            {showFacebookField && (
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook Page URL</Label>
                <Input 
                  id="facebookUrl" 
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/your-page"
                />
              </div>
            )}
            
            {showInstagramField && (
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram Profile URL</Label>
                <Input 
                  id="instagramUrl" 
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                  placeholder="https://instagram.com/your-profile"
                />
              </div>
            )}
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
