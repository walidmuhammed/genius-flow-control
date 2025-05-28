
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Package, MapPin, Calendar as CalendarIcon, Clock, Truck, User, FileText, Check } from "lucide-react";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { useOrdersByStatus } from '@/hooks/use-orders';
import { useCreatePickup } from '@/hooks/use-pickups';
import { useUpdateOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SelectedOrder {
  id: string;
  referenceNumber: string;
  customer: string;
  amount: string;
}

const SchedulePickup: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<SelectedOrder[]>([]);
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<'small' | 'medium' | 'large'>('small');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch orders with "New" status
  const { data: newOrders, isLoading } = useOrdersByStatus('New');
  const createPickup = useCreatePickup();
  const updateOrder = useUpdateOrder();

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00'
  ];

  const vehicleOptions = [
    { value: 'small', label: 'Small', icon: '🏍️', description: 'Motorcycle' },
    { value: 'medium', label: 'Medium', icon: '🚗', description: 'Car' },
    { value: 'large', label: 'Large', icon: '🚐', description: 'Van' },
  ];

  const handleOrderSelection = (orderIds: string[]) => {
    if (!newOrders) return;
    
    const orders = newOrders
      .filter(order => orderIds.includes(order.id))
      .map(order => ({
        id: order.id,
        referenceNumber: order.reference_number || '',
        customer: order.customer?.name || 'Unknown',
        amount: `$${order.cash_collection_usd || 0}`
      }));
    
    setSelectedOrders(orders);
    setShowOrderSelection(false);
  };

  const removeOrder = (orderId: string) => {
    setSelectedOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const handleSubmit = async () => {
    if (!pickupDate || !pickupTime || !contactPerson || !contactPhone || !location || !address || selectedOrders.length === 0) {
      toast.error('Please fill in all required fields and select at least one order');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the pickup with proper datetime
      const pickupDateTime = new Date(pickupDate);
      const [hours, minutes] = pickupTime.split(':').map(Number);
      pickupDateTime.setHours(hours, minutes, 0, 0);

      const pickup = await createPickup.mutateAsync({
        status: 'Scheduled',
        location,
        address,
        contact_person: contactPerson,
        contact_phone: contactPhone,
        pickup_date: pickupDateTime.toISOString(),
        requested: true,
        picked_up: false,
        validated: false,
        vehicle_type: vehicleType,
        note: notes || undefined,
        orders_count: selectedOrders.length
      });

      // Update all selected orders to "Pending Pickup" status
      await Promise.all(
        selectedOrders.map(order =>
          updateOrder.mutateAsync({
            id: order.id,
            updates: { status: 'Pending Pickup' }
          })
        )
      );

      toast.success('Pickup scheduled successfully!');
      navigate('/pickups');
    } catch (error) {
      console.error('Error creating pickup:', error);
      toast.error('Failed to schedule pickup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = pickupDate && pickupTime && contactPerson && contactPhone && location && address && selectedOrders.length > 0;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pickups')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pickups
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Schedule Pickup</h1>
            <p className="text-gray-500">Create a new pickup request for your orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Step 1: Select Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={showOrderSelection} onOpenChange={setShowOrderSelection}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Select Orders ({selectedOrders.length} selected)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Select Orders for Pickup</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-auto max-h-[60vh]">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Package className="h-8 w-8 animate-pulse text-gray-400" />
                        </div>
                      ) : (
                        <OrdersTable
                          orders={newOrders || []}
                          onOrderSelection={handleOrderSelection}
                          selectionMode={true}
                          selectedOrderIds={selectedOrders.map(o => o.id)}
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {selectedOrders.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Orders:</Label>
                    <div className="grid gap-2">
                      {selectedOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{order.referenceNumber}</p>
                            <p className="text-xs text-gray-600">{order.customer} • {order.amount}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrder(order.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Pickup Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Step 2: Pickup Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Business/Store Name *</Label>
                  <Input
                    id="location"
                    placeholder="Enter your business name"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete pickup address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Contact Person */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Step 3: Contact Person
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Name *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Contact person name"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+961 XX XXX XXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Step 4: Pickup Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pickup Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !pickupDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Pickup Time *</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {timeSlots.map(time => (
                        <Button
                          key={time}
                          variant={pickupTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPickupTime(time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Vehicle Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Step 5: Vehicle Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {vehicleOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={vehicleType === option.value ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setVehicleType(option.value as any)}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-center">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 6: Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Step 6: Additional Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for the pickup..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Pickup Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>{selectedOrders.length} orders selected</span>
                  </div>
                  
                  {pickupDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{format(pickupDate, "MMM dd, yyyy")}</span>
                    </div>
                  )}
                  
                  {pickupTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{pickupTime}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="capitalize">{vehicleType} vehicle</span>
                  </div>
                  
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{location}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="w-full bg-[#DB271E] hover:bg-[#c0211a] text-white"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Scheduling...' : 'Confirm Pickup'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SchedulePickup;
