
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { usePickups } from '@/hooks/use-pickups';
import { useInvoices } from '@/hooks/use-invoices';
import { formatDate } from '@/utils/format';
import { OrdersTable } from '@/components/orders/OrdersTable';

interface EntitySelectionStepProps {
  category: string;
  onSelect: (entity: { type: 'order' | 'pickup' | 'invoice'; id: string; name: string }) => void;
}

export const EntitySelectionStep: React.FC<EntitySelectionStepProps> = ({
  category,
  onSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: orders = [] } = useOrders();
  const { data: pickups = [] } = usePickups();
  const { data: invoices = [] } = useInvoices();

  const getEntityType = (): 'order' | 'pickup' | 'invoice' => {
    switch (category) {
      case 'Orders Issue': return 'order';
      case 'Pickup Issue': return 'pickup';
      case 'Payments and Wallet': return 'invoice';
      default: return 'order';
    }
  };

  const getEntities = () => {
    const entityType = getEntityType();
    let entities: any[] = [];

    switch (entityType) {
      case 'order':
        entities = orders.map(order => ({
          id: order.id,
          name: `Order #${order.order_id}`,
          subtitle: `${order.customer?.name} - ${order.status}`,
          date: order.created_at,
          type: 'order' as const
        }));
        break;
      case 'pickup':
        entities = pickups.map(pickup => ({
          id: pickup.id,
          name: `Pickup ${pickup.pickup_id}`,
          subtitle: `${pickup.location} - ${pickup.status}`,
          date: pickup.created_at,
          type: 'pickup' as const
        }));
        break;
      case 'invoice':
        entities = invoices.map(invoice => ({
          id: invoice.id,
          name: `Invoice ${invoice.invoice_id}`,
          subtitle: `${invoice.merchant_name} - $${invoice.total_amount_usd}`,
          date: invoice.created_at,
          type: 'invoice' as const
        }));
        break;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      entities = entities.filter(entity => 
        entity.name.toLowerCase().includes(query) ||
        entity.subtitle.toLowerCase().includes(query)
      );
    }

    return entities.slice(0, 10); // Limit to 10 results
  };

  const entities = getEntities();
  const entityType = getEntityType();

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Select the {entityType} you need help with:
      </p>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder={`Search ${entityType}s...`}
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="pl-10" 
        />
      </div>

      {/* Entity List/Table */}
      {entityType === 'order' ? (
        <div className="max-h-96 overflow-y-auto">
          <OrdersTable
            orders={orders.filter(order => {
              const query = searchQuery.toLowerCase();
              return (
                order.order_id?.toString().toLowerCase().includes(query) ||
                order.customer?.name?.toLowerCase().includes(query) ||
                order.status?.toLowerCase().includes(query)
              );
            })}
            singleSelectRowClickOnly={true}
            fitModalWidth={true}
            onOrderSelection={(ids) => {
              const selected = orders.find(order => order.id === ids[0]);
              if (selected) {
                onSelect({ type: 'order', id: selected.id, name: `Order #${selected.order_id}` });
              }
            }}
          />
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {entities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No {entityType}s found</p>
            </div>
          ) : (
            entities.map((entity) => (
              <Card
                key={entity.id}
                className="cursor-pointer transition-all hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                onClick={() => onSelect(entity)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{entity.name}</h3>
                      <p className="text-sm text-gray-600">{entity.subtitle}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(new Date(entity.date))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Skip Option */}
      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => onSelect({ type: entityType, id: '', name: 'General Issue' })}
          className="w-full"
        >
          Skip - This is a general {entityType} question
        </Button>
      </div>
    </div>
  );
};
