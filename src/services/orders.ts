import { supabase } from "@/integrations/supabase/client";
import { CustomerWithLocation } from "./customers";

export type OrderStatus = 'New' | 'Pending Pickup' | 'In Progress' | 'Heading to Customer' | 'Heading to You' | 'Successful' | 'Unsuccessful' | 'Returned' | 'Paid';
export type OrderType = 'Deliver' | 'Exchange' | 'Cash Collection';
export type PackageType = 'parcel' | 'document' | 'bulky';

export interface Order {
  id: string;
  order_id: number;
  reference_number: string;
  type: OrderType;
  customer_id: string;
  client_id?: string;
  package_type: PackageType;
  package_description?: string;
  items_count: number;
  allow_opening: boolean;
  cash_collection_enabled: boolean;
  cash_collection_usd: number;
  cash_collection_lbp: number;
  delivery_fees_usd: number;
  delivery_fees_lbp: number;
  note?: string;
  status: OrderStatus;
  courier_name?: string;
  created_at: string;
  updated_at: string;
  order_reference?: string;
  archived?: boolean;
  edited?: boolean;
  edit_history?: any[];
}

export interface OrderWithCustomer extends Order {
  customer: CustomerWithLocation;
}

// Check if user is authenticated and get their ID
const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

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

  // Handle edit_history field - ensure it's always an array
  let editHistory: any[] = [];
  if (order.edit_history) {
    if (Array.isArray(order.edit_history)) {
      editHistory = order.edit_history;
    } else if (typeof order.edit_history === 'string') {
      try {
        const parsed = JSON.parse(order.edit_history);
        editHistory = Array.isArray(parsed) ? parsed : [];
      } catch {
        editHistory = [];
      }
    }
  }
  
  return {
    ...order,
    order_id: order.order_id,
    type: orderType as OrderType,
    package_type: packageType as PackageType,
    status: statusType as OrderStatus,
    edit_history: editHistory,
    customer: {
      ...customerData,
      city_name: customerData.cities?.name,
      governorate_name: customerData.governorates?.name
    }
  };
};

export async function getOrders() {
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

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
    .eq('archived', false)
    .order('order_id', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  
  const transformedData: OrderWithCustomer[] = data.map(transformOrderData);
  return transformedData;
}

export async function getOrdersByStatus(status: OrderStatus) {
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

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
    .order('order_id', { ascending: false });
  
  if (error) {
    console.error(`Error fetching orders with status ${status}:`, error);
    throw error;
  }
  
  const transformedData: OrderWithCustomer[] = data.map(transformOrderData);
  return transformedData;
}

export async function getOrderById(id: string) {
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

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

export async function createOrder(order: Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'>) {
  // Check authentication and get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Add client_id to the order for proper RLS
  const orderWithClientId = {
    ...order,
    client_id: user.id
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([orderWithClientId])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data as Order;
}

export async function updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'>>) {
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

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

export async function archiveOrder(id: string) {
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ archived: true })
    .eq('id', id)
    .eq('status', 'New') // Only allow archiving NEW orders
    .select()
    .single();
  
  if (error) {
    console.error(`Error archiving order with id ${id}:`, error);
    throw error;
  }
  
  return data as Order;
}

export async function updateOrderWithHistory(
  id: string, 
  updates: Partial<Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'>>,
  changeHistory: any[]
) {
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      ...updates,
      edited: true,
      edit_history: changeHistory
    })
    .eq('id', id)
    .eq('status', 'New') // Only allow editing NEW orders
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating order with id ${id}:`, error);
    throw error;
  }
  
  return data as Order;
}

export async function getOrdersWithDateRange(startDate: string, endDate: string) {
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

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
    .order('order_id', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders with date range:', error);
    throw error;
  }
  
  const transformedData: OrderWithCustomer[] = data.map(transformOrderData);
  return transformedData;
}
