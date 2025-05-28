import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Package, MapPin, Calendar as CalendarIcon, Clock, Car, Bike, Truck, User, FileText, Check } from "lucide-react";
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
    { 
      value: 'small', 
      label: 'Motorcycle', 
      icon: Bike, 
      description: 'Best for small packages',
      price: 'From $2'
    },
    { 
      value: 'medium', 
      label: 'Car', 
      icon: Car, 
      description: 'Standard delivery option',
      price: 'From $5'
    },
    { 
      value: 'large', 
      label: 'Van', 
      icon: Truck, 
      description: 'For large or multiple packages',
      price: 'From $8'
    },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pickups')}
              className="text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pickups
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Schedule Pickup</h1>
              <p className="text-gray-600 mt-1">Create a new pickup request for your orders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-6">
              {/* Step 1: Select Orders */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-[#DB271E] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <Package className="h-6 w-6 text-[#DB271E]" />
                    Select Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Dialog open={showOrderSelection} onOpenChange={setShowOrderSelection}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-14 text-base border-2 border-dashed border-gray-300 hover:border-[#DB271E] hover:bg-red-50 transition-all">
                        <Package className="h-5 w-5 mr-3" />
                        {selectedOrders.length === 0 ? 'Select Orders to Pickup' : `${selectedOrders.length} Orders Selected`}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl max-h-[85vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Select Orders for Pickup</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-auto max-h-[70vh]">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DB271E]"></div>
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
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900">Selected Orders:</Label>
                      <div className="grid gap-3">
                        {selectedOrders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{order.referenceNumber}</p>
                              <p className="text-sm text-gray-600">{order.customer} • {order.amount}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOrder(order.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100"
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

              {/* Step 2 & 3: Address and Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-[#DB271E] text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <MapPin className="h-6 w-6 text-[#DB271E]" />
                      Pickup Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">Business/Store Name *</Label>
                      <Input
                        id="location"
                        placeholder="Enter your business name"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">Full Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter complete pickup address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-[#DB271E] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <User className="h-6 w-6 text-[#DB271E]" />
                      Contact Person
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson" className="text-sm font-medium">Contact Name *</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Contact person name"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-sm font-medium">Phone Number *</Label>
                      <Input
                        id="contactPhone"
                        placeholder="+961 XX XXX XXX"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 4: Date & Time */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-[#DB271E] text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <CalendarIcon className="h-6 w-6 text-[#DB271E]" />
                    Pickup Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Pickup Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-11 justify-start text-left font-normal border-2",
                              !pickupDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4" />
                            {pickupDate ? format(pickupDate, "PPP") : "Select pickup date"}
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
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Pickup Time *</Label>
                      <div className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div className="flex-1 overflow-x-auto">
                          <div className="flex gap-2 pb-2">
                            {timeSlots.map(time => (
                              <Button
                                key={time}
                                variant={pickupTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPickupTime(time)}
                                className={cn(
                                  "min-w-[70px] text-xs font-medium transition-all",
                                  pickupTime === time 
                                    ? "bg-[#DB271E] hover:bg-[#c0211a] text-white shadow-md" 
                                    : "hover:bg-gray-100 border-gray-300"
                                )}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5: Vehicle Type */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-[#DB271E] text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <Car className="h-6 w-6 text-[#DB271E]" />
                    Vehicle Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vehicleOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant={vehicleType === option.value ? "default" : "outline"}
                          className={cn(
                            "h-auto p-6 flex flex-col items-center gap-3 border-2 transition-all",
                            vehicleType === option.value 
                              ? "bg-[#DB271E] hover:bg-[#c0211a] text-white border-[#DB271E] shadow-lg" 
                              : "hover:bg-gray-50 border-gray-300 hover:border-[#DB271E]"
                          )}
                          onClick={() => setVehicleType(option.value as any)}
                        >
                          <IconComponent className="h-8 w-8" />
                          <div className="text-center">
                            <p className="font-semibold">{option.label}</p>
                            <p className="text-xs opacity-80 mt-1">{option.description}</p>
                            <p className="text-xs font-medium mt-1">{option.price}</p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step 6: Notes */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                    <FileText className="h-6 w-6 text-gray-600" />
                    Additional Notes (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special instructions for the pickup driver..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px] border-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="xl:col-span-1">
              <Card className="sticky top-6 shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-gray-900">Pickup Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Package className="h-5 w-5 text-[#DB271E]" />
                      <span className="font-medium">{selectedOrders.length} orders selected</span>
                    </div>
                    
                    {pickupDate && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-[#DB271E]" />
                        <span className="font-medium">{format(pickupDate, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    
                    {pickupTime && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <Clock className="h-5 w-5 text-[#DB271E]" />
                        <span className="font-medium">{pickupTime}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      {vehicleType === 'small' && <Bike className="h-5 w-5 text-[#DB271E]" />}
                      {vehicleType === 'medium' && <Car className="h-5 w-5 text-[#DB271E]" />}
                      {vehicleType === 'large' && <Truck className="h-5 w-5 text-[#DB271E]" />}
                      <span className="font-medium capitalize">{vehicleOptions.find(v => v.value === vehicleType)?.label}</span>
                    </div>
                    
                    {location && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <MapPin className="h-5 w-5 text-[#DB271E]" />
                        <span className="font-medium truncate">{location}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="w-full bg-[#DB271E] hover:bg-[#c0211a] text-white h-12 text-base font-semibold shadow-lg"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {isSubmitting ? 'Scheduling...' : 'Confirm Pickup'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SchedulePickup;
