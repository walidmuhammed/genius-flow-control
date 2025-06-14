
import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Allowed lucide-react icons per project guidance
import { Package, Inbox, Activity, DollarSign } from "lucide-react";

type CardType = "new" | "progress" | "awaiting" | "cash";

const iconMap = {
  new: <Package size={28} className="text-blue-500" />,
  progress: <Activity size={28} className="text-amber-600" />,
  awaiting: <Inbox size={28} className="text-orange-500" />,
  cash: <DollarSign size={28} className="text-emerald-600" />,
};

const iconBgMap = {
  new: "bg-blue-50",
  progress: "bg-amber-50",
  awaiting: "bg-orange-50",
  cash: "bg-emerald-50",
};

interface DashboardStatCardProps {
  type: CardType;
  label: string;
  value?: string | number | null;
  loading?: boolean;
  description?: string;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  type,
  label,
  value,
  loading,
  description,
}) => {
  return (
    <section
      className={cn(
        "dashboard-stat-card group relative flex flex-col items-start justify-between gap-0 p-5 border border-border bg-white dark:bg-gray-900 transition-none",
        "h-[128px] w-full min-w-[0] rounded-xl", // fixed height desktop
        "sm:h-[120px]",
        "md:h-[136px]",
        "lg:h-[140px]",
        "xl:h-[150px]"
      )}
      style={{
        minHeight: 112,
      }}
      tabIndex={-1}
      aria-label={label}
    >
      <div className="flex items-center gap-3 mb-2">
        <span
          className={cn(
            "inline-flex items-center justify-center w-12 h-12 rounded-full",
            iconBgMap[type]
          )}
        >
          {iconMap[type]}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-200 text-base md:text-lg whitespace-nowrap">
          {label}
        </span>
      </div>
      <div className="mt-auto flex-1 flex items-end">
        {loading ? (
          <Skeleton className="h-7 w-16 rounded-md" />
        ) : (
          <span
            className={cn(
              "font-extrabold",
              "text-2xl md:text-2xl lg:text-3xl",
              "text-gray-900 dark:text-white"
            )}
          >
            {typeof value === "number"
              ? value
              : (value === null || value === undefined || value === "")
                ? "--"
                : value}
          </span>
        )}
      </div>
      {description && (
        <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">{description}</div>
      )}
    </section>
  );
};

export default DashboardStatCard;
