
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import SidebarMenu from './SidebarMenu';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/20 bg-white h-screen transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/10">
        <Link to="/" className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-xl font-bold text-primary tracking-tight">Genius</span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-primary">G</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1.5 hover:bg-muted text-muted-foreground"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "transform rotate-180"
          )} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <SidebarMenu collapsed={collapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
