
import React from "react";
import { CustomerWithLocation } from "@/services/customers";
import { User, Phone, MapPin } from "lucide-react";

interface CustomersTableMobileProps {
  customers: CustomerWithLocation[];
  onCardClick: (customer: CustomerWithLocation) => void;
  calculateCustomerStats: (customerId: string) => {
    orderCount: number;
    totalValueUSD: number;
    totalValueLBP: number | null;
    lastOrderDate: string;
  };
}

const CustomersTableMobile: React.FC<CustomersTableMobileProps> = ({
  customers,
  onCardClick,
  calculateCustomerStats,
}) => {
  if (customers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No customers found
      </div>
    );
  }

  return (
    <div className="grid gap-7 px-4 py-5 bg-transparent">
      {customers.map((customer) => {
        const stats = calculateCustomerStats(customer.id);

        return (
          <button
            key={customer.id}
            className="relative w-full text-left rounded-xl border border-gray-200 bg-white px-5 py-5 flex flex-col gap-3 focus:outline-none hover:border-[#db271e] transition duration-150 shadow-sm"
            onClick={() => onCardClick(customer)}
            tabIndex={0}
            aria-label={`View customer ${customer.name}`}
            role="button"
            style={{ boxShadow: "none" }}
          >
            {/* Top row: Name and order count badge */}
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex items-center justify-center bg-[#DB271E]/10 text-[#DB271E] rounded-full h-9 w-9 flex-shrink-0">
                  <User size={20} />
                </span>
                <span className="font-semibold text-base truncate">{customer.name}</span>
              </div>
              <span className="ml-2 flex items-center">
                <span
                  className="flex items-center justify-center h-7 min-w-[28px] px-0.5 rounded-full bg-sky-400 text-white font-bold text-sm shadow-sm text-center"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: '0.01em'
                  }}
                >
                  {stats.orderCount}
                </span>
              </span>
            </div>

            {/* Phone and location */}
            <div className="flex flex-col gap-1 ml-1">
              <div className="flex items-center gap-1 text-gray-600 text-sm min-w-0 truncate">
                <Phone size={15} className="text-gray-400 shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm min-w-0">
                <MapPin size={15} className="text-gray-400 shrink-0" />
                <span className="truncate">
                  {((customer.governorate_name || "") +
                    (customer.city_name ? ` - ${customer.city_name}` : "")) || "No location"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* USD/LBP section (left side, stacked) and Date at right bottom */}
            <div className="flex flex-row w-full mt-1 items-end">
              {/* Money stacked on left */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="text-base font-semibold text-gray-900">
                  ${stats.totalValueUSD.toFixed(2)}{" "}
                  <span className="text-xs text-gray-500 ml-1">USD</span>
                </div>
                {stats.totalValueLBP !== null && (
                  <div className="text-base font-semibold text-gray-900">
                    {stats.totalValueLBP.toLocaleString()}{" "}
                    <span className="text-xs text-gray-500 ml-1">LBP</span>
                  </div>
                )}
              </div>
              {/* Date at the bottom right */}
              <div className="flex flex-col justify-end items-end flex-1 min-w-0">
                <span className="text-xs text-gray-500 font-medium mt-auto mb-0">
                  {stats.lastOrderDate}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CustomersTableMobile;

