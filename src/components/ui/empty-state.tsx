
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted/30 p-6 mb-5">
        <Icon className="h-12 w-12 text-muted-foreground/60" />
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      
      {actionLabel && (onAction || actionHref) && (
        <Button
          onClick={onAction}
          {...(actionHref ? { as: 'a', href: actionHref } : {})}
          className="mt-2 bg-[#DB271E] hover:bg-[#c0211a] text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
