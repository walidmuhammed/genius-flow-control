
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Clock, Wallet, BarChart, LifeBuoy, Settings, ChevronDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type SidebarItemType = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: {
    count?: number;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  };
  children?: Omit<SidebarItemType, 'children'>[];
};

interface SidebarMenuProps {
  collapsed?: boolean;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  collapsed = false
}) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(['orders']); // Default open sections

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]);
  };

  const menuItems: (SidebarItemType | {
    type: 'separator';
    label: string;
  })[] = [
  // Main Navigation Items
  {
    icon: <Home className="h-[18px] w-[18px]" />,
    label: 'Home',
    href: '/'
  }, {
    icon: <Package className="h-[18px] w-[18px]" />,
    label: 'Orders',
    href: '/orders',
    badge: {
      count: 12,
      variant: 'warning'
    }
  }, {
    icon: <Clock className="h-[18px] w-[18px]" />,
    label: 'Pickups',
    href: '/pickups',
    badge: {
      count: 3,
      variant: 'success'
    }
  }, {
    icon: <Users className="h-[18px] w-[18px]" />,
    label: 'Customers',
    href: '/customers'
  }, {
    icon: <Wallet className="h-[18px] w-[18px]" />,
    label: 'Wallet',
    href: '/wallet'
  }, {
    icon: <BarChart className="h-[18px] w-[18px]" />,
    label: 'Analytics',
    href: '/analytics'
  }, {
    type: 'separator',
    label: 'Support'
  }, {
    icon: <LifeBuoy className="h-[18px] w-[18px]" />,
    label: 'Support',
    href: '/support'
  }, {
    icon: <Settings className="h-[18px] w-[18px]" />,
    label: 'Settings',
    href: '/settings'
  }];

  const getBadgeStyles = (variant: string = 'default') => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'danger':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const renderMenuItem = (item: SidebarItemType) => {
    const isActive = location.pathname === item.href || item.href !== '/' && location.pathname.startsWith(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isGroupOpen = hasChildren && openGroups.includes(item.label.toLowerCase());
    
    if (hasChildren && !collapsed) {
      return <div key={item.href} className="mb-1">
          <Collapsible open={isGroupOpen} onOpenChange={() => toggleGroup(item.label.toLowerCase())}>
            <CollapsibleTrigger className="w-full">
              <div className={cn("flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all", isActive ? "bg-primary/8 text-primary font-medium shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-zinc-900")}>
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center justify-center", isActive ? "text-primary" : "text-muted-foreground")}>
                    {item.icon}
                  </div>
                  <span className="flex-1 font-medium">{item.label}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {item.badge && <span className={cn("flex min-w-[18px] h-[18px] rounded-full text-[10px] items-center justify-center px-1 font-medium", getBadgeStyles(item.badge.variant))}>
                      {item.badge.count}
                    </span>}
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isGroupOpen && "transform rotate-180")} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-9 space-y-1 pt-1">
              {item.children?.map(childItem => {
              const isChildActive = location.pathname === childItem.href;
              return <Link key={childItem.href} to={childItem.href} className={cn("flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-all", isChildActive ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30 hover:text-zinc-900")}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn(isChildActive ? "text-primary" : "text-muted-foreground")}>
                        {childItem.icon}
                      </div>
                      <span>{childItem.label}</span>
                    </div>
                    
                    {childItem.badge && <span className={cn("flex min-w-[18px] h-[18px] rounded-full text-[10px] items-center justify-center px-1 font-medium", getBadgeStyles(childItem.badge.variant))}>
                        {childItem.badge.count}
                      </span>}
                  </Link>;
            })}
            </CollapsibleContent>
          </Collapsible>
        </div>;
    }
    
    return <Link key={item.href} to={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all", isActive ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-medium shadow-[0_1px_3px_rgba(249,115,22,0.05)]" : "text-muted-foreground hover:bg-muted/50 hover:text-zinc-900")}>
        <div className={cn("flex items-center justify-center", isActive ? "text-primary" : "text-muted-foreground")}>
          {item.icon}
        </div>
        
        {!collapsed && (
          <>
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge && (
              <span className={cn("flex min-w-[18px] h-[18px] rounded-full text-[10px] items-center justify-center px-1 font-medium", getBadgeStyles(item.badge.variant))}>
                {item.badge.count}
              </span>
            )}
          </>
        )}
      </Link>;
  };

  return <div className="space-y-1">
      {menuItems.map((item, index) => {
      if ('type' in item && item.type === 'separator' && !collapsed) {
        return <div key={`separator-${index}`} className="mt-4 mb-2 px-3">
              <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">{item.label}</p>
            </div>;
      }
      if (!('type' in item)) {
        return renderMenuItem(item);
      }
      return null;
    })}
    </div>;
};

export default SidebarMenu;
