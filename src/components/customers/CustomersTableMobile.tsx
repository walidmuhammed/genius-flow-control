
import React from "react";
import { CustomerWithLocation } from "@/services/customers";
import { formatDate } from "@/utils/format";
import { User, Phone, MapPin, Hash, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
          <div
            key={customer.id}
            className="bg-white rounded-xl shadow-md px-5 py-4 flex flex-col gap-2 cursor-pointer transition hover:shadow-lg hover:scale-[1.01] animate-fade-in"
            onClick={() => onCardClick(customer)}
            tabIndex={0}
            aria-label={`View customer ${customer.name}`}
            role="button"
          >
            {/* Header: Name & Phone */}
            <div className="flex items-center gap-3">
              <User size={22} className="text-[#DB271E]" />
              <span className="font-semibold text-lg">{customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm ml-1">
              <Phone size={16} className="text-gray-400" />
              <span>{customer.phone}</span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-gray-500 text-sm ml-1 mt-1">
              <MapPin size={16} className="text-gray-400" />
              <span>
                {(customer.governorate_name || "") +
                  (customer.city_name ? ` - ${customer.city_name}` : "") || "No location"}
              </span>
            </div>
            
            {/* Divider */}
            <div className="my-2 h-[1px] bg-gray-100" />
            
            {/* Order info row */}
            <div className="flex flex-wrap items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-blue-500" />
                <span className="font-medium">{stats.orderCount} Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500" />
                <span className="font-medium">
                  {stats.totalValueUSD > 0
                    ? `$${stats.totalValueUSD.toFixed(2)}`
                    : "$0.00"}
                  {stats.totalValueLBP !== null &&
                    ` / ${stats.totalValueLBP.toLocaleString()} LBP`}
                </span>
              </div>
            </div>
            
            {/* Last Order Date */}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <Calendar size={16} className="text-gray-400" />
              <span>
                {stats.lastOrderDate}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomersTableMobile;

