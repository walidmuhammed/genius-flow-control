
import React from 'react';

interface CustomerInfoProps {
  name: string;
  phone: string;
  address?: string; // Adding address property
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ name, phone, address }) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">{name}</span>
      <span className="text-gray-500 text-xs mt-0.5">{phone}</span>
      {address && <span className="text-gray-500 text-xs mt-0.5 line-clamp-1">{address}</span>}
    </div>
  );
};

export default CustomerInfo;
