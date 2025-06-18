
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { PhoneInput } from '@/components/ui/phone-input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMobile } from '@/hooks/use-mobile';

interface BusinessLocation {
  id: string;
  name: string;
  country: string;
  governorate: string;
  area: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  isDefault: boolean;
  userId: string;
}

const BusinessLocationsSection = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<BusinessLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    governorate: '',
    area: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    isDefault: false
  });

  const countries = ['Lebanon', 'United Arab Emirates', 'Saudi Arabia', 'Egypt', 'Jordan'];
  const governorates = ['Beirut', 'Mount Lebanon', 'North Lebanon', 'South Lebanon', 'Bekaa', 'Nabatieh'];
  const areas = ['Achrafieh', 'Hamra', 'Verdun', 'Kaslik', 'Jounieh', 'Tripoli', 'Sidon', 'Tyre', 'Zahle', 'Baalbek'];

  useEffect(() => {
    if (user) {
      fetchLocations();
    }
  }, [user]);

  const fetchLocations = async () => {
    if (!user) return;
    
    try {
      // Since we don't have a business_locations table, we'll simulate with localStorage for now
      const savedLocations = localStorage.getItem(`business_locations_${user.id}`);
      if (savedLocations) {
        setLocations(JSON.parse(savedLocations));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const saveLocations = (newLocations: BusinessLocation[]) => {
    if (!user) return;
    localStorage.setItem(`business_locations_${user.id}`, JSON.stringify(newLocations));
    setLocations(newLocations);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.country || !formData.contactPerson || !formData.contactPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) return;

    const location: BusinessLocation = {
      id: editingLocation?.id || Date.now().toString(),
      userId: user.id,
      isDefault: formData.isDefault,
      ...formData
    };

    let updatedLocations;
    
    if (editingLocation) {
      updatedLocations = locations.map(loc => loc.id === editingLocation.id ? location : loc);
      toast.success('Location updated successfully');
    } else {
      updatedLocations = [...locations, location];
      toast.success('Location added successfully');
    }

    // If setting as default, remove default from others
    if (location.isDefault) {
      updatedLocations = updatedLocations.map(loc => 
        loc.id === location.id ? loc : { ...loc, isDefault: false }
      );
    }

    saveLocations(updatedLocations);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      governorate: '',
      area: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      isDefault: false
    });
    setEditingLocation(null);
    setIsModalOpen(false);
  };

  const handleEdit = (location: BusinessLocation) => {
    setFormData({
      name: location.name,
      country: location.country,
      governorate: location.governorate,
      area: location.area,
      address: location.address,
      contactPerson: location.contactPerson,
      contactPhone: location.contactPhone,
      isDefault: location.isDefault
    });
    setEditingLocation(location);
    setIsDetailsOpen(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedLocations = locations.filter(loc => loc.id !== id);
    saveLocations(updatedLocations);
    toast.success('Location deleted successfully');
    setIsDetailsOpen(false);
  };

  const handleSetDefault = (id: string) => {
    const updatedLocations = locations.map(loc => ({
      ...loc,
      isDefault: loc.id === id
    }));
    saveLocations(updatedLocations);
    toast.success('Default location updated');
    setIsDetailsOpen(false);
  };

  const handleLocationClick = (location: BusinessLocation) => {
    setSelectedLocation(location);
    setIsDetailsOpen(true);
  };

  const LocationForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Location Name *</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Main Office, Warehouse"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="governorate">Governorate</Label>
        <Select value={formData.governorate} onValueChange={(value) => setFormData(prev => ({ ...prev, governorate: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select governorate" />
          </SelectTrigger>
          <SelectContent>
            {governorates.map((gov) => (
              <SelectItem key={gov} value={gov}>
                {gov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="area">Area</Label>
        <Select value={formData.area} onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input 
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Building, street, district"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact Person *</Label>
        <Input 
          id="contactPerson"
          value={formData.contactPerson}
          onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
          placeholder="Full name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactPhone">Contact Phone *</Label>
        <PhoneInput
          value={formData.contactPhone}
          onChange={(value) => setFormData(prev => ({ ...prev, contactPhone: value }))}
          defaultCountry="LB"
        />
      </div>
      
      <div className="md:col-span-2 flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="isDefault">Set as default location</Label>
      </div>
      
      <div className="md:col-span-2 flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={resetForm}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {editingLocation ? 'Update Location' : 'Add Location'}
        </Button>
      </div>
    </div>
  );

  const LocationDetails = ({ location }: { location: BusinessLocation }) => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Location Name</h4>
          <p className="font-medium">{location.name}</p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
          <p>{location.governorate && `${location.governorate}, `}{location.area && `${location.area}, `}{location.address}</p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Contact Person</h4>
          <p>{location.contactPerson}</p>
          <p className="text-sm text-muted-foreground">{location.contactPhone}</p>
        </div>
        {location.isDefault && (
          <div className="flex items-center gap-2 text-red-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">Default Location</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => handleEdit(location)} className="flex-1">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        {!location.isDefault && (
          <Button variant="outline" onClick={() => handleSetDefault(location.id)} className="flex-1">
            <Star className="h-4 w-4 mr-2" />
            Make Default
          </Button>
        )}
        <Button variant="outline" onClick={() => handleDelete(location.id)} className="flex-1">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Business Locations</h2>
          <p className="text-muted-foreground">Manage your business locations and contact details</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </DialogTitle>
            </DialogHeader>
            <LocationForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locations ({locations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No locations added yet</p>
              <p className="text-sm">Add your first business location to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Contact Person</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow 
                        key={location.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleLocationClick(location)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {location.name}
                            {location.isDefault && (
                              <Star className="h-4 w-4 text-red-600 fill-current" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {location.governorate && `${location.governorate}, `}
                            {location.area && `${location.area}, `}
                            {location.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{location.contactPerson}</div>
                            <div className="text-sm text-muted-foreground">{location.contactPhone}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {locations.map((location) => (
                  <Card 
                    key={location.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleLocationClick(location)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{location.name}</h3>
                        {location.isDefault && (
                          <Star className="h-4 w-4 text-red-600 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {location.governorate && `${location.governorate}, `}
                        {location.area && `${location.area}`}
                      </p>
                      <p className="text-sm font-medium">{location.contactPerson}</p>
                      <p className="text-sm text-muted-foreground">{location.contactPhone}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Location Details Drawer/Dialog */}
      {isMobile ? (
        <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Location Details</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              {selectedLocation && <LocationDetails location={selectedLocation} />}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Location Details</DialogTitle>
            </DialogHeader>
            {selectedLocation && <LocationDetails location={selectedLocation} />}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BusinessLocationsSection;
