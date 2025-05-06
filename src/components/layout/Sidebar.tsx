
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Package, Home, Settings, ClipboardList, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="h-[18px] w-[18px]" />, label: 'Dashboard', path: '/' },
    { icon: <ClipboardList className="h-[18px] w-[18px]" />, label: 'Orders', path: '/orders' },
    { icon: <Package className="h-[18px] w-[18px]" />, label: 'Packages', path: '/packages' },
    { icon: <Wallet className="h-[18px] w-[18px]" />, label: 'Wallet', path: '/wallet' },
    { icon: <Settings className="h-[18px] w-[18px]" />, label: 'Settings', path: '/settings' },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <aside className={cn(
      "flex flex-col border-r border-gray-200/70 bg-white h-screen transition-all duration-300 shadow-sm",
      collapsed ? "w-[68px]" : "w-[250px]",
      className
    )}>
      <div className="flex h-16 items-center px-3 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          {!collapsed ? (
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-500 tracking-tight">GENIUS</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
              G
            </div>
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="ml-auto rounded-full p-1.5 hover:bg-gray-100 text-gray-500 transition-all"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "transform rotate-180")} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 py-5">
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-gray-600 hover:bg-accent/70 hover:text-accent-foreground"
                )}
              >
                <span className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-gray-400"
                )}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t border-gray-200/70 p-3">
        <button 
          onClick={toggleDarkMode} 
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-accent/70 hover:text-accent-foreground transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          {darkMode ? 
            <Sun className="h-[18px] w-[18px] text-gray-400" /> : 
            <Moon className="h-[18px] w-[18px] text-gray-400" />
          }
          {!collapsed && <span>Toggle Theme</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
