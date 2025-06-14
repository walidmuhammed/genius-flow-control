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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Package, MapPin, Calendar as CalendarIcon, Clock, Truck, User, FileText, Check, Car, Bike, Hash, Phone } from "lucide-react";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { useOrdersByStatus } from '@/hooks/use-orders';
import { useCreatePickup } from '@/hooks/use-pickups';
import { useUpdateOrder } from '@/hooks/use-orders';
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

  /** TIME WINDOW CONSTANTS */
  const SLIDER_MIN = 8; // 8 AM
  const SLIDER_MAX = 20; // 8 PM

  const [selectedOrders, setSelectedOrders] = useState<SelectedOrder[]>([]);
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [timeRange, setTimeRange] = useState<number[]>([SLIDER_MIN + 1, SLIDER_MAX]); // default 9am to 8pm
  const [vehicleType, setVehicleType] = useState<'small' | 'medium' | 'large'>('small');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempSelectedOrderIds, setTempSelectedOrderIds] = useState<string[]>([]);
  const [todayWindowUnavailable, setTodayWindowUnavailable] = useState(false);

  // Time logic - memoize the next available hour for "today"
  const now = new Date();
  const isSelectedToday = useMemo(() =>
    pickupDate &&
    now.getFullYear() === pickupDate.getFullYear() &&
    now.getMonth() === pickupDate.getMonth() &&
    now.getDate() === pickupDate.getDate()
  , [pickupDate, now]);

  // Compute the earliest available hour for today (rounded up to next whole hour)
  const nextAvailableHour = useMemo(() => {
    if (!isSelectedToday) return SLIDER_MIN;
    const currHour = now.getHours();
    const currMin = now.getMinutes();
    // Next slot is currHour + 1, but never before SLIDER_MIN or after SLIDER_MAX
    let hour = currHour + (currMin > 0 ? 1 : 0) + 1; // force the next hour (no partials)
    if (hour < SLIDER_MIN) hour = SLIDER_MIN;
    if (hour > SLIDER_MAX) hour = SLIDER_MAX + 1; // triggers blocking today if > 20
    return hour;
  }, [isSelectedToday, now]);

  // When selecting pickup date:
  useEffect(() => {
    if (!pickupDate) return;
    if (isSelectedToday) {
      if (nextAvailableHour > SLIDER_MAX) {
        // After 8 PM, today is unavailable
        setTodayWindowUnavailable(true);
        // Auto-select tomorrow and reset timeRange
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        setPickupDate(tomorrow);
        setTimeRange([SLIDER_MIN + 1, SLIDER_MAX]);
      } else {
        setTodayWindowUnavailable(false);
        // Clamp timeRange if needed
        setTimeRange(prev => [
          Math.max(prev[0], nextAvailableHour),
          Math.max(Math.max(prev[1], nextAvailableHour), Math.max(prev[0], nextAvailableHour))
        ]);
      }
    } else {
      setTodayWindowUnavailable(false);
      setTimeRange(prev => [
        Math.max(prev[0], SLIDER_MIN),
        Math.min(prev[1], SLIDER_MAX)
      ]);
    }
    // eslint-disable-next-line
  }, [pickupDate, isSelectedToday, nextAvailableHour]);

  // Helper to determine if a slider thumb value is valid for current day
  const isValueDisabled = (val: number) => {
    if (isSelectedToday && val < nextAvailableHour) return true;
    return val < SLIDER_MIN || val > SLIDER_MAX;
  };

  /** SLIDER MARKS **/
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

  const {
    data: newOrders,
    isLoading
  } = useOrdersByStatus('New');
  const createPickup = useCreatePickup();
  const updateOrder = useUpdateOrder();
  const vehicleOptions = [{
    value: 'small',
    label: 'Small',
    icon: Bike,
    description: 'Motorcycle'
  }, {
    value: 'medium',
    label: 'Medium',
    icon: Car,
    description: 'Car'
  }, {
    value: 'large',
    label: 'Large',
    icon: Truck,
    description: 'Van'
  }];
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
    setTempSelectedOrderIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };
  const handleSelectAll = () => {
    if (!newOrders) return;
    const allOrderIds = newOrders.map(order => order.id);
    const allSelected = allOrderIds.length > 0 && allOrderIds.every(id => tempSelectedOrderIds.includes(id));
    if (allSelected) {
      setTempSelectedOrderIds([]);
    } else {
      setTempSelectedOrderIds(allOrderIds);
    }
  };
  const handleMobileOrderConfirm = () => {
    handleOrderSelection(tempSelectedOrderIds);
  };
  const removeOrder = (orderId: string) => {
    setSelectedOrders(prev => prev.filter(order => order.id !== orderId));
  };
  const handleSubmit = async () => {
    if (!pickupDate || !contactPerson || !contactPhone || !location || !address || selectedOrders.length === 0) {
      toast.error('Please fill in all required fields and select at least one order');
      return;
    }
    setIsSubmitting(true);
    try {
      const pickupDateTime = new Date(pickupDate);
      pickupDateTime.setHours(timeRange[0], 0, 0, 0);
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
      await Promise.all(selectedOrders.map(order => updateOrder.mutateAsync({
        id: order.id,
        updates: {
          status: 'Pending Pickup'
        }
      })));
      toast.success('Pickup scheduled successfully!');
      navigate('/pickups');
    } catch (error) {
      console.error('Error creating pickup:', error);
      toast.error('Failed to schedule pickup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const canSubmit = pickupDate && contactPerson && contactPhone && location && address && selectedOrders.length > 0;
  const renderMobileOrderCards = () => {
    if (!newOrders) return null;
    const allOrderIds = newOrders.map(order => order.id);
    const allSelected = allOrderIds.length > 0 && allOrderIds.every(id => tempSelectedOrderIds.includes(id));
    return <div className="space-y-4">
        {/* Select All Section */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]" />
            <Label className="font-medium text-sm">Select All</Label>
          </div>
          <div className="text-sm font-medium text-[#DB271E]">
            Selected: {tempSelectedOrderIds.length} Order{tempSelectedOrderIds.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto px-1">
          {newOrders.map(order => <div key={order.id} className={cn("border rounded-lg p-4 transition-all duration-200 cursor-pointer", tempSelectedOrderIds.includes(order.id) ? "border-[#DB271E] bg-[#DB271E]/5" : "border-gray-200 bg-white hover:border-gray-300")} onClick={() => handleMobileOrderToggle(order.id)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox checked={tempSelectedOrderIds.includes(order.id)} onCheckedChange={() => handleMobileOrderToggle(order.id)} className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#DB271E] text-sm">
                        {order.order_id}
                      </span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-50 border-gray-200">
                        {order.shipment_type || 'Standard'}
                      </Badge>
                    </div>
                    {order.reference_number && <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Hash className="h-3 w-3" />
                        <span>{order.reference_number}</span>
                      </div>}
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
                      {order.customer?.city_name || order.customer?.governorate_name || 'Unknown Area'}
                    </span>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
        
        {tempSelectedOrderIds.length > 0 && <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-1">
            <Button onClick={handleMobileOrderConfirm} className="w-full bg-[#DB271E] hover:bg-[#c0211a] text-white">
              Select {tempSelectedOrderIds.length} Order{tempSelectedOrderIds.length !== 1 ? 's' : ''}
            </Button>
          </div>}
      </div>;
  };
  return (
    <MainLayout>
      {/* Simple modern header as per user screenshot */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pickups')}
            className="text-[#DB271E] rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Truck className="h-7 w-7 text-[#DB271E]" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Schedule Pickup
          </h1>
        </div>
        <p className="text-muted-foreground text-lg mt-3 ml-14">
          Create a new pickup request for your orders
        </p>
      </div>
      {/* Main page content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Step 1: Select Orders */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Select Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={showOrderSelection} onOpenChange={open => {
              setShowOrderSelection(open);
              if (open) setTempSelectedOrderIds(selectedOrders.map(o => o.id));
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-12">
                  <Package className="h-4 w-4 mr-2" />
                  Select Orders ({selectedOrders.length} selected)
                </Button>
              </DialogTrigger>
              <DialogContent className={cn("overflow-hidden", isMobile ? "max-w-[95vw] max-h-[85vh] p-0" : "max-w-6xl max-h-[80vh]")}>
                <DialogHeader className={isMobile ? "p-4 pb-2" : ""}>
                  <DialogTitle>Select Orders for Pickup</DialogTitle>
                </DialogHeader>
                <div className={cn("overflow-auto", isMobile ? "px-4 pb-4" : "max-h-[60vh]")}>
                  {isLoading
                    ? (
                        <div className="flex items-center justify-center h-32">
                          <Package className="h-8 w-8 animate-pulse text-gray-400" />
                        </div>
                      )
                    : isMobile
                        ? renderMobileOrderCards()
                        : <OrdersTable orders={newOrders || []} onOrderSelection={handleOrderSelection} selectionMode={true} selectedOrderIds={selectedOrders.map(o => o.id)} />
                  }
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
                        onClick={e => {
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
                    className={cn("w-full justify-start text-left font-normal h-12", !pickupDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={date => setPickupDate(date)}
                    disabled={date => {
                      const isToday =
                        date &&
                        date.getFullYear() === now.getFullYear() &&
                        date.getMonth() === now.getMonth() &&
                        date.getDate() === now.getDate();
                      if (isToday && now.getHours() >= SLIDER_MAX) return true;
                      return (
                        date < new Date(now.getFullYear(), now.getMonth(), now.getDate())
                      );
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {todayWindowUnavailable && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 flex items-center gap-2 text-yellow-700 text-sm">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>
                  Today’s window has passed. Please select a future date.
                </span>
              </div>
            )}
            <div className="space-y-4">
              <Label>Pickup Time Window *</Label>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                {/* Time range display */}
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{formatTime(timeRange[0])}</span>
                  <span>to</span>
                  <span>{formatTime(timeRange[1])}</span>
                </div>
                {/* Slider */}
                <div className="flex flex-col gap-2">
                  <Slider
                    value={timeRange}
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    step={1}
                    onValueChange={vals => {
                      let [from, to] = vals;
                      if (isSelectedToday) {
                        if (from < nextAvailableHour) from = nextAvailableHour;
                        if (to < nextAvailableHour) to = nextAvailableHour;
                      }
                      if (from > to) from = to;
                      setTimeRange([from, to]);
                    }}
                    className="w-full"
                  />
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vehicleOptions.map(option => {
                const IconComponent = option.icon;
                return <Button key={option.value} variant={vehicleType === option.value ? "default" : "outline"} className={cn("h-20 p-4 flex flex-col items-center gap-2 border-2 transition-all", vehicleType === option.value ? "bg-[#DB271E] hover:bg-[#c0211a] text-white border-[#DB271E]" : "hover:border-gray-300")} onClick={() => setVehicleType(option.value as any)}>
                  <IconComponent className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs opacity-70">{option.description}</p>
                  </div>
                </Button>;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Notes */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Additional Notes (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Any special instructions for the pickup..." value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px]" />
          </CardContent>
        </Card>
      </div>
      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Pickup Details */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Pickup Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Business/Store Name *</Label>
              <Input id="location" placeholder="Enter your business name" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea id="address" placeholder="Enter complete pickup address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Name *</Label>
              <Input id="contactPerson" placeholder="Contact person name" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number *</Label>
              <Input id="contactPhone" placeholder="+961 XX XXX XXX" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
            </div>
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
              
              {pickupDate && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>{format(pickupDate, "MMM dd, yyyy")}</span>
                </div>}
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{formatTime(timeRange[0])} - {formatTime(timeRange[1])}</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="capitalize">{vehicleType} vehicle</span>
              </div>
              
              {location && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{location}</span>
                </div>}
            </div>

            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="w-full bg-[#DB271E] hover:bg-[#c0211a] text-white h-12" size="lg">
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Scheduling...' : 'Confirm Pickup'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SchedulePickup;
