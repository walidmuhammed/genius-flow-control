
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  UserPlus, 
  Headphones, 
  CreditCard, 
  DollarSign, 
  Settings, 
  Activity,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: Package },
  { name: 'Pickups', href: '/admin/pickups', icon: Truck },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Clients', href: '/admin/clients', icon: UserPlus },
  { name: 'Couriers', href: '/admin/couriers', icon: Headphones },
  { name: 'Support', href: '/admin/support', icon: MessageCircle },
  { name: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { name: 'Wallet', href: '/admin/wallet', icon: CreditCard },
  { name: 'Activity', href: '/admin/activity', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminSidebarMenu: React.FC = () => {
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = isActiveRoute(item.href);
        
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              isActive
                ? 'bg-[#DC291E] text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon 
              className={cn(
                'mr-3 h-5 w-5 transition-colors',
                isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              )} 
            />
            <span>{item.name}</span>
            {item.badge && (
              <span className={cn(
                'ml-auto inline-block py-0.5 px-2 text-xs rounded-full',
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-200 text-gray-600'
              )}>
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AdminSidebarMenu;
