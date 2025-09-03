import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { useApproveCourier, useRejectCourier } from '@/hooks/use-courier-approval';

interface CourierApprovalActionsProps {
  courierId: string;
  status: string;
}

const CourierApprovalActions = ({ courierId, status }: CourierApprovalActionsProps) => {
  const approveMutation = useApproveCourier();
  const rejectMutation = useRejectCourier();

  if (status !== 'pending') {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'} className="capitalize">
        {status}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-amber-600">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
      
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => approveMutation.mutate(courierId)}
          disabled={approveMutation.isPending || rejectMutation.isPending}
        >
          <Check className="h-3 w-3" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => rejectMutation.mutate(courierId)}
          disabled={approveMutation.isPending || rejectMutation.isPending}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default CourierApprovalActions;