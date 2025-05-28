
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<any> | LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  actionHref,
  className
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (actionHref) {
      navigate(actionHref);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {Icon && (
        <div className="mb-4 text-gray-400">
          <Icon className="h-12 w-12" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      )}
      {action && action}
      {actionLabel && actionHref && (
        <Button onClick={handleAction} className="bg-[#DB271E] hover:bg-[#DB271E]/90">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
