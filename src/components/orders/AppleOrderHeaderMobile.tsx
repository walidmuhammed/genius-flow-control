
import React from "react";
import { Package, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AppleOrderHeaderMobileProps {
  order: any;
  canEditDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  "pending pickup": "bg-orange-50 text-orange-700",
  "in progress": "bg-yellow-50 text-yellow-700",
  "heading to customer": "bg-purple-50 text-purple-700",
  "heading to you": "bg-indigo-50 text-indigo-700",
  successful: "bg-green-50 text-green-700",
  unsuccessful: "bg-red-50 text-red-700",
  returned: "bg-gray-50 text-gray-700",
  paid: "bg-emerald-50 text-emerald-700",
};

const typeColors: Record<string, string> = {
  shipment: "bg-green-100 text-green-700",
  exchange: "bg-purple-100 text-purple-700",
  "cash collection": "bg-emerald-100 text-emerald-700",
  return: "bg-amber-100 text-amber-700",
};

const AppleOrderHeaderMobile: React.FC<AppleOrderHeaderMobileProps> = ({
  order,
  canEditDelete,
  onEdit,
  onDelete,
}) => {
  // Badges
  const statusBg = statusColors[order.status.toLowerCase()] || "bg-gray-100 text-gray-700";
  const typeBg = typeColors[order.type.toLowerCase()] || "bg-gray-100 text-gray-700";

  return (
    <div
      className="relative flex flex-col w-full z-20 border-b border-gray-100/70 dark:border-neutral-900/70"
      style={{
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTopLeftRadius: "1.5rem",
        borderTopRightRadius: "1.5rem",
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.04)",
      }}
      data-vaul-drag-handle
    >
      {/* iOS drag indicator */}
      <div
        className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-black/15 dark:bg-white/25 opacity-90"
        aria-hidden="true"
        style={{
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.08)",
        }}
      />
      <div className="flex flex-col gap-0 px-7 pt-3 pb-4">
        {/* Top row: icon + order id + reference */}
        <div className="flex items-center min-w-0 gap-3 mb-2">
          <Package className="h-6 w-6 text-[#DB271E] flex-shrink-0" />
          <span className="text-[22px] font-bold tracking-tight text-gray-900 truncate">
            Order #{order.order_id?.toString().padStart(3, "0") || order.id.slice(0, 8)}
          </span>
          {order.reference_number && (
            <span
              className="ml-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#F9E8EA] to-[#fceed8] border border-[#db271e25] text-[#DB271E] font-semibold tracking-wide text-[15px] shadow-inner shadow-white/10 truncate max-w-[120px] sm:max-w-none"
              style={{
                fontSize: 15,
                letterSpacing: "0.01em",
                fontWeight: 600,
              }}
            >
              {order.reference_number}
            </span>
          )}
        </div>
        {/* Second row: badges + action buttons */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBg} border-gray-200`}
            >
              {order.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeBg} border-gray-200`}
            >
              {order.type}
            </span>
          </div>
          {canEditDelete && (
            <div className="flex items-center gap-3 ml-2">
              <Button
                onClick={onEdit}
                variant="outline"
                size="icon"
                className="flex items-center justify-center h-11 w-11 rounded-full text-base"
                style={{ minWidth: 44, minHeight: 44 }}
                aria-label="Edit Order"
              >
                <Edit className="h-6 w-6" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex items-center justify-center h-11 w-11 text-red-600 hover:text-red-700 hover:bg-red-50 border-none rounded-full text-base"
                    style={{ minWidth: 44, minHeight: 44 }}
                    aria-label="Delete Order"
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this order? It will be archived and hidden from the list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppleOrderHeaderMobile;
