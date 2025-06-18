
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BusinessLocation {
  id: string;
  name: string;
  country: string;
  governorate: string;
  area: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
}

const BusinessLocationsSection = () => {
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    governorate: '',
    area: '',
    address: '',
    contactPerson: '',
    contactPhone: ''
  });

  const countries = ['Lebanon', 'United Arab Emirates', 'Saudi Arabia', 'Egypt', 'Jordan'];
  const governorates = ['Beirut', 'Mount Lebanon', 'North Lebanon', 'South Lebanon', 'Bekaa', 'Nabatieh'];
  const areas = ['Achrafieh', 'Hamra', 'Verdun', 'Kaslik', 'Jounieh', 'Tripoli', 'Sidon', 'Tyre', 'Zahle', 'Baalbek'];

  const handleSubmit = () => {
    if (!formData.name || !formData.country || !formData.contactPerson || !formData.contactPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const location: BusinessLocation = {
      id: editingLocation?.id || Date.now().toString(),
      ...formData
    };

    if (editingLocation) {
      setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? location : loc));
      toast.success('Location updated successfully');
    } else {
      setLocations(prev => [...prev, location]);
      toast.success('Location added successfully');
    }

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
      contactPhone: ''
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
      contactPhone: location.contactPhone
    });
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    toast.success('Location deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </DialogTitle>
            </DialogHeader>
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
                <Input 
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+961 XX XXX XXX"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingLocation ? 'Update Location' : 'Add Location'}
              </Button>
            </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.country}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {location.governorate && `${location.governorate}, `}
                        {location.area && `${location.area}, `}
                        {location.address}
                      </div>
                    </TableCell>
                    <TableCell>{location.contactPerson}</TableCell>
                    <TableCell>{location.contactPhone}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(location.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessLocationsSection;
