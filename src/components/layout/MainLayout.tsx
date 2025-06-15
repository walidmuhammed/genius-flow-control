
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Desktop Sidebar */}
      {!isMobile && !isTablet && <Sidebar />}
      
      {/* Mobile/Tablet Sidebar as Sheet */}
      {(isMobile || isTablet) && (
        <Sheet open={sidebarOpen} onOpenChange={closeSidebar}>
          <SheetContent side="left" className="p-0 w-[280px] rounded-r-2xl border-0 shadow-2xl backdrop-blur-md">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}
      
      <div
        className={cn(
          // Add left margin for the sidebar only on desktop
          !isMobile && !isTablet ? "flex-1 flex flex-col min-w-0 ml-[260px]" : "flex-1 flex flex-col min-w-0",
        )}
      >
        <TopBar />
        <main className={cn(
          "flex-1 overflow-y-auto transition-all",
          isMobile ? "p-4 pb-6" : isTablet ? "p-5 pb-6" : "p-8",
          className
        )}>
          <motion.div 
            className={cn(
              "w-full mx-auto space-y-6",
              !isMobile && !isTablet && "max-w-[1600px] md:space-y-8"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-gray-800/40 p-6">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
      
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          classNames: {
            toast: cn(
              "group border-border shadow-lg rounded-xl backdrop-blur-md",
              isMobile ? "mx-3 max-w-[calc(100vw-24px)]" : "",
              "bg-white/90 dark:bg-gray-900/90"
            ),
            title: "font-medium text-foreground",
            description: "text-muted-foreground text-sm",
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
