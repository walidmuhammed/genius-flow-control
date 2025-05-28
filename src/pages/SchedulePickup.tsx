
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Calendar, MapPin, User, Phone, Trash2, Plus } from "lucide-react";
import { useOrdersByStatus } from "@/hooks/use-orders";
import { useCreatePickup } from "@/hooks/use-pickups";
import { useUpdateOrder } from "@/hooks/use-orders";
import { toast } from "sonner";
import { format } from 'date-fns';

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  contact_person: string;
  contact_phone: string;
}

const SchedulePickup: React.FC = () => {
  const navigate = useNavigate();
  const { data: newOrders = [], isLoading } = useOrdersByStatus('New');
  const { mutate: createPickup } = useCreatePickup();
  const { mutate: updateOrder } = useUpdateOrder();

  // Form state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'small' | 'medium' | 'large'>('medium');
  const [note, setNote] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: '1',
      name: 'Main Store',
      address: 'Hamra Street, Beirut, Lebanon',
      contact_person: 'Ahmad Khalil',
      contact_phone: '+961 70 123 456'
    }
  ]);

  // Select all functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(newOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleOrderSelect = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSavedAddressSelect = (savedAddress: SavedAddress) => {
    setLocation(savedAddress.name);
    setAddress(savedAddress.address);
    setContactPerson(savedAddress.contact_person);
    setContactPhone(savedAddress.contact_phone);
  };

  const handleDeleteSavedAddress = (addressId: string) => {
    setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
    toast.success("Address deleted successfully");
  };

  const handleAddNewAddress = () => {
    if (!location || !address || !contactPerson || !contactPhone) {
      toast.error("Please fill in all fields to save address");
      return;
    }

    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      name: location,
      address: address,
      contact_person: contactPerson,
      contact_phone: contactPhone
    };

    setSavedAddresses(prev => [...prev, newAddress]);
    toast.success("Address saved successfully");
  };

  const handleSubmit = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }

    if (!pickupDate || !pickupTime || !location || !address || !contactPerson || !contactPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);

    try {
      // Create pickup
      const pickup = await new Promise((resolve, reject) => {
        createPickup({
          status: 'Scheduled',
          location,
          address,
          contact_person: contactPerson,
          contact_phone: contactPhone,
          pickup_date: pickupDateTime.toISOString(),
          note: note || undefined,
          vehicle_type: vehicleType,
          orders_count: selectedOrders.length,
          requested: true,
          picked_up: false,
          validated: false
        }, {
          onSuccess: resolve,
          onError: reject
        });
      });

      // Update selected orders status to 'Pending Pickup'
      for (const orderId of selectedOrders) {
        updateOrder({ id: orderId, updates: { status: 'Pending Pickup' } });
      }

      toast.success("Pickup scheduled successfully!");
      navigate('/pickups');
    } catch (error) {
      console.error('Error creating pickup:', error);
      toast.error("Failed to schedule pickup. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-lg">Loading orders...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/pickups')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Schedule Pickup</h1>
            <p className="text-gray-500">Select orders and schedule a pickup time</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Order Selection */}
          <div className="space-y-6">
            {/* Orders Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Select Orders ({newOrders.length} available)
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedOrders.length === newOrders.length && newOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm">Select All</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {newOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No orders available for pickup</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/orders/new')}
                    >
                      Create Order
                    </Button>
                  </div>
                ) : (
                  newOrders.map(order => (
                    <div key={order.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => handleOrderSelect(order.id, !!checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{order.order_id.toString().padStart(3, '0')}</span>
                            <Badge variant="outline" className="text-xs">{order.type}</Badge>
                          </div>
                          <Badge className="bg-blue-50 text-blue-700">New</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>{order.customer.name}</div>
                          <div className="text-xs">{order.customer.city_name}, {order.customer.governorate_name}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Saved Addresses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Saved Addresses
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleAddNewAddress}>
                    <Plus className="h-4 w-4 mr-1" />
                    Save Current
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedAddresses.map(savedAddress => (
                  <div key={savedAddress.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleSavedAddressSelect(savedAddress)}
                      >
                        <div className="font-medium">{savedAddress.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{savedAddress.address}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {savedAddress.contact_person} • {savedAddress.contact_phone}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSavedAddress(savedAddress.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pickup Details */}
          <div className="space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickup-date">Pickup Date</Label>
                    <Input
                      id="pickup-date"
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup-time">Pickup Time</Label>
                    <Input
                      id="pickup-time"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Location Name</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main Store, Warehouse A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete pickup address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input
                    id="contact-person"
                    placeholder="Full name"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    placeholder="+961 XX XXX XXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vehicle-type">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={(value: 'small' | 'medium' | 'large') => setVehicleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (Motorcycle/Bike)</SelectItem>
                      <SelectItem value="medium">Medium (Car/Van)</SelectItem>
                      <SelectItem value="large">Large (Truck)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="note">Special Instructions</Label>
                  <Textarea
                    id="note"
                    placeholder="Any special instructions for the courier..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {selectedOrders.length} order(s) selected for pickup
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/pickups')}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedOrders.length === 0}
              className="bg-[#DB271E] hover:bg-[#DB271E]/90"
            >
              Schedule Pickup
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SchedulePickup;
