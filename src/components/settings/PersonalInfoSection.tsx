
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Shield, Phone } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';

const PersonalInfoSection = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (profile && user) {
      const nameParts = profile.full_name?.split(' ') || ['', ''];
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: profile.phone || '',
        email: user.email || '',
        username: profile.full_name?.toLowerCase().replace(/\s+/g, '') || ''
      }));
    }
  }, [profile, user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Personal Info</h2>
        <p className="text-muted-foreground">Setup your personal information</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex">
                <Input 
                  id="username" 
                  value={formData.username} 
                  disabled 
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">Username can only be set once and cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex">
                <Input 
                  id="email" 
                  value={formData.email} 
                  disabled 
                  className="rounded-r-none bg-muted text-muted-foreground cursor-not-allowed" 
                />
                <div className="px-3 py-2 border border-l-0 rounded-r-lg bg-muted text-sm text-muted-foreground flex items-center">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={formData.firstName} 
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={formData.lastName} 
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              defaultCountry="LB"
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Password Management</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Request a password change email to update your account password securely.
              </p>
              <Button 
                variant="outline" 
                onClick={handleRequestPasswordChange} 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Request Password Change'}
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account (Coming soon)
              </p>
              <Button variant="outline" disabled className="mt-2">
                Enable 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoSection;
