
import React from "react";
import { CustomerWithLocation } from "@/services/customers";
import { User, Phone, MapPin, Hash, DollarSign, Calendar } from "lucide-react";

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
    <div className="grid gap-6 sm:grid-cols-2 px-2 py-2 bg-transparent">
      {customers.map((customer) => {
        const stats = calculateCustomerStats(customer.id);

        return (
          <button
            key={customer.id}
            className="w-full text-left rounded-xl border border-transparent px-4 py-4 flex flex-col gap-2 focus:outline-none hover:border-[#db271e] transition duration-150"
            onClick={() => onCardClick(customer)}
            tabIndex={0}
            aria-label={`View customer ${customer.name}`}
            role="button"
            style={{ background: "transparent", boxShadow: "none" }}
          >
            {/* Name & Phone Row */}
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center bg-[#DB271E]/10 text-[#DB271E] rounded-full h-9 w-9">
                <User size={20} />
              </span>
              <span className="font-semibold text-base truncate">{customer.name}</span>
            </div>
            <div className="flex items-center gap-2 ml-1 text-gray-600 text-sm whitespace-nowrap truncate">
              <Phone size={16} className="text-gray-400" />
              <span>{customer.phone}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 ml-1 text-gray-500 text-sm">
              <MapPin size={16} className="text-gray-400" />
              <span>
                {((customer.governorate_name || "") +
                  (customer.city_name ? ` - ${customer.city_name}` : "")) || "No location"}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* Money row (first line) */}
            <div className="flex items-center gap-4 text-base font-medium text-gray-900 ml-1">
              {/* USD always shown */}
              <div className="flex items-center gap-1">
                <DollarSign size={16} className="text-emerald-500" />
                <span>${stats.totalValueUSD.toFixed(2)}</span>
                <span className="text-xs text-gray-500 ml-1">USD</span>
              </div>
              {/* LBP beside if it exists */}
              {stats.totalValueLBP !== null && (
                <div className="flex items-center gap-1">
                  <DollarSign size={16} className="text-yellow-600 opacity-90" />
                  <span>{stats.totalValueLBP.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 ml-1">LBP</span>
                </div>
              )}
            </div>

            {/* Stats row (second line) */}
            <div className="flex items-center gap-6 text-sm text-gray-700 ml-1 mt-1">
              <div className="flex items-center gap-1">
                <Hash size={15} className="text-blue-500" />
                <span>{stats.orderCount}</span>
                <span className="text-xs text-gray-500 ml-1">Orders</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={15} className="text-gray-400" />
                <span className="text-xs text-gray-500">{stats.lastOrderDate}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CustomersTableMobile;
