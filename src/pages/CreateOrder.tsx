
import React, { useState } from 'react';
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
import PhoneInput from 'react-phone-number-input';
import { isPossiblePhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

// Lebanese governorates and areas
const lebanonAreas = [
  { 
    governorate: 'Beirut',
    areas: ['Achrafieh', 'Ain El Mraiseh', 'Bachoura', 'Marfaa', 'Mazraa', 'Medawar', 'Minet El Hosn', 'Mousaitbeh', 'Port', 'Rmeil', 'Saifi', 'Zuqaq al-Blat']
  },
  {
    governorate: 'Mount Lebanon',
    areas: ['Aley', 'Baabda', 'Byblos', 'Chouf', 'Keserwan', 'Matn']
  },
  {
    governorate: 'North Lebanon',
    areas: ['Batroun', 'Bcharreh', 'Koura', 'Miniyeh-Danniyeh', 'Tripoli', 'Zgharta']
  },
  {
    governorate: 'Akkar',
    areas: ['Akkar']
  },
  {
    governorate: 'Beqaa',
    areas: ['Rachaya', 'West Beqaa', 'Zahle']
  },
  {
    governorate: 'Baalbek-Hermel',
    areas: ['Baalbek', 'Hermel']
  },
  {
    governorate: 'South Lebanon',
    areas: ['Jezzine', 'Sidon', 'Tyre']
  },
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
  
  const handleCloseModal = () => {
    // In a real application, this would navigate back or close the modal
    console.log('Close modal');
  };

  const handleSubmit = (createAnother: boolean = false) => {
    console.log('Order submitted, create another:', createAnother);
    // In a real application, this would submit the form data to the backend
  };

  const validatePhone = (value: string, setError: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value) {
      setError('Phone number is required');
      return;
    }

    if (!isPossiblePhoneNumber(value)) {
      setError('Invalid phone number');
      return;
    }

    // Check for Lebanese numbers (8 digits after country code)
    if (value.startsWith('+961') && value.length !== 12) {
      setError('Lebanese numbers should be 8 digits after +961');
      return;
    }

    setError('');
  };

  const handlePhoneChange = (value: string | undefined) => {
    const cleanedValue = value?.replace(/\s/g, '') || '';
    setPhone(cleanedValue);
    if (cleanedValue) validatePhone(cleanedValue, setPhoneError);
  };

  const handleSecondaryPhoneChange = (value: string | undefined) => {
    const cleanedValue = value?.replace(/\s/g, '') || '';
    setSecondaryPhone(cleanedValue);
    if (cleanedValue) validatePhone(cleanedValue, setSecondaryPhoneError);
  };

  const handleSelectArea = (governorate: string, area: string) => {
    setSelectedGovernorate(governorate);
    setSelectedArea(area);
    setIsAreaDialogOpen(false);
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

  return <MainLayout className="p-0">
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
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="phone-input-container">
                    <PhoneInput
                      international
                      defaultCountry="LB"
                      value={phone}
                      onChange={handlePhoneChange}
                      inputComponent={Input}
                      className="w-full"
                    />
                    {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Enter customer name" />
                </div>
                
                {!isSecondaryPhone && <Button variant="ghost" size="sm" className="text-primary" onClick={() => setIsSecondaryPhone(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add a secondary phone
                  </Button>}

                {isSecondaryPhone && <div className="space-y-2">
                    <Label htmlFor="secondary-phone">Secondary phone</Label>
                    <PhoneInput
                      international
                      defaultCountry="LB"
                      value={secondaryPhone}
                      onChange={handleSecondaryPhoneChange}
                      inputComponent={Input}
                      className="w-full"
                    />
                    {secondaryPhoneError && <p className="text-xs text-destructive mt-1">{secondaryPhoneError}</p>}
                  </div>}
                
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-left font-normal"
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
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search areas..." 
                          className="pl-8" 
                          value={searchArea} 
                          onChange={(e) => setSearchArea(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        {filteredAreas.map((gov) => (
                          <div key={gov.governorate} className="space-y-1">
                            <h4 className="text-sm font-medium py-1">{gov.governorate}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {gov.areas.map((area) => (
                                <Button
                                  key={area}
                                  variant="ghost"
                                  className="justify-start h-auto py-1.5 px-2"
                                  onClick={() => handleSelectArea(gov.governorate, area)}
                                >
                                  {area}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address details</Label>
                  <Input id="address" placeholder="Enter full address" />
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
                    <label htmlFor="work-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                
                {!additionalInfo && <Button variant="ghost" size="sm" className="text-primary" onClick={() => setAdditionalInfo(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Additional info
                  </Button>}
                
                {additionalInfo && <div className="space-y-2">
                    <Label htmlFor="additional-info">Additional Information</Label>
                    <Textarea id="additional-info" placeholder="Enter any additional information" />
                  </div>}
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
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <Input id="description" placeholder="Product name - code - color - size" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="items-count">Number of items</Label>
                  <div className="flex items-center">
                    <Button variant="link" className="text-blue-600 text-sm p-0">
                      Packaging Guidelines
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input id="items-count" type="number" defaultValue={1} min={1} className="pr-8" />
                  <div className="absolute right-2 top-0 h-full flex flex-col justify-center">
                    <button className="text-gray-400 hover:text-gray-600">▲</button>
                    <button className="text-gray-400 hover:text-gray-600">▼</button>
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
                <h3 className="font-medium">Order Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={orderType === 'shipment' ? "default" : "outline"} 
                    onClick={() => setOrderType('shipment')}
                    className={orderType === 'shipment' ? "bg-primary text-primary-foreground" : ""}
                  >
                    Shipment
                  </Button>
                  <Button 
                    variant={orderType === 'exchange' ? "default" : "outline"} 
                    onClick={() => setOrderType('exchange')}
                    className={orderType === 'exchange' ? "bg-primary text-primary-foreground" : ""}
                  >
                    Exchange
                  </Button>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                {/* Cash Collection Section */}
                <Collapsible open={true}>
                  <div className="flex items-center space-x-2 mb-4">
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
                    />
                    <div className="space-y-1">
                      <label htmlFor="cash-collection" className="text-sm font-medium leading-none">
                        Cash collection
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Your customer shall pay this amount to courier upon delivery.
                      </p>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>USD Amount</Label>
                        <Input 
                          type="number" 
                          value={usdAmount} 
                          onChange={e => setUsdAmount(e.target.value)} 
                          placeholder="0.00" 
                          disabled={!cashCollection}
                          className={!cashCollection ? "opacity-50" : ""}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>LBP Amount</Label>
                        <Input 
                          type="number" 
                          value={lbpAmount} 
                          onChange={e => setLbpAmount(e.target.value)} 
                          placeholder="0" 
                          disabled={!cashCollection}
                          className={!cashCollection ? "opacity-50" : ""}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Genius Fees Estimate</span>
                          <span>
                            ${(parseFloat(usdAmount || '0') * 0.05).toFixed(2)} + 
                            {(parseFloat(lbpAmount || '0') * 0.05).toFixed(0)} LBP
                          </span>
                        </div>
                        <Button variant="link" className="text-blue-600 text-sm p-0">
                          Who will pay it?
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <div className="space-y-4 pt-4">
                  <div>
                    <div className="mb-1 text-sm font-medium">Return location</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Original business location</p>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select the location for your returned package.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allow-opening" />
                    <div className="flex items-center">
                      <label htmlFor="allow-opening" className="text-sm font-medium leading-none">
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
                  
                  <div>
                    <div className="mb-2 text-sm font-medium">Package type</div>
                    <div className="flex space-x-2">
                      <Button variant={packageType === "parcel" ? "default" : "outline"} className="flex-1" onClick={() => setPackageType("parcel")}>
                        Parcel
                      </Button>
                      <Button variant={packageType === "document" ? "default" : "outline"} className="flex-1" onClick={() => setPackageType("document")}>
                        Document
                      </Button>
                      <Button variant={packageType === "bulky" ? "default" : "outline"} className="flex-1" onClick={() => setPackageType("bulky")}>
                        Bulky
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="order-reference">Order reference</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Input id="order-reference" placeholder="For an easier search use a reference code." />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="delivery-notes">Delivery notes</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Textarea id="delivery-notes" placeholder="Please contact the customer before delivering the order." rows={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>;
};
export default CreateOrder;
