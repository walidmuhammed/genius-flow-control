
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PhoneInput } from '@/components/ui/phone-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ImprovedAreaSelector } from '@/components/orders/ImprovedAreaSelector';
import { Upload, X, User, Camera, FileText, CreditCard } from 'lucide-react';
import { useUploadCourierFile } from '@/hooks/use-couriers';
import { supabase } from '@/integrations/supabase/client';
import { useGovernoratesAndCities } from '@/hooks/use-governorates';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const courierSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  vehicle_type: z.enum(['motorcycle', 'car', 'van', 'bicycle']),
  governorate_id: z.string().min(1, "Please select a governorate"),
  city_id: z.string().min(1, "Please select a city"),
  address: z.string().optional(),
  admin_notes: z.string().optional()
});

type CourierFormData = z.infer<typeof courierSchema>;

interface AddCourierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCourierModal = ({ open, onOpenChange }: AddCourierModalProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [licensePhotoFile, setLicensePhotoFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: governoratesAndCities } = useGovernoratesAndCities();
  const uploadFileMutation = useUploadCourierFile();

  const form = useForm<CourierFormData>({
    resolver: zodResolver(courierSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      password: '',
      vehicle_type: 'motorcycle',
      governorate_id: '',
      city_id: '',
      address: '',
      admin_notes: ''
    }
  });

  const handleFileUpload = (file: File, type: 'avatar' | 'id_photo' | 'license_photo') => {
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    } else if (type === 'id_photo') {
      setIdPhotoFile(file);
    } else if (type === 'license_photo') {
      setLicensePhotoFile(file);
    }
  };

  const onSubmit = async (data: CourierFormData) => {
    setIsCreating(true);
    try {
      let avatarPublicUrl = '';
      let idPhotoPublicUrl = '';
      let licensePhotoPublicUrl = '';

      // Upload files if selected
      if (avatarFile) {
        avatarPublicUrl = await uploadFileMutation.mutateAsync({ 
          file: avatarFile, 
          type: 'avatar' 
        });
      }
      
      if (idPhotoFile) {
        idPhotoPublicUrl = await uploadFileMutation.mutateAsync({ 
          file: idPhotoFile, 
          type: 'id_photo' 
        });
      }
      
      if (licensePhotoFile) {
        licensePhotoPublicUrl = await uploadFileMutation.mutateAsync({ 
          file: licensePhotoFile, 
          type: 'license_photo' 
        });
      }

      // Find selected governorate and city names
      const selectedGovernorate = governoratesAndCities?.find(g => g.id === data.governorate_id);
      const selectedCity = selectedGovernorate?.cities?.find(c => c.id === data.city_id);
      
      const assignedZones = selectedGovernorate && selectedCity ? 
        [`${selectedGovernorate.name} - ${selectedCity.name}`] : [];

      // Create auth user using Supabase Admin API
      const { data: authResult, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: {
          full_name: data.full_name,
          phone: data.phone,
          user_type: 'courier',
          address: data.address,
          vehicle_type: data.vehicle_type,
          assigned_zones: assignedZones,
          avatar_url: avatarPublicUrl || null,
          id_photo_url: idPhotoPublicUrl || null,
          license_photo_url: licensePhotoPublicUrl || null,
          admin_notes: data.admin_notes,
          admin_created: 'true' // Mark as admin-created for active status
        }
      });

      if (authError) throw authError;

      toast.success("Courier created successfully with login credentials");

      // Reset form and close modal
      form.reset();
      setAvatarFile(null);
      setIdPhotoFile(null);
      setLicensePhotoFile(null);
      setAvatarUrl('');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating courier:', error);
      toast.error(`Error creating courier: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedGovernorate = governoratesAndCities?.find(g => g.id === form.watch('governorate_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Courier</DialogTitle>
          <p className="text-sm text-muted-foreground">Create a courier account with login credentials. The courier will be immediately active.</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted">
                    <Camera className="h-4 w-4" />
                    Profile Picture
                  </div>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'avatar');
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter courier's full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter phone number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="courier@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Secure password (min. 6 chars)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Type */}
              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="bicycle">Bicycle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Selection */}
            <div className="space-y-4">
              <Label>Assigned Zone *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="governorate_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Governorate</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('city_id', ''); // Reset city when governorate changes
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select governorate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {governoratesAndCities?.map((gov) => (
                            <SelectItem key={gov.id} value={gov.id}>
                              {gov.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedGovernorate}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedGovernorate?.cities?.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Full Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter complete address..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Uploads */}
            <div className="space-y-4">
              <Label>Documents (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID Photo Upload */}
                <div>
                  <Label htmlFor="id-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted">
                      <FileText className="h-4 w-4" />
                      ID Photo
                      {idPhotoFile && <Badge variant="secondary">Uploaded</Badge>}
                    </div>
                  </Label>
                  <input
                    id="id-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'id_photo');
                    }}
                  />
                </div>

                {/* License Photo Upload */}
                <div>
                  <Label htmlFor="license-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted">
                      <CreditCard className="h-4 w-4" />
                      Driver License
                      {licensePhotoFile && <Badge variant="secondary">Uploaded</Badge>}
                    </div>
                  </Label>
                  <input
                    id="license-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'license_photo');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <FormField
              control={form.control}
              name="admin_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add any notes about this courier..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isCreating || uploadFileMutation.isPending}
              >
                {isCreating || uploadFileMutation.isPending ? 'Creating...' : 'Create Courier'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourierModal;
