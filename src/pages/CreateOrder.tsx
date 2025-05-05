import React, { useState, useEffect } from 'react';
import { X, Info, Check, Plus, ChevronDown, Search, MapPin } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/phone-input';
import { CountryCode } from 'libphonenumber-js';

// Lebanese governorates and areas
const lebanonAreas = [
  {
    governorate: "Beirut",
    areas: [
      "Achrafieh", "Ain El Mreisseh", "Bachoura", "Badaro", "Corniche El Nahr",
      "Downtown Beirut", "Gemmayzeh", "Hamra", "Jnah", "Karantina", "Mar Elias",
      "Mazraa", "Mina El Hosn", "Mousseitbeh", "Ras Beirut", "Rmeil", "Saifi",
      "Sanayeh", "Zkak El Blat"
    ]
  },
  {
    governorate: "Mount Lebanon",
    areas: [
      "Aley", "Baabda", "Bikfaya", "Broummana", "Choueifat", "Dbayeh", "Jounieh",
      "Kfarchima", "Metn", "Zalka"
    ]
  },
  {
    governorate: "North Lebanon",
    areas: [
      "Amioun", "Batroun", "Bcharre", "Chekka", "Ehden", "Koura", "Tripoli", "Zgharta"
    ]
  },
  {
    governorate: "South Lebanon",
    areas: [
      "Jezzine", "Saida", "Sour"
    ]
  },
  {
    governorate: "Beqaa",
    areas: [
      "Baalbek", "Hermel", "Joub Jannine", "Zahle"
    ]
  },
  {
    governorate: "Nabatieh",
    areas: [
      "Hasbaya", "Marjayoun", "Nabatieh"
    ]
  }
];

const CreateOrder = () => {
  const [orderType, setOrderType] = useState<'shipment' | 'exchange'>('shipment');
  const [phone, setPhone] = useState<string>('+961');
  const [secondaryPhone, setSecondaryPhone] = useState<string>('');
  const [isSecondaryPhone, setIsSecondaryPhone] = useState<boolean>(false);
  const [isWorkAddress, setIsWorkAddress] = useState<boolean>(false);
  const [additionalInfo, setAdditionalInfo] = useState<boolean>(false);
  const [packageType, setPackageType] = useState<'parcel' | 'document' | 'bulky'>('parcel');
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState<boolean>(false);
  const [searchArea, setSearchArea] = useState<string>('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [cashCollection, setCashCollection] = useState<boolean>(true);
  const [usdAmount, setUsdAmount] = useState<string>('0.00');
  const [lbpAmount, setLbpAmount] = useState<string>('0');
  const [phoneError, setPhoneError] = useState<string>('');
  const [secondaryPhoneError, setSecondaryPhoneError] = useState<string>('');
  const [expandedGovernorate, setExpandedGovernorate] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [orderReference, setOrderReference] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [allowOpening, setAllowOpening] = useState<boolean>(false);

  const handleCloseModal = () => {
    // In a real application, this would navigate back or close the modal
    console.log('Close modal');
  };

  const handleSubmit = (createAnother: boolean = false) => {
    // Validate phone number
    if (!phone || phoneError) {
      toast.error("Please provide a valid phone number");
      return;
    }

    // Validate secondary phone if provided
    if (isSecondaryPhone && (!secondaryPhone || secondaryPhoneError)) {
      toast.error("Please provide a valid secondary phone number");
      return;
    }

    // Validate customer name
    if (!customerName.trim()) {
      toast.error("Please provide the customer name");
      return;
    }

    // Validate area
    if (!selectedArea) {
      toast.error("Please select an area");
      return;
    }

    // Validate address
    if (!address.trim()) {
      toast.error("Please provide an address");
      return;
    }

    console.log('Order submitted, create another:', createAnother);
    toast.success(createAnother ? "Order created! Creating another." : "Order created successfully!");
    
    // In a real application, this would submit the form data to the backend
    // and reset the form or navigate away depending on createAnother
    if (createAnother) {
      // Reset form for another order
      setPhone('+961');
      setSecondaryPhone('');
      setCustomerName('');
      setSelectedGovernorate('');
      setSelectedArea('');
      setAddress('');
      setDescription('');
      // Keep other settings like order type intact for convenience
    } else {
      // Navigate away or close modal in real application
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value || '+961'); // Ensure we always have a default value
    setPhoneError(''); // Clear error, validation happens in PhoneInput component
  };

  const handleSecondaryPhoneChange = (value: string) => {
    setSecondaryPhone(value || ''); // Handle possible undefined values
    setSecondaryPhoneError(''); // Clear error, validation happens in PhoneInput component
  };

  const handleSelectArea = (governorate: string, area: string) => {
    setSelectedGovernorate(governorate);
    setSelectedArea(area);
    setIsAreaDialogOpen(false);
  };

  const handleUsdAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers with up to 2 decimal places
    if (value === '' || (/^\d*\.?\d{0,2}$/).test(value) && Number(value) >= 0) {
      setUsdAmount(value);
    }
  };

  const handleLbpAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || (/^\d+$/).test(value) && Number(value) >= 0) {
      setLbpAmount(value);
    }
  };

  const toggleGovernorate = (governorate: string) => {
    if (expandedGovernorate === governorate) {
      setExpandedGovernorate(null);
    } else {
      setExpandedGovernorate(governorate);
    }
  };

  const filteredAreas = searchArea.length > 0 
    ? lebanonAreas.map(gov => ({
        governorate: gov.governorate,
        areas: gov.areas.filter(area => 
          area.toLowerCase().includes(searchArea.toLowerCase()) || 
          gov.governorate.toLowerCase().includes(searchArea.toLowerCase())
        )
      })).filter(gov => gov.areas.length > 0)
    : lebanonAreas;

  return (
    <MainLayout className="p-0">
      <div className="flex flex-col h-full">
        <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCloseModal}>
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Create New Order</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit(true)}>
              Confirm & Create Another
            </Button>
            <Button variant="default" onClick={() => handleSubmit(false)} className="bg-primary hover:bg-primary/90">
              <Check className="mr-1 h-4 w-4" />
              Confirm Order
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium">Phone number</Label>
                  <PhoneInput
                    id="phone"
                    defaultCountry="LB"
                    value={phone}
                    onChange={handlePhoneChange}
                    showLabel={false}
                    error={phoneError}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">Full name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter customer name" 
                    className="py-6" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                
                {!isSecondaryPhone && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary" 
                    onClick={() => setIsSecondaryPhone(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add a secondary phone
                  </Button>
                )}

                {isSecondaryPhone && (
                  <div className="space-y-2">
                    <Label htmlFor="secondary-phone" className="font-medium">Secondary phone</Label>
                    <PhoneInput
                      id="secondary-phone" 
                      defaultCountry="LB"
                      value={secondaryPhone}
                      onChange={handleSecondaryPhoneChange}
                      showLabel={false}
                      error={secondaryPhoneError}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="area" className="font-medium">Area</Label>
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-left font-normal py-6" 
                      onClick={() => setIsAreaDialogOpen(true)}
                    >
                      {selectedArea ? `${selectedArea}, ${selectedGovernorate}` : "Search with an area or a city"}
                      <MapPin className="h-4 w-4 opacity-50" />
                    </Button>
                  </div>
                </div>

                <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select an Area</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search areas..." 
                          className="pl-9" 
                          value={searchArea} 
                          onChange={e => setSearchArea(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-3">
                        {filteredAreas.map(gov => (
                          <div key={gov.governorate} className="space-y-2">
                            <Button 
                              variant="ghost"
                              className="w-full flex justify-between items-center py-3 px-3 bg-muted/30 rounded-md"
                              onClick={() => toggleGovernorate(gov.governorate)}
                            >
                              <span className="font-medium">{gov.governorate}</span>
                              <ChevronDown className={`h-4 w-4 transition-transform ${expandedGovernorate === gov.governorate ? 'rotate-180' : ''}`} />
                            </Button>
                            
                            {expandedGovernorate === gov.governorate && (
                              <div className="grid grid-cols-1 gap-1 pl-4 pt-1">
                                {gov.areas.map(area => (
                                  <Button 
                                    key={area} 
                                    variant="ghost" 
                                    className="justify-start h-auto py-2 px-3 hover:bg-primary/5 hover:text-primary text-sm" 
                                    onClick={() => handleSelectArea(gov.governorate, area)}
                                  >
                                    {area}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-medium">Address details</Label>
                  <Input 
                    id="address" 
                    placeholder="Enter full address" 
                    className="py-6" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="work-address" 
                    checked={isWorkAddress} 
                    onCheckedChange={checked => {
                      if (typeof checked === 'boolean') {
                        setIsWorkAddress(checked);
                      }
                    }} 
                  />
                  <div className="flex items-center">
                    <label 
                      htmlFor="work-address" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      This is a work address.
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark if this is a business or work address</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {!additionalInfo && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary" 
                    onClick={() => setAdditionalInfo(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add additional information
                  </Button>
                )}
                
                {additionalInfo && (
                  <div className="space-y-2">
                    <Label htmlFor="additional-info" className="font-medium">Additional Information</Label>
                    <Textarea id="additional-info" placeholder="Enter any additional information" className="min-h-[100px]" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Package Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Package</CardTitle>
                  <Button variant="link" className="text-blue-600 text-sm p-0">
                    Prohibited items
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Select from products</span>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    <div className="absolute w-3 h-3 bg-white rounded-full transition left-1 top-1"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="description" className="font-medium">Description</Label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <Input 
                    id="description" 
                    placeholder="Product name - code - color - size" 
                    className="py-6" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="items-count" className="font-medium">Number of items</Label>
                  <div className="flex items-center">
                    <Button variant="link" className="text-blue-600 text-sm p-0">
                      Packaging Guidelines
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input 
                    id="items-count" 
                    type="number" 
                    value={itemsCount} 
                    onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)} 
                    min={1} 
                    className="pr-8 py-6" 
                  />
                  <div className="absolute right-2 top-0 h-full flex flex-col justify-center">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setItemsCount(prev => Math.max(1, prev + 1))}
                    >
                      ▲
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setItemsCount(prev => Math.max(1, prev - 1))}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right sidebar with order type and payment */}
          <div className="w-96 border-l overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-6">
              {/* Order Type Selector */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Order Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={orderType === 'shipment' ? "default" : "outline"} 
                    onClick={() => setOrderType('shipment')} 
                    className={cn(
                      "py-6",
                      orderType === 'shipment' ? "bg-primary text-primary-foreground" : ""
                    )}
                  >
                    Shipment
                  </Button>
                  <Button 
                    variant={orderType === 'exchange' ? "default" : "outline"} 
                    onClick={() => setOrderType('exchange')} 
                    className={cn(
                      "py-6",
                      orderType === 'exchange' ? "bg-primary text-primary-foreground" : ""
                    )}
                  >
                    Exchange
                  </Button>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border shadow-sm">
                  <Checkbox 
                    id="cash-collection" 
                    checked={cashCollection} 
                    onCheckedChange={checked => {
                      if (typeof checked === 'boolean') {
                        setCashCollection(checked);
                        if (!checked) {
                          setUsdAmount('0.00');
                          setLbpAmount('0');
                        }
                      }
                    }}
                    className="h-5 w-5"
                  />
                  <div className="space-y-1">
                    <label 
                      htmlFor="cash-collection" 
                      className="text-base font-medium leading-none"
                    >
                      Cash collection
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Your customer shall pay this amount to courier upon delivery.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2 bg-white p-4 rounded-lg border shadow-sm">
                    <Label className="font-medium">USD Amount</Label>
                    <Input 
                      type="text" 
                      value={usdAmount} 
                      onChange={handleUsdAmountChange}
                      placeholder="0.00" 
                      disabled={!cashCollection} 
                      className={cn("py-6", !cashCollection ? "opacity-50 bg-gray-100" : "")} 
                    />
                  </div>
                  
                  <div className="space-y-2 bg-white p-4 rounded-lg border shadow-sm">
                    <Label className="font-medium">LBP Amount</Label>
                    <Input 
                      type="text" 
                      value={lbpAmount} 
                      onChange={handleLbpAmountChange}
                      placeholder="0" 
                      disabled={!cashCollection} 
                      className={cn("py-6", !cashCollection ? "opacity-50 bg-gray-100" : "")} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border shadow-sm">
                    <Checkbox 
                      id="allow-opening" 
                      checked={allowOpening}
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          setAllowOpening(checked);
                        }
                      }}
                      className="h-5 w-5" 
                    />
                    <div className="flex items-center">
                      <label 
                        htmlFor="allow-opening" 
                        className="text-base font-medium leading-none"
                      >
                        Allow customers to open packages.
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Allow customers to inspect the contents before accepting</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="mb-3 text-base font-medium">Package type</div>
                    <div className="flex space-x-2">
                      <Button 
                        variant={packageType === "parcel" ? "default" : "outline"} 
                        className="flex-1 py-6" 
                        onClick={() => setPackageType("parcel")}
                      >
                        Parcel
                      </Button>
                      <Button 
                        variant={packageType === "document" ? "default" : "outline"} 
                        className="flex-1 py-6" 
                        onClick={() => setPackageType("document")}
                      >
                        Document
                      </Button>
                      <Button 
                        variant={packageType === "bulky" ? "default" : "outline"} 
                        className="flex-1 py-6" 
                        onClick={() => setPackageType("bulky")}
                      >
                        Bulky
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between">
                      <Label htmlFor="order-reference" className="font-medium">Order reference</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Input 
                      id="order-reference" 
                      placeholder="For an easier search use a reference code." 
                      className="py-6"
                      value={orderReference}
                      onChange={(e) => setOrderReference(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between">
                      <Label htmlFor="delivery-notes" className="font-medium">Delivery notes</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Textarea 
                      id="delivery-notes" 
                      placeholder="Please contact the customer before delivering the order." 
                      rows={3} 
                      className="min-h-[100px]"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateOrder;
