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
      case 'Orders Issue':
        return [
          'Delivery Delay',
          'Wrong Address',
          'Package Damaged',
          'Package Lost',
          'Customer Unavailable',
          'Incorrect Package Contents',
          'Return Request',
          'Status Update Required'
        ];
      case 'Pickup Issue':
        return [
          'Not Collected on Time',
          'Wrong Pickup Address',
          'Access Issues',
          'Package Not Ready',
          'Courier Communication',
          'Rescheduling Required',
          'Special Instructions Needed'
        ];
      case 'Payments and Wallet':
        return [
          'Invoice Query',
          'Payment Failed',
          'Refund Request',
          'Billing Discrepancy',
          'Payment Method Update',
          'Transaction History',
          'Fee Clarification'
        ];
      default:
        return [];
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
