
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
        "flex flex-col border-r border-border/5 bg-white h-screen transition-all duration-300 shadow-[1px_0_3px_0_rgba(0,0,0,0.05)]",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/5">
        <Link to="/" className="flex items-center gap-2">
          {!collapsed ? (
            <div className="flex items-center">
              <span className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-bold text-sm mr-2">G</span>
              <span className="text-lg font-bold text-zinc-900 tracking-tight">Genius</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
              G
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1.5 hover:bg-muted/50 text-muted-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-200",
            collapsed && "transform rotate-180"
          )} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent hover:scrollbar-thumb-muted/70">
        <SidebarMenu collapsed={collapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
