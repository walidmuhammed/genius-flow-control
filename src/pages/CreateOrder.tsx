import React, { useState } from 'react';
import { X, Info, Check, Plus, ChevronDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import OrderTypeSelector from '@/components/dashboard/OrderTypeSelector';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const CreateOrder = () => {
  const [orderType, setOrderType] = useState<'deliver' | 'exchange' | 'return' | 'cash-collection'>('deliver');
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [amount, setAmount] = useState<string>('0.00');
  const [useGeniusCredits, setUseGeniusCredits] = useState<boolean>(false);
  const [isSecondaryPhone, setIsSecondaryPhone] = useState<boolean>(false);
  const [isWorkAddress, setIsWorkAddress] = useState<boolean>(false);
  const [additionalInfo, setAdditionalInfo] = useState<boolean>(false);
  const [packageType, setPackageType] = useState<'parcel' | 'document' | 'bulky'>('parcel');
  
  const handleCloseModal = () => {
    // In a real application, this would navigate back or close the modal
    console.log('Close modal');
  };

  const handleSubmit = (createAnother: boolean = false) => {
    console.log('Order submitted, create another:', createAnother);
    // In a real application, this would submit the form data to the backend
  };

  const handleCurrencySwitch = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    // In a real application, this might also convert the amount based on exchange rate
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
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(true)}
            >
              Confirm & Create Another
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleSubmit(false)}
              className="bg-primary hover:bg-primary/90"
            >
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" placeholder="Enter phone number" />
                    <div className="text-xs text-muted-foreground">0/11</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Enter customer name" />
                  </div>
                </div>
                
                {!isSecondaryPhone && (
                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setIsSecondaryPhone(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add a secondary phone
                  </Button>
                )}

                {isSecondaryPhone && (
                  <div className="space-y-2">
                    <Label htmlFor="secondary-phone">Secondary phone</Label>
                    <Input id="secondary-phone" placeholder="Enter secondary phone number" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address details</Label>
                  <Input id="address" placeholder="Enter full address" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input id="area" placeholder="Search with an area or a city" />
                </div>
                
                {!additionalInfo && (
                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setAdditionalInfo(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Additional info
                  </Button>
                )}
                
                {additionalInfo && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="work-address" 
                      checked={isWorkAddress}
                      onCheckedChange={(checked) => {
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
                    <input 
                      type="checkbox" 
                      className="sr-only"
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    <div className="absolute w-3 h-3 bg-white rounded-full transition left-1 top-1"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <Input 
                    id="description" 
                    placeholder="Product name - code - color - size" 
                  />
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
                  <Input 
                    id="items-count" 
                    type="number" 
                    defaultValue={1} 
                    min={1} 
                    className="pr-8"
                  />
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
              <OrderTypeSelector
                value={orderType}
                onChange={setOrderType}
              />
              
              <div className="space-y-4">
                {orderType === 'cash-collection' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cash-collection" 
                        defaultChecked 
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

                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <Tabs
                          defaultValue={currency}
                          value={currency}
                          onValueChange={(value) => handleCurrencySwitch(value as CurrencyType)}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10"
                        >
                          <TabsList className="h-6 p-0">
                            <TabsTrigger className="text-xs px-2 py-0 h-6" value="USD">USD</TabsTrigger>
                            <TabsTrigger className="text-xs px-2 py-0 h-6" value="LBP">LBP</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <Input 
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-24"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Genius Fees Estimate</span>
                        <span>{currency === 'USD' ? `$${(parseFloat(amount) * 0.05).toFixed(2)}` : `${(parseFloat(amount) * 0.05).toFixed(0)} LBP`}</span>
                      </div>
                      <Button variant="link" className="text-blue-600 text-sm p-0">
                        Who will pay it?
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="genius-credits" 
                        checked={useGeniusCredits}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            setUseGeniusCredits(checked);
                          }
                        }}
                      />
                      <div className="flex items-center">
                        <label htmlFor="genius-credits" className="text-sm font-medium leading-none">
                          I will pay with Genius Credits
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Use your Genius Credits balance to pay for delivery fees</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-4 pt-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Item Value</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Declare the value of the items in this shipment</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <Tabs
                          defaultValue={currency}
                          value={currency}
                          onValueChange={(value) => handleCurrencySwitch(value as CurrencyType)}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10"
                        >
                          <TabsList className="h-6 p-0">
                            <TabsTrigger className="text-xs px-2 py-0 h-6" value="USD">USD</TabsTrigger>
                            <TabsTrigger className="text-xs px-2 py-0 h-6" value="LBP">LBP</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          className="pl-24"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-1">
                      <Button variant="link" className="text-blue-600 text-sm p-0">
                        Terms & Conditions
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Proof of value</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Upload proof of the declared value</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    
                    <div className="border border-dashed rounded-lg p-6 text-center">
                      <Button variant="ghost">
                        Click to upload
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        or drag and drop<br />PNG, JPG, PDF (max. 5MB)
                      </p>
                    </div>
                  </div>
                  
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
                    <Input 
                      id="order-reference" 
                      placeholder="For an easier search use a reference code."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="delivery-notes">Delivery notes</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Textarea 
                      id="delivery-notes" 
                      placeholder="Please contact the customer before delivering the order."
                      rows={3}
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
