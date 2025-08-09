import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import CourierWalletContent from '@/components/courier/CourierWalletContent';

const CourierWallet = () => {
  document.title = "Wallet - Courier Portal";
  
  return (
    <CourierLayout>
      <CourierWalletContent />
    </CourierLayout>
  );
};

export default CourierWallet;