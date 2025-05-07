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

export interface FinancialStats {
  cashFlow: {
    date: string;
    usd: number;
    lbp: number;
  }[];
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

export interface GeographicalStats {
  regions: {
    name: string;
    totalOrders: number;
    successRate: number;
    failureRate: number;
    cashCollected: {
      usd: number;
      lbp: number;
    };
    cities: {
      name: string;
      totalOrders: number;
      successRate: number;
      failureRate: number;
      cashCollected: {
        usd: number;
        lbp: number;
      };
    }[];
  }[];
  courierLocations: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: 'active' | 'idle' | 'offline';
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
  
  // Get top courier with proper query syntax for the count
  const { data: topCourierResult, error: topCourierError } = await supabase
    .from('orders')
    .select('courier_name, count')
    .eq('status', 'Successful')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd)
    .not('courier_name', 'is', null)
    .order('count', { ascending: false })
    .limit(1)
    .select(`
      courier_name,
      count() OVER (PARTITION BY courier_name) as orders_count
    `)
    .single();
  
  // If the above approach doesn't work, try raw SQL as fallback
  let topCourier = null;
  if (topCourierError) {
    // Use a raw SQL query instead
    const { data: rawTopCourierData } = await supabase
      .from('orders')
      .select('courier_name')
      .eq('status', 'Successful')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)
      .not('courier_name', 'is', null);
    
    if (rawTopCourierData && rawTopCourierData.length > 0) {
      // Count occurrences in JavaScript
      const courierCounts: Record<string, number> = {};
      rawTopCourierData.forEach(order => {
        const name = order.courier_name as string;
        courierCounts[name] = (courierCounts[name] || 0) + 1;
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
  } else if (topCourierResult) {
    topCourier = {
      name: topCourierResult.courier_name,
      ordersCompleted: parseInt(topCourierResult.orders_count as string) || 0,
    };
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
    .select('created_at, status, cash_collection_usd, cash_collection_lbp, cash_collection_enabled, type')
    .gte('created_at', start)
    .lte('created_at', end);
  
  if (ordersError) {
    console.error('Error fetching financial data:', ordersError);
    throw ordersError;
  }

  // Process cash flow by date
  const cashFlowByDate: Record<string, { usd: number; lbp: number }> = {};
  
  // Group data for the given period
  orders.forEach(order => {
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
      cashFlowByDate[dateKey] = { usd: 0, lbp: 0 };
    }
    
    if (order.status === 'Successful') {
      cashFlowByDate[dateKey].usd += Number(order.cash_collection_usd || 0);
      cashFlowByDate[dateKey].lbp += Number(order.cash_collection_lbp || 0);
    }
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
    paymentMethods,
    failedCollections,
    avgCashPerOrder,
    refundRate
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
    cashUsd: number;
    cashLbp: number;
    cities: Record<string, {
      totalOrders: number;
      successfulOrders: number;
      failedOrders: number;
      cashUsd: number;
      cashLbp: number;
    }>
  }> = {};
  
  orders.forEach(order => {
    const region = order.customer?.governorates?.name || 'Unknown';
    const city = order.customer?.cities?.name || 'Unknown';
    
    // Initialize region if not exists
    if (!regionData[region]) {
      regionData[region] = {
        totalOrders: 0,
        successfulOrders: 0,
        failedOrders: 0,
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
        cashUsd: 0,
        cashLbp: 0
      };
    }
    
    // Update region stats
    regionData[region].totalOrders++;
    if (order.status === 'Successful') {
      regionData[region].successfulOrders++;
      regionData[region].cashUsd += Number(order.cash_collection_usd || 0);
      regionData[region].cashLbp += Number(order.cash_collection_lbp || 0);
    } else if (order.status === 'Unsuccessful') {
      regionData[region].failedOrders++;
    }
    
    // Update city stats
    regionData[region].cities[city].totalOrders++;
    if (order.status === 'Successful') {
      regionData[region].cities[city].successfulOrders++;
      regionData[region].cities[city].cashUsd += Number(order.cash_collection_usd || 0);
      regionData[region].cities[city].cashLbp += Number(order.cash_collection_lbp || 0);
    } else if (order.status === 'Unsuccessful') {
      regionData[region].cities[city].failedOrders++;
    }
  });
  
  // Format regions array
  const regions = Object.entries(regionData).map(([name, data]) => {
    return {
      name,
      totalOrders: data.totalOrders,
      successRate: data.totalOrders ? (data.successfulOrders / data.totalOrders) * 100 : 0,
      failureRate: data.totalOrders ? (data.failedOrders / data.totalOrders) * 100 : 0,
      cashCollected: {
        usd: data.cashUsd,
        lbp: data.cashLbp
      },
      cities: Object.entries(data.cities).map(([cityName, cityData]) => {
        return {
          name: cityName,
          totalOrders: cityData.totalOrders,
          successRate: cityData.totalOrders ? (cityData.successfulOrders / cityData.totalOrders) * 100 : 0,
          failureRate: cityData.totalOrders ? (cityData.failedOrders / cityData.totalOrders) * 100 : 0,
          cashCollected: {
            usd: cityData.cashUsd,
            lbp: cityData.cashLbp
          }
        };
      }).sort((a, b) => b.totalOrders - a.totalOrders)
    };
  }).sort((a, b) => b.totalOrders - a.totalOrders);
  
  // Mock courier locations for now (in a real app, you'd fetch from a locations table)
  const courierLocations = [
    { id: '1', name: 'Courier 1', lat: 33.8938, lng: 35.5018, status: 'active' as const },
    { id: '2', name: 'Courier 2', lat: 33.8866, lng: 35.5133, status: 'idle' as const },
    { id: '3', name: 'Courier 3', lat: 33.9032, lng: 35.4823, status: 'active' as const },
    { id: '4', name: 'Courier 4', lat: 33.8688, lng: 35.5097, status: 'offline' as const }
  ];
  
  return {
    regions,
    courierLocations
  };
}
