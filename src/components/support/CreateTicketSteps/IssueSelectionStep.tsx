import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface IssueSelectionStepProps {
  category: string;
  onSelect: (issue: string) => void;
}

export const IssueSelectionStep: React.FC<IssueSelectionStepProps> = ({
  category,
  onSelect
}) => {
  const getIssues = () => {
    switch (category) {
      case 'Order Related':
        return [
          'Tracking not updating',
          'Order was not picked up',
          'Order shows wrong price',
          'Order marked delivered but not received',
          'Courier arrived late',
          'Package damaged during delivery',
          'Wrong delivery address',
          'Customer unavailable at delivery',
          'Other'
        ];
      case 'Pickup Problem':
        return [
          'Pickup was not collected on time',
          'Wrong pickup address provided',
          'Access issues at pickup location',
          'Package not ready for pickup',
          'Courier communication problems',
          'Need to reschedule pickup',
          'Special pickup instructions needed',
          'Other'
        ];
      case 'Invoice / Payment':
        return [
          'Invoice amount is incorrect',
          'Payment processing failed',
          'Need a refund request',
          'Billing discrepancy found',
          'Update payment method',
          'Transaction history query',
          'Delivery fee clarification',
          'Other'
        ];
      case 'Technical / Platform Issue':
        return [
          'Cannot login to account',
          'Website not loading properly',
          'Mobile app crashes',
          'Features not working correctly',
          'Data not syncing',
          'Error messages appearing',
          'Performance issues',
          'Other'
        ];
      case 'Pricing / Delivery Fees':
        return [
          'Delivery fee seems incorrect',
          'Need pricing information',
          'Fee calculation questions',
          'Discount not applied',
          'Zone pricing inquiry',
          'Bulk pricing request',
          'Special rate negotiation',
          'Other'
        ];
      case 'Something Else':
        return [
          'General inquiry',
          'Feature request',
          'Partnership inquiry',
          'Feedback or suggestion',
          'Account management',
          'Service area questions',
          'Business consultation',
          'Other'
        ];
      default:
        return ['Other'];
    }
  };

  const issues = getIssues();

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        What specific issue are you experiencing?
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {issues.map((issue) => (
          <Card
            key={issue}
            className="cursor-pointer transition-all hover:bg-gray-50 border-gray-200 hover:border-gray-300"
            onClick={() => onSelect(issue)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-gray-900">{issue}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Other Option */}
      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => onSelect('Other')}
          className="w-full"
        >
          Other - I'll describe the issue myself
        </Button>
      </div>
    </div>
  );
};
