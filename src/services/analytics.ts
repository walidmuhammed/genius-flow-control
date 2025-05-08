import { supabase } from "@/integrations/supabase/client";
import { OrderStatus } from "./orders";

export interface DashboardStats {
  ordersCreatedToday: number;
  ordersInTransit: number;
  successfulOrders: number;
  successRate: number;
  failedDeliveries: number;
  failedByCity: { city: string; count: number }[];
  cashCollected: {
    usd: number;
    lbp: number;
  };
  deliveryFees: {
    usd: number;
    lbp: number;
    target: { usd: number; lbp: number };
    percentage: number;
  };
  topCourier: {
    name: string;
    ordersCompleted: number;
    avatarUrl?: string;
  } | null;
}

export interface DeliveryPerformanceStats {
  totalOrders: number;
  successfulOrders: number;
  unsuccessfulOrders: number;
  successRate: number;
  averageDeliveryTime: number; // in minutes
  deliverySuccessOverTime: {
    date: string;
    successful: number;
    unsuccessful: number;
    rate: number;
  }[];
  unsuccessfulReasons: {
    reason: string;
    count: number;
  }[];
}

export interface FinancialStats {
  cashFlow: {
    date: string;
    usd: number;
    lbp: number;
  }[];
  cashCollected: {
    usd: number;
    lbp: number;
  };
  deliveryFees: {
    usd: number; 
    lbp: number;
  };
  netValue: {
    usd: number;
    lbp: number;
  };
  paymentMethods: {
    method: string;
    value: number;
    percentage: number;
  }[];
  failedCollections: {
    collected: number;
    failed: number;
  };
  avgCashPerOrder: {
    usd: number;
    lbp: number;
    trend: number; // percentage change from previous period
  };
  refundRate: number;
}

export interface SalesInsightsStats {
  topCustomers: {
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: {
      usd: number;
      lbp: number;
    };
  }[];
  repeatOrderFrequency: {
    repeats: number; // 1 = one-time, 2 = twice, etc.
    customerCount: number;
  }[];
  averageOrderValue: {
    usd: number;
    lbp: number;
    trend: number; // percentage change
  };
  topCategories: {
    name: string;
    count: number;
    revenue: {
      usd: number;
      lbp: number;
    };
  }[];
  mostExchangedItems: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export interface GeographicalStats {
  regions: {
    name: string;
    totalOrders: number;
    successRate: number;
    failureRate: number;
    averageDeliveryTime: number; // in minutes
    cashCollected: {
      usd: number;
      lbp: number;
    };
    cities: {
      name: string;
      totalOrders: number;
      successRate: number;
      failureRate: number;
      averageDeliveryTime: number; // in minutes
      cashCollected: {
        usd: number;
        lbp: number;
      };
    }[];
  }[];
  mapData: {
    name: string;
    orders: number;
    successRate: number;
    color: string;
  }[];
}

// Get today's date range (start of day to now)
function getTodayDateRange() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  return {
    start: startOfDay.toISOString(),
    end: today.toISOString()
  };
}

// Get date range for the past N days
function getDateRangeForPastDays(days: number) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
}

// Format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const { start: todayStart, end: todayEnd } = getTodayDateRange();
  
  // Get orders created today
  const { data: todayOrders, error: todayOrdersError } = await supabase
    .from('orders')
    .select('id, status, cash_collection_usd, cash_collection_lbp, delivery_fees_usd, delivery_fees_lbp')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);
  
  if (todayOrdersError) {
    console.error('Error fetching today orders:', todayOrdersError);
    throw todayOrdersError;
  }
  
  // Get orders in transit
  const { data: ordersInTransit, error: ordersInTransitError } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'In Progress');
  
  if (ordersInTransitError) {
    console.error('Error fetching orders in transit:', ordersInTransitError);
    throw ordersInTransitError;
  }
  
  // Get successful orders for today
  const successfulOrdersToday = todayOrders.filter(order => order.status === 'Successful').length;
  
  // Calculate success rate
  const successRate = todayOrders.length > 0 
    ? (successfulOrdersToday / todayOrders.length) * 100 
    : 0;
  
  // Get failed deliveries by city
  const { data: failedOrders, error: failedOrdersError } = await supabase
    .from('orders')
    .select(`
      id,
      customer:customer_id (
        cities:city_id (name)
      )
    `)
    .eq('status', 'Unsuccessful')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);
  
  if (failedOrdersError) {
    console.error('Error fetching failed orders:', failedOrdersError);
    throw failedOrdersError;
  }

  // Process failed orders by city
  const failedByCity: Record<string, number> = {};
  failedOrders.forEach(order => {
    const cityName = order.customer?.cities?.name || 'Unknown';
    failedByCity[cityName] = (failedByCity[cityName] || 0) + 1;
  });

  const failedByCityArray = Object.entries(failedByCity).map(([city, count]) => ({
    city,
    count
  })).sort((a, b) => b.count - a.count);
  
  // Calculate cash collected
  const cashCollected = todayOrders.reduce(
    (acc, order) => {
      acc.usd += Number(order.cash_collection_usd || 0);
      acc.lbp += Number(order.cash_collection_lbp || 0);
      return acc;
    }, 
    { usd: 0, lbp: 0 }
  );
  
  // Calculate delivery fees
  const deliveryFees = todayOrders.reduce(
    (acc, order) => {
      acc.usd += Number(order.delivery_fees_usd || 0);
      acc.lbp += Number(order.delivery_fees_lbp || 0);
      return acc;
    }, 
    { usd: 0, lbp: 0 }
  );

  // Target values (example - you might want to fetch these from a settings table)
  const targetFees = { usd: 500, lbp: 15000000 };
  const feePercentage = Math.min(
    100, 
    ((deliveryFees.usd / targetFees.usd) * 100)
  );
  
  // Try to get the top courier using the SQL function
  let topCourier = null;
  try {
    // Using a custom query for the RPC function since TypeScript doesn't know about our custom function
    const { data: funcResult, error: funcError } = await supabase
      .rpc('get_top_courier_today', { 
        start_date: todayStart, 
        end_date: todayEnd 
      }) as unknown as { 
        data: { courier_name: string; orders_count: number }[] | null; 
        error: Error | null 
      };

    if (funcError) {
      console.error('Error fetching top courier via function:', funcError);
      // We'll handle this with our fallback below
    } else if (funcResult && funcResult.length > 0) {
      topCourier = {
        name: funcResult[0].courier_name,
        ordersCompleted: Number(funcResult[0].orders_count)
      };
    }
  } catch (error) {
    console.error('Exception when fetching top courier:', error);
    // We'll handle this with our fallback below
  }

  // If we couldn't get the top courier via the function, use a fallback approach
  if (!topCourier) {
    // Direct query approach as fallback
    const { data: rawTopCourierData, error: rawDataError } = await supabase
      .from('orders')
      .select('courier_name') // Select only courier_name to be more specific
      .eq('status', 'Successful')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)
      .not('courier_name', 'is', null);
    
    if (rawDataError) {
      console.error('Error fetching raw courier data:', rawDataError);
    } else if (rawTopCourierData && rawTopCourierData.length > 0) {
      // Count occurrences in JavaScript
      const courierCounts: Record<string, number> = {};
      rawTopCourierData.forEach(order => {
        const name = order.courier_name as string;
        if (name) { // Extra check to be safe
          courierCounts[name] = (courierCounts[name] || 0) + 1;
        }
      });
      
      // Find the courier with most orders
      let maxCount = 0;
      let topCourierName = '';
      
      Object.entries(courierCounts).forEach(([name, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCourierName = name;
        }
      });
      
      if (topCourierName) {
        topCourier = {
          name: topCourierName,
          ordersCompleted: maxCount,
        };
      }
    }
  }
  
  return {
    ordersCreatedToday: todayOrders.length,
    ordersInTransit: ordersInTransit.length,
    successfulOrders: successfulOrdersToday,
    successRate,
    failedDeliveries: failedOrders.length,
    failedByCity: failedByCityArray,
    cashCollected,
    deliveryFees: {
      ...deliveryFees,
      target: targetFees,
      percentage: feePercentage
    },
    topCourier
  };
}

// Get sparkline data for past 7 days
export async function getSparklineData(metric: 'orders' | 'successful' | 'failed' | 'cash'): Promise<{ date: string; value: number }[]> {
  const { start, end } = getDateRangeForPastDays(7);
  
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('created_at, status, cash_collection_usd')
    .gte('created_at', start)
    .lte('created_at', end);
  
  if (ordersError) {
    console.error('Error fetching sparkline data:', ordersError);
    throw ordersError;
  }
  
  // Group orders by date
  const ordersByDate: Record<string, { total: number; successful: number; failed: number; cash: number }> = {};
  
  // Initialize each day in the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    ordersByDate[dateStr] = { total: 0, successful: 0, failed: 0, cash: 0 };
  }
  
  // Fill with actual data
  orders.forEach(order => {
    const dateStr = formatDate(new Date(order.created_at));
    if (!ordersByDate[dateStr]) {
      ordersByDate[dateStr] = { total: 0, successful: 0, failed: 0, cash: 0 };
    }
    
    ordersByDate[dateStr].total += 1;
    
    if (order.status === 'Successful') {
      ordersByDate[dateStr].successful += 1;
    }
    
    if (order.status === 'Unsuccessful') {
      ordersByDate[dateStr].failed += 1;
    }
    
    ordersByDate[dateStr].cash += Number(order.cash_collection_usd || 0);
  });
  
  // Convert to array sorted by date
  const result = Object.entries(ordersByDate)
    .map(([date, data]) => ({
      date,
      value: data[metric === 'orders' ? 'total' : metric === 'successful' ? 'successful' : metric === 'failed' ? 'failed' : 'cash']
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return result;
}

// Get delivery performance stats
export async function getDeliveryPerformanceStats(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<DeliveryPerformanceStats> {
  // Determine date range based on period
  let daysToFetch = 30; // Default for daily
  if (period === 'weekly') daysToFetch = 90;
  if (period === 'monthly') daysToFetch = 365;
  
  const { start, end } = getDateRangeForPastDays(daysToFetch);
  
  // Fetch orders for the period
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      updated_at,
      status,
      note
    `)
    .gte('created_at', start)
    .lte('created_at', end);
  
  if (ordersError) {
    console.error('Error fetching delivery performance data:', ordersError);
    throw ordersError;
  }

  // Calculate basic stats
  const totalOrders = orders.length;
  const successfulOrders = orders.filter(order => order.status === 'Successful').length;
  const unsuccessfulOrders = orders.filter(order => order.status === 'Unsuccessful').length;
  const successRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;
  
  // Calculate average delivery time (mock for now, replace with actual calculation)
  // Assumption: created_at to updated_at difference for successful orders
  let totalDeliveryTime = 0;
  let ordersWithTime = 0;
  
  orders.filter(order => order.status === 'Successful').forEach(order => {
    const createdAt = new Date(order.created_at).getTime();
    const updatedAt = new Date(order.updated_at).getTime();
    const deliveryTime = (updatedAt - createdAt) / (1000 * 60); // Convert to minutes
    
    if (deliveryTime > 0) {
      totalDeliveryTime += deliveryTime;
      ordersWithTime++;
    }
  });
  
  const averageDeliveryTime = ordersWithTime > 0 ? totalDeliveryTime / ordersWithTime : 0;
  
  // Group orders by date for the success/failure over time chart
  const ordersByDate: Record<string, { successful: number; unsuccessful: number }> = {};
  
  // Initialize dates in the range
  for (let i = 0; i < daysToFetch; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    ordersByDate[dateStr] = { successful: 0, unsuccessful: 0 };
  }
  
  // Populate with actual data
  orders.forEach(order => {
    const dateStr = formatDate(new Date(order.created_at));
    if (!ordersByDate[dateStr]) {
      ordersByDate[dateStr] = { successful: 0, unsuccessful: 0 };
    }
    
    if (order.status === 'Successful') {
      ordersByDate[dateStr].successful += 1;
    } else if (order.status === 'Unsuccessful') {
      ordersByDate[dateStr].unsuccessful += 1;
    }
  });
  
  // Convert to array and calculate rates
  const deliverySuccessOverTime = Object.entries(ordersByDate)
    .map(([date, data]) => {
      const dailyTotal = data.successful + data.unsuccessful;
      const rate = dailyTotal > 0 ? (data.successful / dailyTotal) * 100 : 0;
      return {
        date,
        successful: data.successful,
        unsuccessful: data.unsuccessful,
        rate
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Extract unsuccessful reasons from notes
  // This is a simple implementation - in a real scenario, you might have a dedicated field for this
  const commonReasons = [
    "Customer not available",
    "Wrong address",
    "Customer refused",
    "Package damaged",
    "Payment issues",
    "Customer postponed",
    "Other"
  ];
  
  const reasonCounts: Record<string, number> = {};
  commonReasons.forEach(reason => { reasonCounts[reason] = 0; });
  
  orders
    .filter(order => order.status === 'Unsuccessful')
    .forEach(order => {
      const note = (order.note || "").toLowerCase();
      let reasonFound = false;
      
      for (const reason of commonReasons.slice(0, -1)) {
        if (note.includes(reason.toLowerCase())) {
          reasonCounts[reason] += 1;
          reasonFound = true;
          break;
        }
      }
      
      if (!reasonFound) {
        reasonCounts["Other"] += 1;
      }
    });
  
  // Sort reasons by count and format
  const unsuccessfulReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalOrders,
    successfulOrders,
    unsuccessfulOrders,
    successRate,
    averageDeliveryTime,
    deliverySuccessOverTime,
    unsuccessfulReasons
  };
}

// Get financial statistics
export async function getFinancialStats(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<FinancialStats> {
  // Determine date range based on period
  let daysToFetch = 30; // Default for daily
  if (period === 'weekly') daysToFetch = 90;
  if (period === 'monthly') daysToFetch = 365;
  
  const { start, end } = getDateRangeForPastDays(daysToFetch);
  
  // Fetch orders for the period
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      created_at, 
      status, 
      cash_collection_usd, 
      cash_collection_lbp, 
      cash_collection_enabled, 
      delivery_fees_usd,
      delivery_fees_lbp,
      type
    `)
    .gte('created_at', start)
    .lte('created_at', end);
  
  if (ordersError) {
    console.error('Error fetching financial data:', ordersError);
    throw ordersError;
  }

  // Calculate total cash collected
  const cashCollected = orders
    .filter(order => order.status === 'Successful')
    .reduce(
      (acc, order) => {
        acc.usd += Number(order.cash_collection_usd || 0);
        acc.lbp += Number(order.cash_collection_lbp || 0);
        return acc;
      }, 
      { usd: 0, lbp: 0 }
    );
  
  // Calculate total delivery fees
  const deliveryFees = orders
    .filter(order => order.status === 'Successful')
    .reduce(
      (acc, order) => {
        acc.usd += Number(order.delivery_fees_usd || 0);
        acc.lbp += Number(order.delivery_fees_lbp || 0);
        return acc;
      }, 
      { usd: 0, lbp: 0 }
    );
  
  // Calculate net value (cash collected minus delivery fees)
  const netValue = {
    usd: cashCollected.usd - deliveryFees.usd,
    lbp: cashCollected.lbp - deliveryFees.lbp
  };

  // Process cash flow by date
  const cashFlowByDate: Record<string, { usd: number; lbp: number; feesUsd: number; feesLbp: number; netUsd: number; netLbp: number }> = {};
  
  // Group data for the given period
  orders.forEach(order => {
    if (order.status !== 'Successful') return;
    
    let dateKey: string;
    const orderDate = new Date(order.created_at);
    
    if (period === 'daily') {
      dateKey = formatDate(orderDate);
    } else if (period === 'weekly') {
      // Get the week number
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay());
      dateKey = `Week ${formatDate(weekStart)}`;
    } else {
      // Monthly
      dateKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
    }
    
    if (!cashFlowByDate[dateKey]) {
      cashFlowByDate[dateKey] = { 
        usd: 0, lbp: 0, 
        feesUsd: 0, feesLbp: 0, 
        netUsd: 0, netLbp: 0 
      };
    }
    
    const cashUsd = Number(order.cash_collection_usd || 0);
    const cashLbp = Number(order.cash_collection_lbp || 0);
    const feesUsd = Number(order.delivery_fees_usd || 0);
    const feesLbp = Number(order.delivery_fees_lbp || 0);
    
    cashFlowByDate[dateKey].usd += cashUsd;
    cashFlowByDate[dateKey].lbp += cashLbp;
    cashFlowByDate[dateKey].feesUsd += feesUsd;
    cashFlowByDate[dateKey].feesLbp += feesLbp;
    cashFlowByDate[dateKey].netUsd += cashUsd - feesUsd;
    cashFlowByDate[dateKey].netLbp += cashLbp - feesLbp;
  });
  
  // Convert to array and format
  const cashFlow = Object.entries(cashFlowByDate)
    .map(([date, values]) => ({
      date,
      usd: values.usd,
      lbp: values.lbp
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Calculate payment methods breakdown
  const codOrders = orders.filter(order => order.cash_collection_enabled);
  const nonCodOrders = orders.filter(order => !order.cash_collection_enabled);
  
  const totalOrders = orders.length;
  const codPercentage = totalOrders > 0 ? (codOrders.length / totalOrders) * 100 : 0;
  const nonCodPercentage = totalOrders > 0 ? (nonCodOrders.length / totalOrders) * 100 : 0;
  
  const paymentMethods = [
    { method: 'Cash on Delivery', value: codOrders.length, percentage: codPercentage },
    { method: 'Prepaid', value: nonCodOrders.length, percentage: nonCodPercentage }
  ];
  
  // Calculate failed collections
  const completedCodOrders = codOrders.filter(order => order.status === 'Successful');
  const failedCodOrders = codOrders.filter(order => order.status === 'Unsuccessful');
  
  const failedCollections = {
    collected: completedCodOrders.length,
    failed: failedCodOrders.length
  };
  
  // Calculate average cash per order
  const successfulOrders = orders.filter(order => order.status === 'Successful' && order.cash_collection_enabled);
  
  const totalCashUsd = successfulOrders.reduce((sum, order) => sum + Number(order.cash_collection_usd || 0), 0);
  const totalCashLbp = successfulOrders.reduce((sum, order) => sum + Number(order.cash_collection_lbp || 0), 0);
  
  const avgCashPerOrder = {
    usd: successfulOrders.length ? totalCashUsd / successfulOrders.length : 0,
    lbp: successfulOrders.length ? totalCashLbp / successfulOrders.length : 0,
    trend: 0 // Placeholder - would need historical data to calculate trend
  };
  
  // Calculate refund rate (placeholder - in real app, you'd need exchange/refund data)
  // Assuming 'Exchange' order type represents refunds for this example
  const exchangeOrders = orders.filter(order => order.type === 'Exchange');
  const refundRate = totalOrders > 0 ? (exchangeOrders.length / totalOrders) * 100 : 0;
  
  return {
    cashFlow,
    cashCollected,
    deliveryFees,
    netValue,
    paymentMethods,
    failedCollections,
    avgCashPerOrder,
    refundRate
  };
}

// Get sales insights statistics
export async function getSalesInsightsStats(): Promise<SalesInsightsStats> {
  const { start, end } = getDateRangeForPastDays(90); // Last 90 days
  
  // Fetch orders with customer data for the period
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      cash_collection_usd,
      cash_collection_lbp,
      type,
      package_type,
      package_description,
      customer:customer_id (
        id,
        name
      )
    `)
    .gte('created_at', start)
    .lte('created_at', end);
  
  if (ordersError) {
    console.error('Error fetching sales insights data:', ordersError);
    throw ordersError;
  }

  // Process customer data for "Top Customers"
  const customerStats: Record<string, {
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: { usd: number; lbp: number };
  }> = {};
  
  orders.forEach(order => {
    if (!order.customer) return;
    
    const customerId = order.customer.id;
    const customerName = order.customer.name;
    
    if (!customerStats[customerId]) {
      customerStats[customerId] = {
        id: customerId,
        name: customerName,
        totalOrders: 0,
        totalSpent: { usd: 0, lbp: 0 }
      };
    }
    
    customerStats[customerId].totalOrders += 1;
    
    if (order.status === 'Successful') {
      customerStats[customerId].totalSpent.usd += Number(order.cash_collection_usd || 0);
      customerStats[customerId].totalSpent.lbp += Number(order.cash_collection_lbp || 0);
    }
  });
  
  // Convert to array and sort by orders count
  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 10); // Top 10 customers
  
  // Calculate repeat order frequency
  const customerOrderCounts: Record<string, number> = {};
  
  orders.forEach(order => {
    if (!order.customer) return;
    
    const customerId = order.customer.id;
    customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
  });
  
  const orderFrequency: Record<number, number> = {};
  
  Object.values(customerOrderCounts).forEach(count => {
    orderFrequency[count] = (orderFrequency[count] || 0) + 1;
  });
  
  const repeatOrderFrequency = Object.entries(orderFrequency)
    .map(([repeats, customerCount]) => ({
      repeats: Number(repeats),
      customerCount
    }))
    .sort((a, b) => a.repeats - b.repeats);
  
  // Calculate average order value
  const successfulOrders = orders.filter(order => order.status === 'Successful');
  const totalUsd = successfulOrders.reduce((sum, order) => sum + Number(order.cash_collection_usd || 0), 0);
  const totalLbp = successfulOrders.reduce((sum, order) => sum + Number(order.cash_collection_lbp || 0), 0);
  
  const avgOrderValue = {
    usd: successfulOrders.length ? totalUsd / successfulOrders.length : 0,
    lbp: successfulOrders.length ? totalLbp / successfulOrders.length : 0,
    trend: 5.2 // Mock trend - would need historical comparison
  };
  
  // Calculate top categories based on package_type and package_description
  // Using package_type as a proxy for category since we don't have a dedicated field
  const categoryCounts: Record<string, {
    count: number;
    revenue: { usd: number; lbp: number };
  }> = {};
  
  orders.forEach(order => {
    const category = order.package_type || 'Uncategorized';
    
    if (!categoryCounts[category]) {
      categoryCounts[category] = {
        count: 0,
        revenue: { usd: 0, lbp: 0 }
      };
    }
    
    categoryCounts[category].count += 1;
    
    if (order.status === 'Successful') {
      categoryCounts[category].revenue.usd += Number(order.cash_collection_usd || 0);
      categoryCounts[category].revenue.lbp += Number(order.cash_collection_lbp || 0);
    }
  });
  
  const topCategories = Object.entries(categoryCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue
    }))
    .sort((a, b) => b.count - a.count);
  
  // Calculate most exchanged items based on type
  // Using just 'Exchange' type orders since we don't have item-level data
  const exchangedItems: Record<string, number> = {};
  const exchangeOrders = orders.filter(order => order.type === 'Exchange');
  
  exchangeOrders.forEach(order => {
    const itemCategory = order.package_type || 'Unknown';
    exchangedItems[itemCategory] = (exchangedItems[itemCategory] || 0) + 1;
  });
  
  const totalExchanges = exchangeOrders.length;
  const mostExchangedItems = Object.entries(exchangedItems)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalExchanges > 0 ? (count / totalExchanges) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    topCustomers,
    repeatOrderFrequency,
    averageOrderValue: avgOrderValue,
    topCategories,
    mostExchangedItems
  };
}

// Get geographical statistics
export async function getGeographicalStats(): Promise<GeographicalStats> {
  const { start, end } = getDateRangeForPastDays(30); // Last 30 days
  
  // Fetch orders with customer & location data
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      updated_at,
      status,
      cash_collection_usd,
      cash_collection_lbp,
      customer:customer_id (
        governorates:governorate_id(name),
        cities:city_id(name)
      )
    `)
    .gte('created_at', start)
    .lte('created_at', end);
  
  if (ordersError) {
    console.error('Error fetching geographical data:', ordersError);
    throw ordersError;
  }

  // Process orders by region and city
  const regionData: Record<string, {
    totalOrders: number;
    successfulOrders: number;
    failedOrders: number;
    deliveryTimes: number[]; // Array of delivery times in minutes
    cashUsd: number;
    cashLbp: number;
    cities: Record<string, {
      totalOrders: number;
      successfulOrders: number;
      failedOrders: number;
      deliveryTimes: number[]; // Array of delivery times in minutes
      cashUsd: number;
      cashLbp: number;
    }>
  }> = {};
  
  // Define colors for regions
  const regionColors: Record<string, string> = {
    'Beirut': '#3B82F6', // Blue
    'Mount Lebanon': '#10B981', // Green
    'North Lebanon': '#F59E0B', // Amber
    'Akkar': '#EC4899', // Pink
    'Beqaa': '#8B5CF6', // Purple
    'Baalbek-Hermel': '#F97316', // Orange
    'South Lebanon': '#06B6D4', // Cyan
    'Unknown': '#6B7280' // Gray
  };
  
  orders.forEach(order => {
    const region = order.customer?.governorates?.name || 'Unknown';
    const city = order.customer?.cities?.name || 'Unknown';
    
    // Calculate delivery time if available
    let deliveryTime = 0;
    if (order.status === 'Successful' && order.created_at && order.updated_at) {
      const createdAt = new Date(order.created_at).getTime();
      const updatedAt = new Date(order.updated_at).getTime();
      deliveryTime = (updatedAt - createdAt) / (1000 * 60); // Convert to minutes
    }
    
    // Initialize region if not exists
    if (!regionData[region]) {
      regionData[region] = {
        totalOrders: 0,
        successfulOrders: 0,
        failedOrders: 0,
        deliveryTimes: [],
        cashUsd: 0,
        cashLbp: 0,
        cities: {}
      };
    }
    
    // Initialize city if not exists
    if (!regionData[region].cities[city]) {
      regionData[region].cities[city] = {
        totalOrders: 0,
        successfulOrders: 0,
        failedOrders: 0,
        deliveryTimes: [],
        cashUsd: 0,
        cashLbp: 0
      };
    }
    
    // Update region stats
    regionData[region].totalOrders++;
    if (order.status === 'Successful') {
      regionData[region].successfulOrders++;
      if (deliveryTime > 0) {
        regionData[region].deliveryTimes.push(deliveryTime);
      }
      regionData[region].cashUsd += Number(order.cash_collection_usd || 0);
      regionData[region].cashLbp += Number(order.cash_collection_lbp || 0);
    } else if (order.status === 'Unsuccessful') {
      regionData[region].failedOrders++;
    }
    
    // Update city stats
    regionData[region].cities[city].totalOrders++;
    if (order.status === 'Successful') {
      regionData[region].cities[city].successfulOrders++;
      if (deliveryTime > 0) {
        regionData[region].cities[city].deliveryTimes.push(deliveryTime);
      }
      regionData[region].cities[city].cashUsd += Number(order.cash_collection_usd || 0);
      regionData[region].cities[city].cashLbp += Number(order.cash_collection_lbp || 0);
    } else if (order.status === 'Unsuccessful') {
      regionData[region].cities[city].failedOrders++;
    }
  });
  
  // Format regions array
  const regions = Object.entries(regionData).map(([name, data]) => {
    // Calculate average delivery time for region
    const avgDeliveryTime = data.deliveryTimes.length > 0
      ? data.deliveryTimes.reduce((sum, time) => sum + time, 0) / data.deliveryTimes.length
      : 0;
    
    return {
      name,
      totalOrders: data.totalOrders,
      successRate: data.totalOrders > 0 ? (data.successfulOrders / data.totalOrders) * 100 : 0,
      failureRate: data.totalOrders > 0 ? (data.failedOrders / data.totalOrders) * 100 : 0,
      averageDeliveryTime: avgDeliveryTime,
      cashCollected: {
        usd: data.cashUsd,
        lbp: data.cashLbp
      },
      cities: Object.entries(data.cities).map(([cityName, cityData]) => {
        // Calculate average delivery time for city
        const cityAvgDeliveryTime = cityData.deliveryTimes.length > 0
          ? cityData.deliveryTimes.reduce((sum, time) => sum + time, 0) / cityData.deliveryTimes.length
          : 0;
        
        return {
          name: cityName,
          totalOrders: cityData.totalOrders,
          successRate: cityData.totalOrders > 0 ? (cityData.successfulOrders / cityData.totalOrders) * 100 : 0,
          failureRate: cityData.totalOrders > 0 ? (cityData.failedOrders / cityData.totalOrders) * 100 : 0,
          averageDeliveryTime: cityAvgDeliveryTime,
          cashCollected: {
            usd: cityData.cashUsd,
            lbp: cityData.cashLbp
          }
        };
      }).sort((a, b) => b.totalOrders - a.totalOrders)
    };
  }).sort((a, b) => b.totalOrders - a.totalOrders);
  
  // Prepare data for map visualization
  const mapData = regions.map(region => ({
    name: region.name,
    orders: region.totalOrders,
    successRate: region.successRate,
    color: regionColors[region.name] || '#6B7280' // Default to gray if no color defined
  }));
  
  return {
    regions,
    mapData
  };
}
