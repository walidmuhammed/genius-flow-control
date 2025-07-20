
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { TicketFlowData } from '../CreateTicketModal';

interface FinalMessageStepProps {
  flowData: TicketFlowData;
  onSubmit: (title: string, message: string) => void;
  isLoading: boolean;
}

export const FinalMessageStep: React.FC<FinalMessageStepProps> = ({
  flowData,
  onSubmit,
  isLoading
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Auto-generate title based on flow data
  useEffect(() => {
    if (!title) {
      let autoTitle = '';
      
      if (flowData.linkedEntity?.name && flowData.issue) {
        autoTitle = `${flowData.issue} - ${flowData.linkedEntity.name}`;
      } else if (flowData.issue) {
        autoTitle = `${flowData.category}: ${flowData.issue}`;
      } else {
        autoTitle = `${flowData.category} Support Request`;
      }
      
      setTitle(autoTitle);
    }
  }, [flowData, title]);

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) return;
    onSubmit(title.trim(), message.trim());
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Please provide additional details about your issue:
      </p>
      
      {/* Summary Card */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">Ticket Summary</h3>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">Category:</span> {flowData.category}</div>
            {flowData.linkedEntity?.name && (
              <div><span className="font-medium">Related to:</span> {flowData.linkedEntity.name}</div>
            )}
            {flowData.issue && (
              <div><span className="font-medium">Issue:</span> {flowData.issue}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Title Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Title
        </label>
        <Input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of your issue"
        />
      </div>
      
      {/* Message Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Detailed Description
        </label>
        <Textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please provide as much detail as possible about your issue..."
          rows={5}
        />
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={!title.trim() || !message.trim() || isLoading}
          className="bg-[#DC291E] hover:bg-[#c0211a]"
        >
          {isLoading ? 'Creating Ticket...' : 'Create Support Ticket'}
        </Button>
      </div>
    </div>
  );
};
