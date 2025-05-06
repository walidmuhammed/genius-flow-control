
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
import { PhoneInput } from '@/components/ui/phone-input';
import AreaSelector from '@/components/orders/AreaSelector';
import CashCollectionFields from '@/components/orders/CashCollectionFields';

const CreateOrder = () => {
  const [orderType, setOrderType] = useState<'shipment' | 'exchange'>('shipment');
  const [phone, setPhone] = useState<string>('+961');
  const [secondaryPhone, setSecondaryPhone] = useState<string>('');
  const [isSecondaryPhone, setIsSecondaryPhone] = useState<boolean>(false);
  const [isWorkAddress, setIsWorkAddress] = useState<boolean>(false);
  const [additionalInfo, setAdditionalInfo] = useState<boolean>(false);
  const [packageType, setPackageType] = useState<'parcel' | 'document' | 'bulky'>('parcel');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [cashCollection, setCashCollection] = useState<boolean>(true);
  const [usdAmount, setUsdAmount] = useState<string>('0.00');
  const [lbpAmount, setLbpAmount] = useState<string>('0');
  const [phoneValid, setPhoneValid] = useState<boolean>(false);
  const [secondaryPhoneValid, setSecondaryPhoneValid] = useState<boolean>(false);
  
  // Delivery fees (calculated or fixed)
  const deliveryFees = {
    usd: 5,
    lbp: 150000
  };
  
  const handleCloseModal = () => {
    // In a real application, this would navigate back or close the modal
    console.log('Close modal');
  };
  
  const handleSubmit = (createAnother: boolean = false) => {
    console.log('Order submitted, create another:', createAnother);
    // In a real application, this would submit the form data to the backend
  };
  
  const handleSelectArea = (governorate: string, area: string) => {
    setSelectedGovernorate(governorate);
    setSelectedArea(area);
  };
  
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
                  <Label htmlFor="phone">Phone number</Label>
                  <PhoneInput 
                    id="phone" 
                    value={phone} 
                    onChange={setPhone} 
                    defaultCountry="LB" 
                    onValidationChange={setPhoneValid} 
                    placeholder="Enter phone number" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Enter customer name" />
                </div>
                
                {!isSecondaryPhone && (
                  <div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="text-sm flex items-center gap-1" 
                      onClick={() => setIsSecondaryPhone(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add secondary phone number
                    </Button>
                  </div>
                )}

                {isSecondaryPhone && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="secondary-phone">Secondary phone</Label>
                      <Button 
                        variant="link" 
                        className="text-xs text-muted-foreground h-auto p-0" 
                        onClick={() => setIsSecondaryPhone(false)}
                      >
                        Remove
                      </Button>
                    </div>
                    <PhoneInput 
                      id="secondary-phone" 
                      value={secondaryPhone} 
                      onChange={setSecondaryPhone} 
                      defaultCountry="LB" 
                      onValidationChange={setSecondaryPhoneValid} 
                      placeholder="Enter secondary phone" 
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <AreaSelector
                    selectedArea={selectedArea}
                    selectedGovernorate={selectedGovernorate}
                    onAreaSelected={handleSelectArea}
                  />
                </div>
                
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
                <CashCollectionFields
                  enabled={cashCollection}
                  onEnabledChange={setCashCollection}
                  usdAmount={usdAmount}
                  lbpAmount={lbpAmount}
                  onUsdAmountChange={setUsdAmount}
                  onLbpAmountChange={setLbpAmount}
                  deliveryFees={deliveryFees}
                />
                
                <div className="space-y-4 pt-4">
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
                      <Button 
                        variant={packageType === "parcel" ? "default" : "outline"} 
                        className="flex-1" 
                        onClick={() => setPackageType("parcel")}
                      >
                        Parcel
                      </Button>
                      <Button 
                        variant={packageType === "document" ? "default" : "outline"} 
                        className="flex-1" 
                        onClick={() => setPackageType("document")}
                      >
                        Document
                      </Button>
                      <Button 
                        variant={packageType === "bulky" ? "default" : "outline"} 
                        className="flex-1" 
                        onClick={() => setPackageType("bulky")}
                      >
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
    </MainLayout>
  );
};

export default CreateOrder;
