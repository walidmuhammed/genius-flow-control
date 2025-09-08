import React from 'react';
import CourierSidebar from './CourierSidebar';
import CourierTopBar from './CourierTopBar';
import CourierMobileNavigation from './CourierMobileNavigation';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import useLayoutStore from '@/stores/layoutStore';

interface CourierLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const CourierLayout: React.FC<CourierLayoutProps> = ({ children, className }) => {
  const { isMobile, isTablet } = useScreenSize();
  const { sidebarOpen, closeSidebar } = useLayoutStore();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      {!isMobile && <CourierSidebar />}
      
      {/* Mobile Sidebar as Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={closeSidebar}>
          <SheetContent side="left" className="p-0 w-[260px] border-0">
            <CourierSidebar />
          </SheetContent>
        </Sheet>
      )}
      
      <div className={cn(
        "flex-1 flex flex-col",
        !isMobile && "ml-[260px]"
      )}>
        <CourierTopBar />
        <main className={cn(
          "flex-1 bg-gray-50 dark:bg-gray-900 transition-all",
          isMobile ? "p-2 pb-6" : isTablet ? "p-4 pb-6" : "p-6 pb-6",
          className
        )}>
          <motion.div 
            className="w-full h-full mx-auto flex flex-col max-w-full"
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
        
        {/* Mobile Bottom Navigation */}
        {isMobile && <CourierMobileNavigation />}
      </div>
      
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          classNames: {
            toast: cn(
              "group border-border shadow-lg rounded-xl",
              isMobile ? "mx-3 max-w-[calc(100vw-24px)]" : "",
              "bg-white dark:bg-gray-900"
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

export default CourierLayout;