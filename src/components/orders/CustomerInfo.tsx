
import React from 'react';

interface CustomerInfoProps {
  name: string;
  phone: string;
  address?: string;
  secondaryPhone?: string; // Add secondary phone support
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ name, phone, address, secondaryPhone }) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">{name}</span>
      <span className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
        <span>{phone}</span>
      </span>
      {secondaryPhone && (
        <span className="text-gray-500 text-xs mt-0.5">
          {secondaryPhone}
        </span>
      )}
      {address && (
        <span className="text-gray-500 text-xs mt-1 line-clamp-2 max-w-48">
          {address}
        </span>
      )}
    </div>
  );
};

export default CustomerInfo;
