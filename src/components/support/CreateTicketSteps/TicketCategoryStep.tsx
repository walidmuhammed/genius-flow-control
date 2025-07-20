
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Truck, CreditCard, HelpCircle } from 'lucide-react';

interface TicketCategoryStepProps {
  onSelect: (category: string) => void;
}

export const TicketCategoryStep: React.FC<TicketCategoryStepProps> = ({ onSelect }) => {
  const categories = [
    {
      id: 'Orders Issue',
      title: 'Orders Issue',
      description: 'Problems with delivery, packages, or order status',
      icon: Package,
      color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
    },
    {
      id: 'Pickup Issue',
      title: 'Pickup Issue',
      description: 'Issues with scheduled pickups or collection',
      icon: Truck,
      color: 'border-green-200 hover:border-green-300 hover:bg-green-50'
    },
    {
      id: 'Payments and Wallet',
      title: 'Payments and Wallet',
      description: 'Billing, invoices, or payment-related questions',
      icon: CreditCard,
      color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
    },
    {
      id: 'Other',
      title: 'Other',
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
