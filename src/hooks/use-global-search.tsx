
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOrders } from '@/hooks/use-orders';
import { useCustomers } from '@/hooks/use-customers';
import { usePickups } from '@/hooks/use-pickups';
import { useTickets } from '@/hooks/use-tickets';
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
    ticket_id?: string;
    category?: string;
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

// Enhanced phone number normalization and matching
const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d]/g, '');
};

const createPhoneVariations = (phone: string): string[] => {
  const normalized = normalizePhoneNumber(phone);
  const variations = [normalized];
  
  // Add common Lebanese phone formats
  if (normalized.startsWith('961')) {
    variations.push(normalized.substring(3)); // Remove 961
    variations.push('0' + normalized.substring(3)); // Add 0 prefix
  }
  
  if (normalized.startsWith('0')) {
    variations.push(normalized.substring(1)); // Remove leading 0
    variations.push('961' + normalized.substring(1)); // Add 961
  }
  
  if (!normalized.startsWith('961') && !normalized.startsWith('0')) {
    variations.push('961' + normalized); // Add 961
    variations.push('0' + normalized); // Add 0
  }
  
  return variations;
};

const phoneMatches = (customerPhone: string, searchQuery: string): boolean => {
  const customerVariations = createPhoneVariations(customerPhone);
  const searchVariations = createPhoneVariations(searchQuery);
  
  // Check if any customer variation contains any search variation
  for (const customerVar of customerVariations) {
    for (const searchVar of searchVariations) {
      if (customerVar.includes(searchVar) || searchVar.includes(customerVar)) {
        return true;
      }
    }
  }
  
  return false;
};

// Enhanced text matching with fuzzy search
const textMatches = (text: string, query: string): { matches: boolean; score: number } => {
  if (!text || !query) return { matches: false, score: 0 };
  
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return { matches: true, score: 100 };
  
  // Starts with gets high score
  if (textLower.startsWith(queryLower)) return { matches: true, score: 90 };
  
  // Contains gets medium score
  if (textLower.includes(queryLower)) return { matches: true, score: 70 };
  
  // Word boundary matches
  const words = textLower.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(queryLower)) return { matches: true, score: 80 };
    if (word.includes(queryLower)) return { matches: true, score: 60 };
  }
  
  // Fuzzy matching for typos (simple version)
  if (queryLower.length > 3) {
    const chars = queryLower.split('');
    let foundChars = 0;
    let lastIndex = -1;
    
    for (const char of chars) {
      const index = textLower.indexOf(char, lastIndex + 1);
      if (index > lastIndex) {
        foundChars++;
        lastIndex = index;
      }
    }
    
    const fuzzyScore = (foundChars / chars.length) * 100;
    if (fuzzyScore > 70) return { matches: true, score: Math.floor(fuzzyScore / 2) };
  }
  
  return { matches: false, score: 0 };
};

// Enhanced ID detection patterns
const isOrderId = (query: string): boolean => {
  const cleaned = query.replace(/[#\s]/g, '');
  return /^\d+$/.test(cleaned) || /^REF-[A-Za-z0-9]+$/i.test(cleaned) || /^order/i.test(query);
};

const isPickupId = (query: string): boolean => {
  const cleaned = query.replace(/[#\s]/g, '');
  return /^PIC-\d{3}$/i.test(cleaned) || /^pickup/i.test(query) || /^pic/i.test(query);
};

const isTicketId = (query: string): boolean => {
  const cleaned = query.replace(/[#\s]/g, '');
  return /^TIC-\d{3}$/i.test(cleaned) || /^ticket/i.test(query) || /^tic/i.test(query);
};

const isPhoneNumber = (query: string): boolean => {
  const cleaned = normalizePhoneNumber(query);
  return cleaned.length >= 6 && /^(\+?961|0?[37][0-9]|8[1-9])/.test(cleaned);
};

const isLocationQuery = (query: string): boolean => {
  const locations = ['beirut', 'tripoli', 'sidon', 'zahle', 'baalbek', 'nabatieh', 'jbeil', 'batroun', 'hamra', 'verdun', 'achrafieh', 'gemmayzeh'];
  return locations.some(loc => query.toLowerCase().includes(loc));
};

export function useGlobalSearch(query: string) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { data: orders } = useOrders();
  const { data: customers } = useCustomers();
  const { data: pickups } = usePickups();
  const { data: tickets } = useTickets();

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

    const results: (SearchResult & { score: number })[] = [];
    const searchTerm = query.toLowerCase().trim();

    // Detect query type for intelligent prioritization
    const isOrderQuery = isOrderId(searchTerm);
    const isPickupQuery = isPickupId(searchTerm);
    const isTicketQuery = isTicketId(searchTerm);
    const isPhoneQuery = isPhoneNumber(searchTerm);
    const isLocationSearch = isLocationQuery(searchTerm);

    // PRIORITY 1: Search Orders with enhanced matching
    if (orders) {
      const orderResults = orders
        .map(order => {
          let totalScore = 0;
          let matches = false;

          // Order ID matching (highest priority)
          const orderIdMatch = textMatches(order.order_id.toString(), searchTerm.replace(/[#\s]/g, ''));
          if (orderIdMatch.matches) {
            totalScore += orderIdMatch.score + 50; // Boost for ID matches
            matches = true;
          }

          // Reference number matching
          if (order.reference_number) {
            const refMatch = textMatches(order.reference_number, searchTerm.replace(/[#\s]/g, ''));
            if (refMatch.matches) {
              totalScore += refMatch.score + 40;
              matches = true;
            }
          }

          // Customer name matching
          const nameMatch = textMatches(order.customer.name, searchTerm);
          if (nameMatch.matches) {
            totalScore += nameMatch.score + 30;
            matches = true;
          }

          // Enhanced phone matching
          if (phoneMatches(order.customer.phone, searchTerm)) {
            totalScore += 85; // High score for phone matches
            matches = true;
          }

          // Location matching
          if (order.customer.city_name) {
            const cityMatch = textMatches(order.customer.city_name, searchTerm);
            if (cityMatch.matches) {
              totalScore += cityMatch.score + 20;
              matches = true;
            }
          }

          if (order.customer.governorate_name) {
            const govMatch = textMatches(order.customer.governorate_name, searchTerm);
            if (govMatch.matches) {
              totalScore += govMatch.score + 20;
              matches = true;
            }
          }

          // Address matching
          if (order.customer.address) {
            const addressMatch = textMatches(order.customer.address, searchTerm);
            if (addressMatch.matches) {
              totalScore += addressMatch.score + 15;
              matches = true;
            }
          }

          // Status matching
          const statusMatch = textMatches(order.status, searchTerm);
          if (statusMatch.matches) {
            totalScore += statusMatch.score + 10;
            matches = true;
          }

          // Type matching
          const typeMatch = textMatches(order.type, searchTerm);
          if (typeMatch.matches) {
            totalScore += typeMatch.score + 10;
            matches = true;
          }

          // Note matching
          if (order.note) {
            const noteMatch = textMatches(order.note, searchTerm);
            if (noteMatch.matches) {
              totalScore += noteMatch.score + 5;
              matches = true;
            }
          }

          // Package description matching
          if (order.package_description) {
            const packageMatch = textMatches(order.package_description, searchTerm);
            if (packageMatch.matches) {
              totalScore += packageMatch.score + 10;
              matches = true;
            }
          }

          if (!matches) return null;

          return {
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
            },
            score: totalScore
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.score - a!.score)
        .slice(0, isOrderQuery ? 8 : 4);
      
      results.push(...orderResults as (SearchResult & { score: number })[]);
    }

    // PRIORITY 2: Search Pickups with enhanced matching
    if (pickups && (!isPhoneQuery || isPickupQuery || isLocationSearch)) {
      const pickupResults = pickups
        .map(pickup => {
          let totalScore = 0;
          let matches = false;

          // Pickup ID matching
          if (pickup.pickup_id) {
            const pickupIdMatch = textMatches(pickup.pickup_id, searchTerm.replace(/[#\s]/g, ''));
            if (pickupIdMatch.matches) {
              totalScore += pickupIdMatch.score + 50;
              matches = true;
            }
          }

          // Location matching
          const locationMatch = textMatches(pickup.location, searchTerm);
          if (locationMatch.matches) {
            totalScore += locationMatch.score + 40;
            matches = true;
          }

          // Address matching
          const addressMatch = textMatches(pickup.address, searchTerm);
          if (addressMatch.matches) {
            totalScore += addressMatch.score + 30;
            matches = true;
          }

          // Contact person matching
          const contactMatch = textMatches(pickup.contact_person, searchTerm);
          if (contactMatch.matches) {
            totalScore += contactMatch.score + 30;
            matches = true;
          }

          // Phone matching
          if (phoneMatches(pickup.contact_phone, searchTerm)) {
            totalScore += 85;
            matches = true;
          }

          // Status matching
          const statusMatch = textMatches(pickup.status, searchTerm);
          if (statusMatch.matches) {
            totalScore += statusMatch.score + 15;
            matches = true;
          }

          // Vehicle type matching
          if (pickup.vehicle_type) {
            const vehicleMatch = textMatches(pickup.vehicle_type, searchTerm);
            if (vehicleMatch.matches) {
              totalScore += vehicleMatch.score + 20;
              matches = true;
            }
          }

          // Note matching
          if (pickup.note) {
            const noteMatch = textMatches(pickup.note, searchTerm);
            if (noteMatch.matches) {
              totalScore += noteMatch.score + 10;
              matches = true;
            }
          }

          if (!matches) return null;

          return {
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
            },
            score: totalScore
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.score - a!.score)
        .slice(0, isPickupQuery ? 8 : 3);
      
      results.push(...pickupResults as (SearchResult & { score: number })[]);
    }

    // PRIORITY 3: Search Customers with enhanced matching
    if (customers && (!isOrderQuery && !isPickupQuery && !isTicketQuery)) {
      const customerResults = customers
        .map(customer => {
          let totalScore = 0;
          let matches = false;

          // Name matching
          const nameMatch = textMatches(customer.name, searchTerm);
          if (nameMatch.matches) {
            totalScore += nameMatch.score + 40;
            matches = true;
          }

          // Phone matching
          if (phoneMatches(customer.phone, searchTerm)) {
            totalScore += 90; // Highest score for direct customer phone match
            matches = true;
          }

          // Secondary phone matching
          if (customer.secondary_phone && phoneMatches(customer.secondary_phone, searchTerm)) {
            totalScore += 85;
            matches = true;
          }

          // Address matching
          if (customer.address) {
            const addressMatch = textMatches(customer.address, searchTerm);
            if (addressMatch.matches) {
              totalScore += addressMatch.score + 25;
              matches = true;
            }
          }

          // City matching
          if (customer.city_name) {
            const cityMatch = textMatches(customer.city_name, searchTerm);
            if (cityMatch.matches) {
              totalScore += cityMatch.score + 20;
              matches = true;
            }
          }

          // Governorate matching
          if (customer.governorate_name) {
            const govMatch = textMatches(customer.governorate_name, searchTerm);
            if (govMatch.matches) {
              totalScore += govMatch.score + 20;
              matches = true;
            }
          }

          if (!matches) return null;

          return {
            id: customer.id,
            title: customer.name,
            subtitle: customer.phone,
            category: 'Customers' as const,
            icon: <User className="h-4 w-4" />,
            path: `/customers?modal=details&id=${customer.id}`,
            metadata: {
              phone: customer.phone
            },
            score: totalScore
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.score - a!.score)
        .slice(0, 4);
      
      results.push(...customerResults as (SearchResult & { score: number })[]);
    }

    // PRIORITY 4: Search Support Tickets with enhanced matching
    if (tickets && tickets.length > 0) {
      const ticketResults = tickets
        .map(ticket => {
          let totalScore = 0;
          let matches = false;

          // Ticket number matching
          if (ticket.ticket_number) {
            const ticketIdMatch = textMatches(ticket.ticket_number, searchTerm.replace(/[#\s]/g, ''));
            if (ticketIdMatch.matches) {
              totalScore += ticketIdMatch.score + 50;
              matches = true;
            }
          }

          // Title matching
          const titleMatch = textMatches(ticket.title, searchTerm);
          if (titleMatch.matches) {
            totalScore += titleMatch.score + 40;
            matches = true;
          }

          // Content matching
          const contentMatch = textMatches(ticket.content, searchTerm);
          if (contentMatch.matches) {
            totalScore += contentMatch.score + 30;
            matches = true;
          }

          // Category matching
          const categoryMatch = textMatches(ticket.category, searchTerm);
          if (categoryMatch.matches) {
            totalScore += categoryMatch.score + 25;
            matches = true;
          }

          // Status matching
          const statusMatch = textMatches(ticket.status, searchTerm);
          if (statusMatch.matches) {
            totalScore += statusMatch.score + 15;
            matches = true;
          }

          // Issue description matching
          if (ticket.issue_description) {
            const issueMatch = textMatches(ticket.issue_description, searchTerm);
            if (issueMatch.matches) {
              totalScore += issueMatch.score + 20;
              matches = true;
            }
          }

          if (!matches) return null;

          return {
            id: ticket.id,
            title: ticket.title,
            subtitle: `${ticket.category} | ${ticket.status}`,
            category: 'Support' as const,
            icon: <Ticket className="h-4 w-4" />,
            path: `/support?modal=details&id=${ticket.id}`,
            metadata: {
              status: ticket.status,
              category: ticket.category,
              ticket_id: ticket.id
            },
            score: totalScore
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.score - a!.score)
        .slice(0, isTicketQuery ? 6 : 3);
      
      results.push(...ticketResults as (SearchResult & { score: number })[]);
    }

    // PRIORITY 5: Search Settings with enhanced matching
    const settingsMatches = settingsResults
      .map(setting => {
        let totalScore = 0;
        let matches = false;

        const titleMatch = textMatches(setting.title, searchTerm);
        if (titleMatch.matches) {
          totalScore += titleMatch.score + 30;
          matches = true;
        }

        const subtitleMatch = textMatches(setting.subtitle, searchTerm);
        if (subtitleMatch.matches) {
          totalScore += subtitleMatch.score + 20;
          matches = true;
        }

        if (!matches) return null;

        return { ...setting, score: totalScore };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 2);

    results.push(...settingsMatches as (SearchResult & { score: number })[]);

    // Sort all results by score and limit total results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...result }) => result);
  }, [query, orders, customers, pickups, tickets]);

  return {
    results: searchResults,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
    isLoading: false
  };
}
