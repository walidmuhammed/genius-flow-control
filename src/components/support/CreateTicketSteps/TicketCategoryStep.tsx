
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Truck, CreditCard, HelpCircle, Settings, DollarSign } from 'lucide-react';

interface TicketCategoryStepProps {
  onSelect: (category: string) => void;
}

export const TicketCategoryStep: React.FC<TicketCategoryStepProps> = ({ onSelect }) => {
  const categories = [
    {
      id: 'Order Related',
      title: 'Order Related',
      description: 'Problems with delivery, packages, or order status',
      icon: Package,
      color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
    },
    {
      id: 'Invoice / Payment',
      title: 'Invoice / Payment',
      description: 'Billing, invoices, or payment-related questions',
      icon: CreditCard,
      color: 'border-green-200 hover:border-green-300 hover:bg-green-50'
    },
    {
      id: 'Technical / Platform Issue',
      title: 'Technical / Platform Issue',
      description: 'Technical problems with the platform or app',
      icon: Settings,
      color: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
    },
    {
      id: 'Pricing / Delivery Fees',
      title: 'Pricing / Delivery Fees',
      description: 'Questions about pricing or delivery costs',
      icon: DollarSign,
      color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
    },
    {
      id: 'Pickup Problem',
      title: 'Pickup Problem',
      description: 'Issues with scheduled pickups or collection',
      icon: Truck,
      color: 'border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50'
    },
    {
      id: 'Something Else',
      title: 'Something Else',
      description: 'General questions or other concerns',
      icon: HelpCircle,
      color: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        What type of issue are you experiencing? This helps us route your request to the right team.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${category.color}`}
              onClick={() => onSelect(category.id)}
            >
              <CardContent className="p-6 text-center">
                <Icon className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                <h3 className="font-medium text-gray-900 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
