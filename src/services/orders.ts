
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithLocation } from "./customers";

export type OrderStatus = 'New' | 'Pending Pickup' | 'In Progress' | 'Heading to Customer' | 'Heading to You' | 'Successful' | 'Unsuccessful' | 'Returned' | 'Paid';
export type OrderType = 'Deliver' | 'Exchange' | 'Cash Collection';
export type PackageType = 'parcel' | 'document' | 'bulky';

export interface Order {
  id: string;
  reference_number: string;
  type: OrderType;
  customer_id: string;
  package_type: PackageType;
  package_description?: string;
  items_count: number;
  allow_opening: boolean;
  cash_collection_enabled: boolean;
  cash_collection_usd: number;
  cash_collection_lbp: number;
  delivery_fees_usd: number;
  delivery_fees_lbp: number;
  note?: string; // This field stores delivery notes
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  order_reference?: string; // Added order reference field
}

export interface OrderWithCustomer extends Order {
  customer: CustomerWithLocation;
}

// Transforms raw data to match our interface
const transformOrderData = (order: any): OrderWithCustomer => {
  const customerData = order.customer as any;
  
  // Ensure type is correctly cast to one of the allowed types
  let orderType = order.type;
  if (orderType !== 'Deliver' && orderType !== 'Exchange' && orderType !== 'Cash Collection') {
    orderType = 'Deliver';
  }

  // Ensure package_type is correctly cast to one of the allowed types
  let packageType = order.package_type;
  if (packageType !== 'parcel' && packageType !== 'document' && packageType !== 'bulky') {
    packageType = 'parcel';
  }
  
  // Ensure status is correctly cast to one of the allowed types
  let statusType = order.status;
  if (statusType !== 'New' && 
      statusType !== 'Pending Pickup' && 
      statusType !== 'In Progress' && 
      statusType !== 'Heading to Customer' && 
      statusType !== 'Heading to You' && 
      statusType !== 'Successful' && 
      statusType !== 'Unsuccessful' && 
      statusType !== 'Returned' && 
      statusType !== 'Paid') {
    statusType = 'New';
  }
  
  return {
    ...order,
    type: orderType as OrderType,
    package_type: packageType as PackageType,
    status: statusType as OrderStatus,
    customer: {
      ...customerData,
      city_name: customerData.cities?.name,
      governorate_name: customerData.governorates?.name
    }
  };
};

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customer_id(
        *,
        cities:city_id(name),
        governorates:governorate_id(name)
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  
  // Transform the data to match our interface
  const transformedData: OrderWithCustomer[] = data.map(transformOrderData);
  
  return transformedData;
}

export async function getOrdersByStatus(status: OrderStatus) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customer_id(
        *,
        cities:city_id(name),
        governorates:governorate_id(name)
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching orders with status ${status}:`, error);
    throw error;
  }
  
  // Transform the data to match our interface
  const transformedData: OrderWithCustomer[] = data.map(order => {
    const customerData = order.customer as any;
    
    // Ensure type is correctly cast to one of the allowed types
    let orderType = order.type;
    if (orderType !== 'Deliver' && orderType !== 'Exchange' && orderType !== 'Cash Collection') {
      orderType = 'Deliver';
    }
    
    // Ensure package_type is correctly cast to one of the allowed types
    let packageType = order.package_type;
    if (packageType !== 'parcel' && packageType !== 'document' && packageType !== 'bulky') {
      packageType = 'parcel';
    }
    
    // Status is already filtered so it should match the OrderStatus type
    
    return {
      ...order,
      type: orderType as OrderType,
      package_type: packageType as PackageType,
      status: status, // This is already the correct type since we filtered by it
      customer: {
        ...customerData,
        city_name: customerData.cities?.name,
        governorate_name: customerData.governorates?.name
      }
    };
  });
  
  return transformedData;
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customer_id(
        *,
        cities:city_id(name),
        governorates:governorate_id(name)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching order with id ${id}:`, error);
    throw error;
  }
  
  const order = transformOrderData(data);
  
  return order;
}

export async function createOrder(order: Omit<Order, 'id' | 'reference_number' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data as Order;
}

export async function updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'reference_number' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating order with id ${id}:`, error);
    throw error;
  }
  
  return data as Order;
}

export async function getOrdersWithDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customer_id(
        *,
        cities:city_id(name),
        governorates:governorate_id(name)
      )
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders with date range:', error);
    throw error;
  }
  
  // Transform the data to match our interface
  const transformedData: OrderWithCustomer[] = data.map(transformOrderData);
  
  return transformedData;
}
