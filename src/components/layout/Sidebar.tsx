
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, LayoutGrid } from 'lucide-react';
import SidebarMenu from './SidebarMenu';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white h-screen transition-all duration-300",
        "shadow-[0px_0px_15px_rgba(0,0,0,0.03)]",
        collapsed ? "w-[70px]" : "w-[280px]",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/5">
        <Link to="/" className="flex items-center gap-2">
          {!collapsed ? (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
                G
              </div>
              <span className="text-lg font-bold ml-2.5 tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
                Genius
              </span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
              G
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1.5 hover:bg-black/5 text-muted-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-300",
            collapsed && "transform rotate-180"
          )} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent hover:scrollbar-thumb-muted/70">
        <SidebarMenu collapsed={collapsed} />
      </div>
      
      {!collapsed && (
        <div className="mt-auto border-t border-border/5 p-4">
          <Collapsible className="w-full">
            <CollapsibleTrigger className="flex justify-between w-full items-center py-1.5 px-2 text-sm rounded-lg text-muted-foreground hover:text-zinc-900 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4" />
                <span className="font-medium">Workspace</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 transform -rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-1">
              <Link to="/workspaces/marketing" className="flex items-center gap-2 ml-6 py-1.5 px-2 text-sm rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-zinc-900 transition-colors">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>Marketing</span>
              </Link>
              <Link to="/workspaces/operations" className="flex items-center gap-2 ml-6 py-1.5 px-2 text-sm rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-zinc-900 transition-colors">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>Operations</span>
              </Link>
              <Link to="/workspaces/finance" className="flex items-center gap-2 ml-6 py-1.5 px-2 text-sm rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-zinc-900 transition-colors">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span>Finance</span>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
