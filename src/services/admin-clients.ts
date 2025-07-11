import { supabase } from "@/integrations/supabase/client";

export interface AdminClientData {
  id: string;
  business_name: string | null;
  business_type: string | null;
  full_name: string | null;
  phone: string | null;
  user_type: string;
  created_at: string;
  updated_at: string;
  email?: string;
  total_orders?: number;
  total_invoices?: number;
  total_order_value_usd?: number;
  total_order_value_lbp?: number;
  last_order_date?: string;
  status: 'active' | 'suspended' | 'pending';
}

export interface AdminClientKPIs {
  totalClients: number;
  clientsWithActiveOrders: number;
  totalOrderValueUSD: number;
  totalOrderValueLBP: number;
  pendingInvoices: number;
  lowActivityClients: number;
}

export async function getAdminClientKPIs(): Promise<AdminClientKPIs> {
  // Get total clients (only client users, not admins)
  const { data: clients } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_type', 'client');

  const totalClients = clients?.length || 0;

  // Get clients with active orders (orders in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: activeOrderClients } = await supabase
    .from('orders')
    .select('client_id')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .not('client_id', 'is', null);

  const uniqueActiveClients = new Set(activeOrderClients?.map(o => o.client_id)).size;

  // Get total order values
  const { data: orderTotals } = await supabase
    .from('orders')
    .select('cash_collection_usd, cash_collection_lbp, delivery_fees_usd, delivery_fees_lbp')
    .not('client_id', 'is', null);

  let totalOrderValueUSD = 0;
  let totalOrderValueLBP = 0;

  orderTotals?.forEach(order => {
    totalOrderValueUSD += (order.cash_collection_usd || 0) + (order.delivery_fees_usd || 0);
    totalOrderValueLBP += (order.cash_collection_lbp || 0) + (order.delivery_fees_lbp || 0);
  });

  // Get pending invoices count
  const { data: pendingInvoicesData } = await supabase
    .from('invoices')
    .select('id')
    .eq('net_payout_usd', 0)
    .eq('net_payout_lbp', 0);

  const pendingInvoices = pendingInvoicesData?.length || 0;

  // Get low activity clients (less than 3 orders in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('client_id')
    .gte('created_at', sevenDaysAgo.toISOString())
    .not('client_id', 'is', null);

  const clientOrderCounts = new Map<string, number>();
  recentOrders?.forEach(order => {
    const count = clientOrderCounts.get(order.client_id!) || 0;
    clientOrderCounts.set(order.client_id!, count + 1);
  });

  const lowActivityClients = totalClients - Array.from(clientOrderCounts.values()).filter(count => count >= 3).length;

  return {
    totalClients,
    clientsWithActiveOrders: uniqueActiveClients,
    totalOrderValueUSD,
    totalOrderValueLBP,
    pendingInvoices,
    lowActivityClients
  };
}

export async function getAdminClients(): Promise<AdminClientData[]> {
  // Get all client profiles directly
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_type', 'client')
    .order('created_at', { ascending: false });

  if (!profiles) {
    return [];
  }

  // Get order counts and values for each client
  const { data: orderStats } = await supabase
    .from('orders')
    .select(`
      client_id,
      cash_collection_usd,
      cash_collection_lbp,
      delivery_fees_usd,
      delivery_fees_lbp,
      created_at
    `)
    .not('client_id', 'is', null);

  // Get invoice counts for each client
  const { data: invoiceStats } = await supabase
    .from('invoices')
    .select('created_by')
    .not('created_by', 'is', null);

  // Process stats by client
  const clientStats = new Map<string, {
    orderCount: number;
    invoiceCount: number;
    totalValueUSD: number;
    totalValueLBP: number;
    lastOrderDate?: string;
  }>();

  orderStats?.forEach(order => {
    const clientId = order.client_id!;
    const existing = clientStats.get(clientId) || {
      orderCount: 0,
      invoiceCount: 0,
      totalValueUSD: 0,
      totalValueLBP: 0
    };
    
    existing.orderCount++;
    existing.totalValueUSD += (order.cash_collection_usd || 0) + (order.delivery_fees_usd || 0);
    existing.totalValueLBP += (order.cash_collection_lbp || 0) + (order.delivery_fees_lbp || 0);
    
    if (!existing.lastOrderDate || order.created_at > existing.lastOrderDate) {
      existing.lastOrderDate = order.created_at;
    }
    
    clientStats.set(clientId, existing);
  });

  invoiceStats?.forEach(invoice => {
    const clientId = invoice.created_by!;
    const existing = clientStats.get(clientId) || {
      orderCount: 0,
      invoiceCount: 0,
      totalValueUSD: 0,
      totalValueLBP: 0
    };
    
    existing.invoiceCount++;
    clientStats.set(clientId, existing);
  });

  return profiles?.map(profile => {
    const stats = clientStats.get(profile.id) || {
      orderCount: 0,
      invoiceCount: 0,
      totalValueUSD: 0,
      totalValueLBP: 0
    };

    return {
      ...profile,
      status: 'active' as const,
      total_orders: stats.orderCount,
      total_invoices: stats.invoiceCount,
      total_order_value_usd: stats.totalValueUSD,
      total_order_value_lbp: stats.totalValueLBP,
      last_order_date: stats.lastOrderDate
    };
  }) || [];
}

export async function getClientDetails(clientId: string) {
  // Get profile with user details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single();

  // Get client orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        name,
        phone,
        address
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  // Get client invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('created_by', clientId)
    .order('created_at', { ascending: false });

  return {
    profile,
    orders: orders || [],
    invoices: invoices || []
  };
}

export async function createAdminClient(clientData: {
  business_name: string;
  email: string;
  password: string;
  phone?: string;
  business_type: string;
  full_name?: string;
}) {
  // Create auth user first
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: clientData.email,
    password: clientData.password,
    user_metadata: {
      business_name: clientData.business_name,
      business_type: clientData.business_type,
      phone: clientData.phone,
      full_name: clientData.full_name,
      user_type: 'client'
    }
  });

  if (authError) {
    throw authError;
  }

  // The profile will be created automatically by the trigger
  return authUser.user;
}

export async function updateClientStatus(clientId: string, status: 'active' | 'suspended' | 'pending') {
  // For now, we'll store status in a custom field or handle it differently
  // Since we don't have a status field in profiles, we might need to add it
  console.log(`Status update for client ${clientId} to ${status} - implement as needed`);
  return true;
}