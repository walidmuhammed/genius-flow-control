import { OrderWithCustomer } from '@/services/orders';
import { formatTrackingNumber } from '@/utils/barcodeUtils';

export interface LabelData {
  // Identifiers
  orderId: string;
  trackingNumber: string;
  referenceNumber: string;
  
  // Order details
  orderType: 'Shipment' | 'Exchange';
  packageType: string;
  
  // Cash collection
  cashCollectionUSD: number;
  cashCollectionLBP: number;
  
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
    phone?: string;
    address?: string;
  };
  
  // Metadata
  createdDate: string;
}

/**
 * Transform order data into label format
 */
export const transformOrderToLabelData = async (order: OrderWithCustomer): Promise<LabelData> => {
  // Get merchant info from profiles (this would normally be fetched from API)
  // For now, using placeholder data - in real implementation, fetch from profiles table
  const merchant = {
    businessName: 'TopSpeed Delivery',
    phone: '+961 70 123 456',
    address: 'Beirut, Lebanon'
  };

  return {
    // Identifiers
    orderId: order.order_id.toString().padStart(3, '0'),
    trackingNumber: formatTrackingNumber(order.order_id),
    referenceNumber: order.reference_number || '—',
    
    // Order details
    orderType: order.type === 'Exchange' ? 'Exchange' : 'Shipment',
    packageType: order.package_type || 'Parcel',
    
    // Cash collection
    cashCollectionUSD: Number(order.cash_collection_usd) || 0,
    cashCollectionLBP: Number(order.cash_collection_lbp) || 0,
    
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
    
    // Metadata
    createdDate: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  };
};

/**
 * Transform multiple orders to label data
 */
export const transformOrdersToLabelData = async (orders: OrderWithCustomer[]): Promise<LabelData[]> => {
  return Promise.all(orders.map(transformOrderToLabelData));
};