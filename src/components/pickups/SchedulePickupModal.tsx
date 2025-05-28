import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, Car, Bike, Truck, MapPin, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getNewOrders, createPickup, addOrdersToPickup } from '@/services/pickups';
import { toast } from 'sonner';

interface SchedulePickupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const vehicleTypes = [
  { id: 'small', label: 'Small', icon: Bike, description: 'Motorcycle' },
  { id: 'medium', label: 'Medium', icon: Car, description: 'Car' },
  { id: 'large', label: 'Large', icon: Truck, description: 'Van' }
];

export function SchedulePickupModal({ open, onOpenChange, onSuccess }: SchedulePickupModalProps) {
  const [step, setStep] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [pickupData, setPickupData] = useState({
    address: '',
    contactPerson: '',
    contactPhone: '',
    date: undefined as Date | undefined,
    time: '',
    vehicleType: 'medium',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: newOrders = [], isLoading } = useQuery({
    queryKey: ['new-orders'],
    queryFn: getNewOrders,
    enabled: open
  });

  const handleOrderToggle = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSubmit = async () => {
    if (!pickupData.date || !pickupData.time || selectedOrders.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create pickup date string
      const pickupDateTime = new Date(pickupData.date);
      const [time, period] = pickupData.time.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      pickupDateTime.setHours(hour, parseInt(minutes || '0'), 0, 0);

      // Create the pickup
      const pickup = await createPickup({
        status: 'Scheduled',
        location: 'Client Location',
        address: pickupData.address,
        contact_person: pickupData.contactPerson,
        contact_phone: pickupData.contactPhone,
        pickup_date: pickupDateTime.toISOString(),
        vehicle_type: pickupData.vehicleType as 'small' | 'medium' | 'large',
        orders_count: selectedOrders.length,
        note: pickupData.note || undefined,
        requested: true,
        picked_up: false,
        validated: false,
        client_id: undefined
      });

      // Add orders to pickup
      await addOrdersToPickup(pickup.id, selectedOrders);

      toast.success('Pickup scheduled successfully!');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setStep(1);
      setSelectedOrders([]);
      setPickupData({
        address: '',
        contactPerson: '',
        contactPhone: '',
        date: undefined,
        time: '',
        vehicleType: 'medium',
        note: ''
      });
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      toast.error('Failed to schedule pickup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-[#DB271E]" />
        <h3 className="font-semibold">Select Orders for Pickup</h3>
        {selectedOrders.length > 0 && (
          <Badge variant="secondary">{selectedOrders.length} selected</Badge>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : newOrders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No new orders available for pickup</p>
          <Button variant="outline" className="mt-4" onClick={() => onOpenChange(false)}>
            Create Order First
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {newOrders.map((order: any) => (
            <Card key={order.id} className="cursor-pointer hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => handleOrderToggle(order.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">#{order.order_id.toString().padStart(3, '0')}</span>
                      <Badge variant="outline">{order.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-[#DB271E]" />
        <h3 className="font-semibold">Pickup Address</h3>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          placeholder="Enter your pickup address..."
          value={pickupData.address}
          onChange={(e) => setPickupData(prev => ({ ...prev, address: e.target.value }))}
          className="min-h-[80px]"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-[#DB271E]" />
        <h3 className="font-semibold">Contact Person</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person *</Label>
          <Input
            id="contactPerson"
            placeholder="Full name"
            value={pickupData.contactPerson}
            onChange={(e) => setPickupData(prev => ({ ...prev, contactPerson: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Phone Number *</Label>
          <Input
            id="contactPhone"
            placeholder="+961 XX XXX XXX"
            value={pickupData.contactPhone}
            onChange={(e) => setPickupData(prev => ({ ...prev, contactPhone: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-[#DB271E]" />
        <h3 className="font-semibold">Pickup Date & Time</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !pickupData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {pickupData.date ? format(pickupData.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={pickupData.date}
                onSelect={(date) => setPickupData(prev => ({ ...prev, date }))}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Time *</Label>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={pickupData.time === time ? "default" : "outline"}
                className={cn(
                  "text-xs",
                  pickupData.time === time && "bg-[#DB271E] hover:bg-[#DB271E]/90"
                )}
                onClick={() => setPickupData(prev => ({ ...prev, time }))}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Car className="h-5 w-5 text-[#DB271E]" />
        <h3 className="font-semibold">Vehicle Type</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicleTypes.map((vehicle) => {
          const Icon = vehicle.icon;
          return (
            <Card
              key={vehicle.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                pickupData.vehicleType === vehicle.id && "ring-2 ring-[#DB271E] bg-red-50"
              )}
              onClick={() => setPickupData(prev => ({ ...prev, vehicleType: vehicle.id }))}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <h4 className="font-medium">{vehicle.label}</h4>
                <p className="text-xs text-gray-500">{vehicle.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-[#DB271E]" />
        <h3 className="font-semibold">Additional Notes</h3>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="note">Notes (Optional)</Label>
        <Textarea
          id="note"
          placeholder="Anything our team should know?"
          value={pickupData.note}
          onChange={(e) => setPickupData(prev => ({ ...prev, note: e.target.value }))}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const canProceed = () => {
    switch (step) {
      case 1: return selectedOrders.length > 0;
      case 2: return pickupData.address.trim() !== '';
      case 3: return pickupData.contactPerson.trim() !== '' && pickupData.contactPhone.trim() !== '';
      case 4: return pickupData.date && pickupData.time;
      case 5: return pickupData.vehicleType;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Pickup - Step {step} of 6</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
          >
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>
          
          {step < 6 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-[#DB271E] hover:bg-[#DB271E]/90"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-[#DB271E] hover:bg-[#DB271E]/90"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Pickup'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
