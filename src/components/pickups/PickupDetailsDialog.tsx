import React from 'react';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Check, Clock, AlertTriangle, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PickupData } from '@/utils/pickupMappers';

interface PickupDetailsDialogProps {
  pickup: PickupData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
}

// Mock activity logs for demonstration
const mockActivityLogs: ActivityLog[] = [
  {
    timestamp: '2025-05-04T10:00:00Z',
    user: 'Admin',
    action: 'Pickup scheduled'
  },
  {
    timestamp: '2025-05-04T11:30:00Z',
    user: 'System',
    action: 'Driver assigned: Mohammed Ali'
  },
  {
    timestamp: '2025-05-04T13:45:00Z',
    user: 'Driver: Mohammed Ali',
    action: 'On the way to pickup location'
  }
];

import { PickupDetailsContent } from "./PickupDetailsContent";

const PickupDetailsDialog: React.FC<PickupDetailsDialogProps> = ({
  pickup,
  open,
  onOpenChange
}) => {
  if (!pickup) return null;
  return (
    <AnimatedModal open={open} onOpenChange={onOpenChange} className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
      <PickupDetailsContent pickup={pickup} />
    </AnimatedModal>
  );
};

export default PickupDetailsDialog;
