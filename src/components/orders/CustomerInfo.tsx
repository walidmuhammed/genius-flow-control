
import React from 'react';

interface CustomerInfoProps {
  name: string;
  phone: string;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ name, phone }) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">{name}</span>
      <span className="text-gray-500 text-xs mt-0.5">{phone}</span>
    </div>
  );
};

export default CustomerInfo;
