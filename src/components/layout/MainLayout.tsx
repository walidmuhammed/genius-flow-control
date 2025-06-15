

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import useLayoutStore from '@/stores/layoutStore';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { isMobile, isTablet } = useScreenSize();
  const { sidebarOpen, closeSidebar } = useLayoutStore();

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-gray-50/95 to-[#f5f2f0] dark:from-gray-900/95 dark:to-gray-800/90">
      {/* Desktop Sidebar */}
      {!isMobile && !isTablet && <Sidebar />}
      
      {/* Mobile/Tablet Sidebar as Sheet */}
      {(isMobile || isTablet) && (
        <Sheet open={sidebarOpen} onOpenChange={closeSidebar}>
          <SheetContent side="left" className="p-0 w-[280px] rounded-r-2xl border-0 shadow-2xl">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}
      
      <div
        className={cn(
          !isMobile && !isTablet ? "flex-1 flex flex-col min-w-0 ml-[264px]" : "flex-1 flex flex-col min-w-0",
        )}
      >
        <TopBar />
        <main className={cn(
          "flex-1 overflow-y-auto bg-transparent transition-all",
          isMobile ? "p-3 pb-6" : isTablet ? "p-4 pb-6" : "p-8",
          className
        )}>
          {/* Card-glass containers */}
          <motion.div 
            className={cn(
              "w-full mx-auto space-y-7",
              !isMobile && !isTablet && "max-w-[1600px] md:space-y-12"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          classNames: {
            toast: cn(
              "group border-border shadow-lg rounded-2xl",
              isMobile ? "mx-3 max-w-[calc(100vw-24px)]" : "",
              "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg"
            ),
            title: "font-bold text-foreground",
            description: "text-muted-foreground text-base",
            actionButton: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90 rounded-lg",
            cancelButton: "text-muted-foreground",
            error: "border-l-4 border-l-[#DC291E]",
            success: "border-l-4 border-l-green-600",
            warning: "border-l-4 border-l-amber-600",
            info: "border-l-4 border-l-[#26A4DB]",
          }
        }}
      />
    </div>
  );
};

export default MainLayout;

