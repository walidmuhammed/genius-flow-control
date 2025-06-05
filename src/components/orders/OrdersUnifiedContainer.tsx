
import React from 'react';
import { motion } from 'framer-motion';

interface OrdersUnifiedContainerProps {
  children: React.ReactNode;
}

export const OrdersUnifiedContainer: React.FC<OrdersUnifiedContainerProps> = ({
  children
}) => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
