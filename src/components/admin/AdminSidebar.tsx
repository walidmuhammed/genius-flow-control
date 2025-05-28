
import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminSidebarMenu from './AdminSidebarMenu';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <motion.aside 
      className={cn(
        "flex flex-col w-full sm:w-[260px] sm:min-w-[260px] bg-white h-full relative border-r border-gray-200",
        className
      )}
      layout
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <div className="flex h-16 items-center px-5">
        <Link to="/admin" className="flex items-center gap-2.5 mx-auto">
          <motion.div 
            className="flex items-center" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#DC291E] h-9 w-9 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="tracking-tight text-gray-900 font-bold text-xl px-2">
              Topspeed
            </span>
          </motion.div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <AdminSidebarMenu collapsed={false} />
      </div>
      
      <div className="p-5 flex flex-col gap-3">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-gray-700", 
            "hover:bg-gray-100 transition-all duration-200"
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
