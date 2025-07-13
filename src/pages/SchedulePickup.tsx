import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Package, MapPin, Calendar as CalendarIcon, Clock, Truck, User, FileText, Check, Car, Bike, Hash, Phone, Plus } from "lucide-react";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { useOrdersByStatus } from '@/hooks/use-orders';
import { useCreatePickup } from '@/hooks/use-pickups';
import { useUpdateOrder } from '@/hooks/use-orders';
import { useBusinessLocations, BusinessLocation } from '@/hooks/use-business-locations';
import LocationAreaSelector from '@/components/forms/LocationAreaSelector';
import { PhoneInput } from '@/components/ui/phone-input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Checkbox } from '@/components/ui/checkbox';

interface SelectedOrder {
  id: string;
  referenceNumber: string;
  customer: string;
  amount: string;
}

const SchedulePickup: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const { locations, addLocation, getDefaultLocation } = useBusinessLocations();

  /** TIME WINDOW CONSTANTS */
  const SLIDER_MIN = 8; // 8 AM
  const SLIDER_MAX = 20; // 8 PM

  const [selectedOrders, setSelectedOrders] = useState<SelectedOrder[]>([]);
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [timeRange, setTimeRange] = useState<number[]>([SLIDER_MIN + 1, SLIDER_MAX]); 
  const [vehicleType, setVehicleType] = useState<'small' | 'medium' | 'large'>('small');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempSelectedOrderIds, setTempSelectedOrderIds] = useState<string[]>([]);
  const [todayWindowUnavailable, setTodayWindowUnavailable] = useState(false);
  
  // New location form state
  const [showNewLocationForm, setShowNewLocationForm] = useState(false);
  const [newLocationForm, setNewLocationForm] = useState({
    name: '',
    country: 'Lebanon',
    governorate: '',
    area: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    isDefault: false
  });

  // Set default location on load
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      const defaultLocation = getDefaultLocation();
      if (defaultLocation) {
        setSelectedLocationId(defaultLocation.id);
      }
    }
  }, [locations, selectedLocationId, getDefaultLocation]);

  // Time logic - memoize the next available hour for "today"
  const now = new Date();
  const isSelectedToday = useMemo(() => 
    pickupDate && 
    now.getFullYear() === pickupDate.getFullYear() && 
    now.getMonth() === pickupDate.getMonth() && 
    now.getDate() === pickupDate.getDate(), 
    [pickupDate, now]
  );

  // Compute the earliest available hour for today
  const nextAvailableHour = useMemo(() => {
    if (!isSelectedToday) return SLIDER_MIN;
    const currHour = now.getHours();
    const currMin = now.getMinutes();
    let hour = currHour + (currMin > 0 ? 1 : 0) + 1;
    if (hour < SLIDER_MIN) hour = SLIDER_MIN;
    if (hour > SLIDER_MAX) hour = SLIDER_MAX + 1;
    return hour;
  }, [isSelectedToday, now]);

  // When selecting pickup date:
  useEffect(() => {
    if (!pickupDate) return;
    if (isSelectedToday) {
      if (nextAvailableHour > SLIDER_MAX) {
        setTodayWindowUnavailable(true);
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        setPickupDate(tomorrow);
        setTimeRange([SLIDER_MIN + 1, SLIDER_MAX]);
      } else {
        setTodayWindowUnavailable(false);
        setTimeRange(prev => [
          Math.max(prev[0], nextAvailableHour), 
          Math.max(Math.max(prev[1], nextAvailableHour), Math.max(prev[0], nextAvailableHour))
        ]);
      }
    } else {
      setTodayWindowUnavailable(false);
      setTimeRange(prev => [Math.max(prev[0], SLIDER_MIN), Math.min(prev[1], SLIDER_MAX)]);
    }
  }, [pickupDate, isSelectedToday, nextAvailableHour]);

  const isValueDisabled = (val: number) => {
    if (isSelectedToday && val < nextAvailableHour) return true;
    return val < SLIDER_MIN || val > SLIDER_MAX;
  };

  const sliderMarks = useMemo(() => {
    const arr = [];
    for (let i = SLIDER_MIN; i <= SLIDER_MAX; i++) {
      arr.push({
        hour: i,
        disabled: isValueDisabled(i)
      });
    }
    return arr;
  }, [isSelectedToday, nextAvailableHour]);

  const { data: newOrders, isLoading } = useOrdersByStatus('New');
  const createPickup = useCreatePickup();
  const updateOrder = useUpdateOrder();

  const vehicleOptions = [
    { value: 'small', label: 'Small', icon: Bike, description: 'Motorcycle' },
    { value: 'medium', label: 'Medium', icon: Car, description: 'Car' },
    { value: 'large', label: 'Large', icon: Truck, description: 'Van' }
  ];

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const handleOrderSelection = (orderIds: string[]) => {
    if (!newOrders) return;
    const orders = newOrders.filter(order => orderIds.includes(order.id)).map(order => ({
      id: order.id,
      referenceNumber: order.reference_number || '',
      customer: order.customer?.name || 'Unknown',
      amount: `$${order.cash_collection_usd || 0}`
    }));
    setSelectedOrders(orders);
    setShowOrderSelection(false);
  };

  const handleMobileOrderToggle = (orderId: string) => {
    setTempSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (!newOrders) return;
    const allOrderIds = newOrders.map(order => order.id);
    const allSelected = allOrderIds.length > 0 && allOrderIds.every(id => tempSelectedOrderIds.includes(id));
    setTempSelectedOrderIds(allSelected ? [] : allOrderIds);
  };

  const handleMobileOrderConfirm = () => {
    handleOrderSelection(tempSelectedOrderIds);
  };

  const removeOrder = (orderId: string) => {
    setSelectedOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const handleNewLocationSubmit = () => {
    if (!newLocationForm.name || !newLocationForm.contactPerson || !newLocationForm.contactPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newLocation = addLocation(newLocationForm);
    if (newLocation) {
      setSelectedLocationId(newLocation.id);
      setNewLocationForm({
        name: '',
        country: 'Lebanon',
        governorate: '',
        area: '',
        address: '',
        contactPerson: '',
        contactPhone: '',
        isDefault: false
      });
      setShowNewLocationForm(false);
      toast.success('Location added successfully');
    }
  };

  const handleLocationAreaChange = (value: string) => {
    const parts = value.split(' — ');
    if (parts.length === 2) {
      setNewLocationForm(prev => ({
        ...prev,
        governorate: parts[0],
        area: parts[1]
      }));
    } else {
      setNewLocationForm(prev => ({
        ...prev,
        governorate: value,
        area: ''
      }));
    }
  };

  const handleSubmit = async () => {
    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    
    if (!pickupDate || !selectedLocation || selectedOrders.length === 0) {
      toast.error('Please fill in all required fields and select at least one order');
      return;
    }

    setIsSubmitting(true);
    try {
      const pickupDateTime = new Date(pickupDate);
      pickupDateTime.setHours(timeRange[0], 0, 0, 0);

      await createPickup.mutateAsync({
        pickup: {
          status: 'Scheduled',
          location: selectedLocation.name,
          address: `${selectedLocation.address}${selectedLocation.area ? `, ${selectedLocation.area}` : ''}${selectedLocation.governorate ? `, ${selectedLocation.governorate}` : ''}`,
          contact_person: selectedLocation.contactPerson,
          contact_phone: selectedLocation.contactPhone,
          pickup_date: pickupDateTime.toISOString(),
          requested: true,
          picked_up: false,
          validated: false,
          vehicle_type: vehicleType,
          note: notes || undefined,
          orders_count: selectedOrders.length
        },
        orderIds: selectedOrders.map(order => order.id)
      });

      // Update orders to "Pending Pickup" status
      await Promise.all(selectedOrders.map(order => 
        updateOrder.mutateAsync({
          id: order.id,
          updates: { status: 'Pending Pickup' }
        })
      ));

      toast.success('Pickup scheduled successfully!');
      navigate('/pickups');
    } catch (error) {
      console.error('Error creating pickup:', error);
      toast.error('Failed to schedule pickup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  const canSubmit = pickupDate && selectedLocation && selectedOrders.length > 0;

  const renderMobileOrderCards = () => {
    if (!newOrders) return null;
    const allOrderIds = newOrders.map(order => order.id);
    const allSelected = allOrderIds.length > 0 && allOrderIds.every(id => tempSelectedOrderIds.includes(id));

    return (
      <div className="space-y-4">
        {/* Select All Section */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={allSelected} 
              onCheckedChange={handleSelectAll} 
              className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]" 
            />
            <Label className="font-medium text-sm">Select All</Label>
          </div>
          <div className="text-sm font-medium text-[#DB271E]">
            Selected: {tempSelectedOrderIds.length} Order{tempSelectedOrderIds.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto px-1">
          {newOrders.map(order => (
            <div 
              key={order.id} 
              className={cn(
                "border rounded-lg p-4 transition-all duration-200 cursor-pointer",
                tempSelectedOrderIds.includes(order.id) 
                  ? "border-[#DB271E] bg-[#DB271E]/5" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              onClick={() => handleMobileOrderToggle(order.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={tempSelectedOrderIds.includes(order.id)} 
                    onCheckedChange={() => handleMobileOrderToggle(order.id)} 
                    className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]" 
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#DB271E] text-sm">
                        {order.order_id}
                      </span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-50 border-gray-200">
                        {order.type || 'Standard'}
                      </Badge>
                    </div>
                    {order.reference_number && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Hash className="h-3 w-3" />
                        <span>{order.reference_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {order.customer?.name || 'Unknown Customer'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-50 rounded-md flex items-center justify-center">
                    <Phone className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      {order.customer?.phone || 'No phone'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500">Amount:</span>
                    <span className="font-semibold text-sm text-gray-900">
                      ${order.cash_collection_usd || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {order.customer?.address || 'Unknown Area'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {tempSelectedOrderIds.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-1">
            <Button 
              onClick={handleMobileOrderConfirm} 
              className="w-full bg-[#DB271E] hover:bg-[#c0211a] text-white"
            >
              Select {tempSelectedOrderIds.length} Order{tempSelectedOrderIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/pickups')} 
            aria-label="Back" 
            className="text-[#DB271E] rounded-full font-thin"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Truck className="h-7 w-7 text-[#DB271E]" />
          <h1 className="text-2xl tracking-tight text-foreground md:text-xl font-bold">
            Schedule Pickup
          </h1>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Create a new pickup request for your orders
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Step 1: Select Orders */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Select Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog 
                  open={showOrderSelection} 
                  onOpenChange={(open) => {
                    setShowOrderSelection(open);
                    if (open) setTempSelectedOrderIds(selectedOrders.map(o => o.id));
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12">
                      <Package className="h-4 w-4 mr-2" />
                      Select Orders ({selectedOrders.length} selected)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={cn(
                    "overflow-hidden", 
                    isMobile ? "max-w-[95vw] max-h-[85vh] p-0" : "max-w-6xl max-h-[80vh]"
                  )}>
                    <DialogHeader className={isMobile ? "p-4 pb-2" : ""}>
                      <DialogTitle>Select Orders for Pickup</DialogTitle>
                    </DialogHeader>
                    <div className={cn("overflow-auto", isMobile ? "px-4 pb-4" : "max-h-[60vh]")}>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Package className="h-8 w-8 animate-pulse text-gray-400" />
                        </div>
                      ) : isMobile ? (
                        renderMobileOrderCards()
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
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {selectedOrders.map(order => (
                        <div 
                          key={order.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => removeOrder(order.id)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{order.referenceNumber}</p>
                            <p className="text-xs text-gray-600">{order.customer} • {order.amount}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeOrder(order.id);
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
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

            {/* Step 2: Date & Time */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5" />
                  Pickup Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Pickup Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
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

                <div className="space-y-4">
                  <Label>Pickup Time Window *</Label>
                  <div className="px-2">
                    <Slider
                      value={timeRange}
                      onValueChange={setTimeRange}
                      min={SLIDER_MIN}
                      max={SLIDER_MAX}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{formatTime(SLIDER_MIN)}</span>
                      <span>{formatTime(SLIDER_MAX)}</span>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {formatTime(timeRange[0])} - {formatTime(timeRange[1])}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Vehicle Type */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5" />
                  Vehicle Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {vehicleOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <div 
                        key={option.value}
                        className={cn(
                          "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                          vehicleType === option.value 
                            ? "border-[#DB271E] bg-[#DB271E]/5" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setVehicleType(option.value as 'small' | 'medium' | 'large')}
                      >
                        <IconComponent className="h-6 w-6" />
                        <div className="flex-1">
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2",
                          vehicleType === option.value 
                            ? "border-[#DB271E] bg-[#DB271E]" 
                            : "border-gray-300"
                        )} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Step 4: Notes */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Additional Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Any special instructions for the pickup..." 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="min-h-[80px]" 
                />
              </CardContent>
            </Card>

            {/* Pickup Location Selection */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {locations.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      <Label>Select Business Location *</Label>
                      <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a location..." />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <div className="flex items-center gap-2">
                                {location.name}
                                {location.isDefault && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedLocation && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-sm mb-2">{selectedLocation.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {selectedLocation.address}
                          {selectedLocation.area && `, ${selectedLocation.area}`}
                          {selectedLocation.governorate && `, ${selectedLocation.governorate}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Contact: {selectedLocation.contactPerson} • {selectedLocation.contactPhone}
                        </p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewLocationForm(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Location
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">No business locations found</p>
                    <Button 
                      onClick={() => setShowNewLocationForm(true)}
                      className="bg-[#DB271E] hover:bg-[#c0211a] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Location
                    </Button>
                  </div>
                )}

                {/* New Location Form */}
                {showNewLocationForm && (
                  <Card className="border-2 border-[#DB271E]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Add New Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location Name *</Label>
                          <Input 
                            value={newLocationForm.name}
                            onChange={(e) => setNewLocationForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Main Office"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Country *</Label>
                          <Select 
                            value={newLocationForm.country} 
                            onValueChange={(value) => setNewLocationForm(prev => ({ ...prev, country: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Lebanon">Lebanon</SelectItem>
                              <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <LocationAreaSelector
                            value={newLocationForm.governorate && newLocationForm.area 
                              ? `${newLocationForm.governorate} — ${newLocationForm.area}` 
                              : newLocationForm.governorate}
                            onChange={handleLocationAreaChange}
                            label="Location"
                            placeholder="Select governorate and area..."
                          />
                        </div>
                        
                        <div className="md:col-span-2 space-y-2">
                          <Label>Full Address</Label>
                          <Input 
                            value={newLocationForm.address}
                            onChange={(e) => setNewLocationForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Building, street, district"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Contact Person *</Label>
                          <Input 
                            value={newLocationForm.contactPerson}
                            onChange={(e) => setNewLocationForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                            placeholder="Full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Contact Phone *</Label>
                          <PhoneInput
                            value={newLocationForm.contactPhone}
                            onChange={(value) => setNewLocationForm(prev => ({ ...prev, contactPhone: value }))}
                            defaultCountry="LB"
                          />
                        </div>
                        
                        <div className="md:col-span-2 flex items-center gap-2">
                          <Checkbox
                            checked={newLocationForm.isDefault}
                            onCheckedChange={(checked) => setNewLocationForm(prev => ({ ...prev, isDefault: !!checked }))}
                          />
                          <Label>Set as default location</Label>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowNewLocationForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleNewLocationSubmit}
                          className="flex-1 bg-[#DB271E] hover:bg-[#c0211a] text-white"
                        >
                          Add Location
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="sticky top-6 border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Pickup Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedOrders.length} orders selected</span>
                  </div>
                  
                  {pickupDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{format(pickupDate, "MMM dd, yyyy")}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{formatTime(timeRange[0])} - {formatTime(timeRange[1])}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="capitalize">{vehicleType} vehicle</span>
                  </div>
                  
                  {selectedLocation && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{selectedLocation.name}</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={!canSubmit || isSubmitting} 
                  className="w-full bg-[#DB271E] hover:bg-[#c0211a] text-white h-12" 
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