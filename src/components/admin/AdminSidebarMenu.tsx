
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Truck, 
  Users, 
  Navigation, 
  Activity, 
  DollarSign, 
  Settings, 
  Phone 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AdminSidebarMenuProps {
  collapsed: boolean;
}

const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({ collapsed }) => {
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/admin',
    },
    {
      icon: Package,
      label: 'Orders',
      path: '/admin/orders',
    },
    {
      icon: Truck,
      label: 'Pickups',
      path: '/admin/pickups',
    },
    {
      icon: Users,
      label: 'Clients',
      path: '/admin/clients',
    },
    {
      icon: Users,
      label: 'Couriers',
      path: '/admin/couriers',
    },
    {
      icon: Navigation,
      label: 'Dispatch',
      path: '/admin/dispatch',
    },
    {
      icon: Activity,
      label: 'Activity',
      path: '/admin/activity',
    },
    {
      icon: DollarSign,
      label: 'Pricing',
      path: '/admin/pricing',
    },
    {
      icon: Phone,
      label: 'Tickets',
      path: '/admin/tickets',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/admin/settings',
    },
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <motion.div
            key={item.path}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#DC291E] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
};

export default AdminSidebarMenu;
