import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateAdminClient } from '@/hooks/use-admin-clients';
import { Building, User, Mail, Phone, Key } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const businessTypes = [
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

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    password: '',
    phone: '',
    business_type: '',
    full_name: ''
  });

  const createClientMutation = useCreateAdminClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_name || !formData.email || !formData.password || !formData.business_type) {
      return;
    }

    try {
      await createClientMutation.mutateAsync(formData);
      setFormData({
        business_name: '',
        email: '',
        password: '',
        phone: '',
        business_type: '',
        full_name: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Add New Client Account
          </DialogTitle>
          <DialogDescription>
            Create a new business client account that can access the platform immediately
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-4 w-4" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="e.g. ABC Electronics Store"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select 
                    value={formData.business_type} 
                    onValueChange={(value) => handleInputChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Contact Person</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Full name of primary contact"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+961 XX XXX XXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-4 w-4" />
                Account Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="business@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Secure password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The client can change their password after first login. 
                  Make sure to provide them with these credentials securely.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createClientMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createClientMutation.isPending || !formData.business_name || !formData.email || !formData.password || !formData.business_type}
            >
              {createClientMutation.isPending ? 'Creating...' : 'Create Client Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;