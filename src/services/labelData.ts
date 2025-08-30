import { OrderWithCustomer } from '@/services/orders';
import { formatTrackingNumber } from '@/utils/barcodeUtils';
import { supabase } from '@/integrations/supabase/client';

export interface LabelData {
  // Identifiers
  orderId: string;
  trackingNumber: string;
  referenceNumber: string;
  
  // Order details
  orderType: 'Shipment' | 'Exchange' | 'Cash Collection' | 'Return';
  packageType: string;
  packageDescription?: string;
  itemsCount: number;
  
  // Financial information
  cashCollectionUSD: number;
  cashCollectionLBP: number;
  deliveryFeeUSD: number;
  deliveryFeeLBP: number;
  cashCollectionEnabled: boolean;
  
  // Customer info
  customer: {
    name: string;
    phone: string;
    secondaryPhone?: string;
    city: string;
    governorate: string;
    address: string;
    isWorkAddress: boolean;
  };
  
  // Delivery preferences
  allowOpening: boolean;
  deliveryNotes?: string;
  
  // Merchant info
  merchant: {
    businessName: string;
    fullName: string;
    phone: string;
    businessType: string;
    address: string;
    contactPerson: string;
    contactPhone: string;
  };
  
  // Company branding
  company: {
    name: string;
    logo?: string;
    website?: string;
    supportPhone?: string;
  };
  
  // Metadata
  createdDate: string;
  createdTime: string;
}

/**
 * Fetch merchant information from profiles
 */
const fetchMerchantInfo = async (clientId?: string) => {
  if (!clientId) {
    return {
      businessName: 'TopSpeed Client',
      fullName: 'Unknown',
      phone: '',
      businessType: 'Business',
      address: 'Lebanon',
      contactPerson: 'Contact Person',
      contactPhone: ''
    };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, business_name, business_type, phone')
      .eq('id', clientId)
      .single();

    if (error || !profile) {
      console.error('Error fetching merchant profile:', error);
      return {
        businessName: 'TopSpeed Client',
        fullName: 'Unknown',
        phone: '',
        businessType: 'Business',
        address: 'Lebanon',
        contactPerson: 'Contact Person',
        contactPhone: ''
      };
    }

    return {
      businessName: profile.business_name || profile.full_name || 'TopSpeed Client',
      fullName: profile.full_name || 'Unknown',
      phone: profile.phone || '',
      businessType: profile.business_type || 'Business',
      address: 'Lebanon', // Default address - can be enhanced with business locations
      contactPerson: profile.full_name || 'Contact Person',
      contactPhone: profile.phone || ''
    };
  } catch (error) {
    console.error('Error fetching merchant info:', error);
    return {
      businessName: 'TopSpeed Client',
      fullName: 'Unknown',
      phone: '',
      businessType: 'Business',
      address: 'Lebanon',
      contactPerson: 'Contact Person',
      contactPhone: ''
    };
  }
};

/**
 * Transform order data into label format
 */
export const transformOrderToLabelData = async (order: OrderWithCustomer): Promise<LabelData> => {
  // Fetch real merchant information
  const merchant = await fetchMerchantInfo(order.client_id);
  
  const now = new Date();

  return {
    // Identifiers
    orderId: order.order_id.toString().padStart(3, '0'),
    trackingNumber: formatTrackingNumber(order.order_id),
    referenceNumber: order.reference_number || '—',
    
    // Order details
    orderType: order.type as 'Shipment' | 'Exchange' | 'Cash Collection' | 'Return',
    packageType: order.package_type || 'Parcel',
    packageDescription: order.package_description,
    itemsCount: order.items_count || 1,
    
    // Financial information
    cashCollectionUSD: Number(order.cash_collection_usd) || 0,
    cashCollectionLBP: Number(order.cash_collection_lbp) || 0,
    deliveryFeeUSD: Number(order.delivery_fees_usd) || 0,
    deliveryFeeLBP: Number(order.delivery_fees_lbp) || 0,
    cashCollectionEnabled: order.cash_collection_enabled || false,
    
    // Customer info
    customer: {
      name: order.customer.name,
      phone: order.customer.phone,
      secondaryPhone: order.customer.secondary_phone,
      city: order.customer.city_name || '',
      governorate: order.customer.governorate_name || '',
      address: order.customer.address || '',
      isWorkAddress: order.customer.is_work_address || false,
    },
    
    // Delivery preferences
    allowOpening: order.allow_opening || false,
    deliveryNotes: order.note,
    
    // Merchant info
    merchant,
    
    // Company branding
    company: {
      name: 'TopSpeed',
      website: 'www.topspeed.delivery',
      supportPhone: '+961 70 123 456'
    },
    
    // Metadata
    createdDate: now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    createdTime: now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
};

/**
 * Transform multiple orders to label data
 */
export const transformOrdersToLabelData = async (orders: OrderWithCustomer[]): Promise<LabelData[]> => {
  return Promise.all(orders.map(transformOrderToLabelData));
};