
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithLocation } from "./customers";

export interface Order {
  id: string;
  reference_number: string;
  type: 'Deliver' | 'Exchange' | 'Cash Collection';
  customer_id: string;
  package_type: 'parcel' | 'document' | 'bulky';
  package_description?: string;
  items_count: number;
  allow_opening: boolean;
  cash_collection_enabled: boolean;
  cash_collection_usd: number;
  cash_collection_lbp: number;
  delivery_fees_usd: number;
  delivery_fees_lbp: number;
  note?: string;
  status: 'New' | 'Pending Pickup' | 'In Progress' | 'Heading to Customer' | 'Heading to You' | 'Successful' | 'Unsuccessful' | 'Returned' | 'Paid';
  created_at: string;
  updated_at: string;
}

export interface OrderWithCustomer extends Order {
  customer: CustomerWithLocation;
}

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
  const transformedData: OrderWithCustomer[] = data.map(order => {
    const customerData = order.customer as any;
    
    // Ensure type is correctly cast to one of the allowed types
    let orderType = order.type;
    if (orderType !== 'Deliver' && orderType !== 'Exchange' && orderType !== 'Cash Collection') {
      orderType = 'Deliver';
    }
    
    return {
      ...order,
      type: orderType as 'Deliver' | 'Exchange' | 'Cash Collection',
      customer: {
        ...customerData,
        city_name: customerData.cities?.name,
        governorate_name: customerData.governorates?.name
      }
    };
  });
  
  return transformedData;
}

export async function getOrdersByStatus(status: Order['status']) {
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
    
    return {
      ...order,
      type: orderType as 'Deliver' | 'Exchange' | 'Cash Collection',
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
  
  const customerData = data.customer as any;
  
  // Ensure type is correctly cast to one of the allowed types
  let orderType = data.type;
  if (orderType !== 'Deliver' && orderType !== 'Exchange' && orderType !== 'Cash Collection') {
    orderType = 'Deliver';
  }
  
  const order: OrderWithCustomer = {
    ...data,
    type: orderType as 'Deliver' | 'Exchange' | 'Cash Collection',
    customer: {
      ...customerData,
      city_name: customerData.cities?.name,
      governorate_name: customerData.governorates?.name
    }
  };
  
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
  const transformedData: OrderWithCustomer[] = data.map(order => {
    const customerData = order.customer as any;
    
    // Ensure type is correctly cast to one of the allowed types
    let orderType = order.type;
    if (orderType !== 'Deliver' && orderType !== 'Exchange' && orderType !== 'Cash Collection') {
      orderType = 'Deliver';
    }
    
    return {
      ...order,
      type: orderType as 'Deliver' | 'Exchange' | 'Cash Collection',
      customer: {
        ...customerData,
        city_name: customerData.cities?.name,
        governorate_name: customerData.governorates?.name
      }
    };
  });
  
  return transformedData;
}
