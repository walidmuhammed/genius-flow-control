
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOrders } from '@/hooks/use-orders';
import { useCustomers } from '@/hooks/use-customers';
import { usePickups } from '@/hooks/use-pickups';
import { Search, Package, User, Calendar, Settings, Ticket, Receipt } from 'lucide-react';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Orders' | 'Customers' | 'Pickups' | 'Settings' | 'Support' | 'Invoices';
  icon: React.ReactNode;
  path: string;
  metadata?: {
    status?: string;
    phone?: string;
    amount_usd?: number;
    amount_lbp?: number;
    type?: string;
    date?: string;
    pickup_id?: string;
    order_id?: string;
  };
}

const settingsResults: SearchResult[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    subtitle: 'Update your personal details',
    category: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    path: '/settings?tab=personal'
  },
  {
    id: 'business-info',
    title: 'Business Information',
    subtitle: 'Manage business details',
    category: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    path: '/settings?tab=business-info'
  },
  {
    id: 'security',
    title: 'Security',
    subtitle: 'Password and security settings',
    category: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    path: '/settings?tab=security'
  },
  {
    id: 'business-locations',
    title: 'Business Locations',
    subtitle: 'Manage your business locations',
    category: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    path: '/settings?tab=business-locations'
  }
];

// Enhanced smart detection patterns
const isOrderId = (query: string): boolean => {
  const cleaned = query.replace(/[#\s]/g, '');
  return /^\d{1,}$/.test(cleaned) || /^REF-[A-Za-z0-9]+$/i.test(cleaned);
};

const isPickupId = (query: string): boolean => {
  const cleaned = query.replace(/[#\s]/g, '');
  return /^PIC-\d{3}$/i.test(cleaned) || /^pickup/i.test(query);
};

const isPhoneNumber = (query: string): boolean => {
  const cleaned = query.replace(/\D/g, '');
  return cleaned.length >= 8 && /^(\+?961|0?[37][0-9]|8[1-9])/.test(cleaned);
};

const isLocationQuery = (query: string): boolean => {
  const locations = ['beirut', 'tripoli', 'sidon', 'zahle', 'baalbek', 'nabatieh', 'jbeil', 'batroun'];
  return locations.some(loc => query.toLowerCase().includes(loc));
};

export function useGlobalSearch(query: string) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { data: orders } = useOrders();
  const { data: customers } = useCustomers();
  const { data: pickups } = usePickups();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  const addToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase().trim();

    // Smart detection for different query types
    const isOrderQuery = isOrderId(searchTerm);
    const isPickupQuery = isPickupId(searchTerm);
    const isPhoneQuery = isPhoneNumber(searchTerm);
    const isLocationSearch = isLocationQuery(searchTerm);

    // PRIORITY 1: Search Orders (highest priority for numbers and refs)
    if (orders) {
      const orderResults = orders
        .filter(order => {
          // Enhanced order matching with priority
          const orderIdMatch = order.order_id.toString().includes(searchTerm.replace(/[#\s]/g, ''));
          const referenceMatch = order.reference_number?.toLowerCase().includes(searchTerm.replace(/[#\s]/g, ''));
          const customerMatch = order.customer.name.toLowerCase().includes(searchTerm);
          const phoneMatch = order.customer.phone.includes(searchTerm);
          
          // Give priority to exact matches
          if (isOrderQuery) {
            return orderIdMatch || referenceMatch;
          }
          
          return orderIdMatch || referenceMatch || customerMatch || phoneMatch;
        })
        .sort((a, b) => {
          // Prioritize exact order ID matches
          const aOrderMatch = a.order_id.toString() === searchTerm.replace(/[#\s]/g, '');
          const bOrderMatch = b.order_id.toString() === searchTerm.replace(/[#\s]/g, '');
          if (aOrderMatch && !bOrderMatch) return -1;
          if (!aOrderMatch && bOrderMatch) return 1;
          return 0;
        })
        .slice(0, isOrderQuery ? 6 : 4)
        .map(order => ({
          id: order.id,
          title: `Order #${order.order_id}`,
          subtitle: `${order.customer.name} | ${order.customer.phone}`,
          category: 'Orders' as const,
          icon: <Package className="h-4 w-4" />,
          path: `/orders?modal=details&id=${order.id}`,
          metadata: {
            status: order.status,
            phone: order.customer.phone,
            amount_usd: order.cash_collection_usd + order.delivery_fees_usd,
            amount_lbp: order.cash_collection_lbp + order.delivery_fees_lbp,
            type: order.type,
            order_id: order.order_id.toString()
          }
        }));
      
      results.push(...orderResults);
    }

    // PRIORITY 2: Search Pickups (enhanced with pickup_id matching)
    if (pickups && (!isPhoneQuery || isPickupQuery || isLocationSearch)) {
      const pickupResults = pickups
        .filter(pickup => {
          const pickupIdMatch = pickup.pickup_id?.toLowerCase().includes(searchTerm.replace(/[#\s]/g, ''));
          const locationMatch = pickup.location.toLowerCase().includes(searchTerm);
          const addressMatch = pickup.address.toLowerCase().includes(searchTerm);
          const contactMatch = pickup.contact_person.toLowerCase().includes(searchTerm);
          const phoneMatch = pickup.contact_phone.includes(searchTerm);
          
          // Give priority to pickup ID matches
          if (isPickupQuery) {
            return pickupIdMatch;
          }
          
          return pickupIdMatch || locationMatch || addressMatch || contactMatch || phoneMatch;
        })
        .sort((a, b) => {
          // Prioritize exact pickup ID matches
          const aPickupMatch = a.pickup_id?.toLowerCase() === searchTerm.toLowerCase();
          const bPickupMatch = b.pickup_id?.toLowerCase() === searchTerm.toLowerCase();
          if (aPickupMatch && !bPickupMatch) return -1;
          if (!aPickupMatch && bPickupMatch) return 1;
          return 0;
        })
        .slice(0, isPickupQuery ? 6 : 3)
        .map(pickup => ({
          id: pickup.id,
          title: `${pickup.pickup_id || 'Pickup'} - ${pickup.location}`,
          subtitle: `${pickup.contact_person} | ${pickup.contact_phone}`,
          category: 'Pickups' as const,
          icon: <Calendar className="h-4 w-4" />,
          path: `/pickups?modal=details&id=${pickup.id}`,
          metadata: {
            status: pickup.status,
            date: pickup.pickup_date,
            phone: pickup.contact_phone,
            pickup_id: pickup.pickup_id
          }
        }));
      
      results.push(...pickupResults);
    }

    // PRIORITY 3: Search Customers
    if (customers && (!isOrderQuery && !isPickupQuery)) {
      const customerResults = customers
        .filter(customer => {
          const nameMatch = customer.name.toLowerCase().includes(searchTerm);
          const phoneMatch = customer.phone.includes(searchTerm);
          const addressMatch = customer.address?.toLowerCase().includes(searchTerm);
          
          return nameMatch || phoneMatch || addressMatch;
        })
        .slice(0, 3)
        .map(customer => ({
          id: customer.id,
          title: customer.name,
          subtitle: customer.phone,
          category: 'Customers' as const,
          icon: <User className="h-4 w-4" />,
          path: `/customers?modal=details&id=${customer.id}`,
          metadata: {
            phone: customer.phone
          }
        }));
      
      results.push(...customerResults);
    }

    // PRIORITY 4: Search Settings
    const settingsMatches = settingsResults.filter(setting => 
      setting.title.toLowerCase().includes(searchTerm) ||
      setting.subtitle.toLowerCase().includes(searchTerm)
    );
    results.push(...settingsMatches.slice(0, 2));

    // Limit total results to 8
    return results.slice(0, 8);
  }, [query, orders, customers, pickups]);

  return {
    results: searchResults,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
    isLoading: false
  };
}
