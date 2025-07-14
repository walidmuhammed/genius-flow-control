import React, { useState, useEffect, useRef } from 'react';
import { X, Info, Check, Plus, MapPin, Search, Phone, Package, FileText, ScrollText, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import { AreaSelector } from '@/components/orders/AreaSelector';
import { PackageGuidelinesModal } from '@/components/orders/PackageGuidelinesModal';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCity, useCitiesByGovernorate } from '@/hooks/use-cities';
import { useSearchCustomersByPhone, useCreateCustomer } from '@/hooks/use-customers';
import { useCreateOrder, useUpdateOrder, useOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerWithLocation } from '@/services/customers';
import { Order } from '@/services/orders';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import OrderTypeSelector from '@/components/dashboard/OrderTypeSelector';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Create a unique form key for forcing re-render
const getUniqueFormKey = () => `admin-order-form-${Date.now()}`;

const AdminCreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isMobile } = useScreenSize();
  
  // Check if we're in edit mode
  const urlParams = new URLSearchParams(location.search);
  const isEditMode = urlParams.get('edit') === 'true';
  const editOrderId = urlParams.get('id');
  
  // Fetch order data if in edit mode
  const { data: editOrder } = useOrder(editOrderId || undefined);
  
  const [formKey, setFormKey] = useState(getUniqueFormKey());
  const initialRenderRef = useRef(true);

  // Form state - same as client version
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [orderType, setOrderType] = useState<'shipment' | 'exchange'>('shipment');
  const [phone, setPhone] = useState<string>('+961');
  const [secondaryPhone, setSecondaryPhone] = useState<string>('');
  const [isSecondaryPhone, setIsSecondaryPhone] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [isWorkAddress, setIsWorkAddress] = useState<boolean>(false);
  const [packageType, setPackageType] = useState<'parcel' | 'document' | 'bulky'>('parcel');
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedGovernorateName, setSelectedGovernorateName] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [cashCollection, setCashCollection] = useState<boolean>(true);
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [lbpAmount, setLbpAmount] = useState<string>('');
  const [phoneValid, setPhoneValid] = useState<boolean>(false);
  const [secondaryPhoneValid, setSecondaryPhoneValid] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [orderReference, setOrderReference] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [allowOpening, setAllowOpening] = useState<boolean>(false);
  const [existingCustomer, setExistingCustomer] = useState<CustomerWithLocation | null>(null);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState<boolean>(false);

  // Delivery fees (calculated or fixed)
  const deliveryFees = {
    usd: 5,
    lbp: 150000
  };

  // Form validation
  const [errors, setErrors] = useState<{
    client?: string;
    phone?: string;
    secondaryPhone?: string;
    name?: string;
    area?: string;
    address?: string;
    usdAmount?: string;
    lbpAmount?: string;
  }>({});

  // Load order data for edit mode
  useEffect(() => {
    if (isEditMode && editOrder) {
      // Pre-fill form with existing order data
      setSelectedClient(editOrder.client_id || '');
      setOrderType(editOrder.type === 'Exchange' ? 'exchange' : 'shipment');
      setPackageType(editOrder.package_type as 'parcel' | 'document' | 'bulky');
      setDescription(editOrder.package_description || '');
      setItemsCount(editOrder.items_count || 1);
      setAllowOpening(editOrder.allow_opening || false);
      setCashCollection(editOrder.cash_collection_enabled || false);
      setUsdAmount(editOrder.cash_collection_usd?.toString() || '');
      setLbpAmount(editOrder.cash_collection_lbp?.toString() || '');
      setDeliveryNotes(editOrder.note || '');
      setOrderReference(editOrder.reference_number || '');

      // Load customer data
      if (editOrder.customer) {
        setPhone(editOrder.customer.phone);
        setName(editOrder.customer.name);
        setAddress(editOrder.customer.address || '');
        setIsWorkAddress(editOrder.customer.is_work_address || false);
        
        if (editOrder.customer.secondary_phone) {
          setSecondaryPhone(editOrder.customer.secondary_phone);
          setIsSecondaryPhone(true);
        }

        if (editOrder.customer.governorate_id && editOrder.customer.city_id) {
          setSelectedGovernorateId(editOrder.customer.governorate_id);
          setSelectedCityId(editOrder.customer.city_id);
          setSelectedGovernorateName(editOrder.customer.governorate_name || '');
          setSelectedCityName(editOrder.customer.city_name || '');
        }

        setExistingCustomer(editOrder.customer);
        setPhoneValid(true);
      }
    }
  }, [isEditMode, editOrder]);

  // TODO: Add client selection logic here
  // For now, using a placeholder client list
  const clients = [
    { id: '1', name: 'Client A', business_name: 'Business A' },
    { id: '2', name: 'Client B', business_name: 'Business B' },
  ];

  // Rest of the component logic would be identical to the client CreateOrder
  // but with client selection and admin-specific handling

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Order' : 'Create New Order'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update order details' : 'Fill in the details below to create a new order'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Selection - Only for admin */}
              <div className="space-y-2">
                <Label htmlFor="client">Select Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose client/store" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.business_name || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client && (
                  <p className="text-sm text-red-600">{errors.client}</p>
                )}
              </div>

              {/* Order Type */}
              <div className="space-y-2">
                <Label>Order Type *</Label>
                <OrderTypeSelector
                  value={orderType}
                  onChange={(value) => setOrderType(value as 'shipment' | 'exchange')}
                />
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <PhoneInput
                      value={phone}
                      onChange={(value) => setPhone(value || '')}
                      defaultCountry="LB"
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Package Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Package Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Package Type *</Label>
                    <Select value={packageType} onValueChange={(value: 'parcel' | 'document' | 'bulky') => setPackageType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parcel">Parcel</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="bulky">Bulky Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemsCount">Number of Items</Label>
                    <Input
                      id="itemsCount"
                      type="number"
                      min="1"
                      value={itemsCount}
                      onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Package Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the package contents"
                    rows={2}
                  />
                </div>
              </div>

              {/* Cash Collection */}
              {orderType === 'shipment' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cashCollection"
                      checked={cashCollection}
                      onCheckedChange={(checked) => setCashCollection(!!checked)}
                    />
                    <Label htmlFor="cashCollection">Cash Collection Required</Label>
                  </div>

                  {cashCollection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usdAmount">Amount (USD)</Label>
                        <Input
                          id="usdAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={usdAmount}
                          onChange={(e) => setUsdAmount(e.target.value)}
                          placeholder="0.00"
                        />
                        {errors.usdAmount && (
                          <p className="text-sm text-red-600">{errors.usdAmount}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lbpAmount">Amount (LBP)</Label>
                        <Input
                          id="lbpAmount"
                          type="number"
                          min="0"
                          value={lbpAmount}
                          onChange={(e) => setLbpAmount(e.target.value)}
                          placeholder="0"
                        />
                        {errors.lbpAmount && (
                          <p className="text-sm text-red-600">{errors.lbpAmount}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Options</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowOpening"
                    checked={allowOpening}
                    onCheckedChange={(checked) => setAllowOpening(!!checked)}
                  />
                  <Label htmlFor="allowOpening">Allow package opening for inspection</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                  <Textarea
                    id="deliveryNotes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Any special delivery instructions"
                    rows={2}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/admin/orders')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement save functionality
                    toast.success(isEditMode ? 'Order updated successfully!' : 'Order created successfully!');
                    navigate('/dashboard/admin/orders');
                  }}
                  disabled={!selectedClient || !phoneValid || !name || !address}
                >
                  {isEditMode ? 'Update Order' : 'Create Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateOrder;
