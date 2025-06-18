
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Shield, Edit, Save, X } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';

const PersonalInfoSection = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (profile && user) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || '',
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setIsEditing(false);
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

  const handleCancel = () => {
    if (profile && user) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        phone: profile.phone || '',
      }));
    }
    setIsEditing(false);
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUpdateProfile} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={formData.username} 
                disabled 
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={formData.fullName} 
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              defaultCountry="LB"
              className="w-full"
              disabled={!isEditing}
              inputClassName={!isEditing ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
            />
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
