
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
    <div className="grid gap-4 sm:grid-cols-2">
      {customers.map((customer) => {
        const stats = calculateCustomerStats(customer.id);
        return (
          <button
            key={customer.id}
            className="w-full text-left border rounded-lg bg-white px-4 py-4 flex flex-col gap-3 focus:outline-none hover:shadow-sm transition group"
            onClick={() => onCardClick(customer)}
            tabIndex={0}
            aria-label={`View customer ${customer.name}`}
            role="button"
            style={{ boxShadow: 'none' }}
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
            <div className="border-t border-gray-100 my-1" />

            {/* Stats Row (Orders + Money) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-blue-500" />
                <span className="font-medium text-gray-900">{stats.orderCount}</span>
                <span className="text-xs text-gray-500 ml-1">Orders</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign size={16} className="text-emerald-500" />
                <span className="font-medium text-gray-900">
                  ${stats.totalValueUSD.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 ml-1">USD</span>
              </div>
              {/* LBP in a separate line */}
              {stats.totalValueLBP !== null && (
                <div className="flex items-center gap-2 mt-1 ml-[28px]">
                  <DollarSign size={16} className="text-yellow-600 opacity-80" />
                  <span className="font-medium text-gray-900">{stats.totalValueLBP.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 ml-1">LBP</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 ml-1 text-xs text-gray-500">
              <Calendar size={16} className="text-gray-400" />
              <span>
                {stats.lastOrderDate}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CustomersTableMobile;

