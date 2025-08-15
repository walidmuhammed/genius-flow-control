
import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import AdminMobileNavigation from './AdminMobileNavigation';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import useLayoutStore from '@/stores/layoutStore';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
  wideContent?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, className, wideContent = false }) => {
  const { isMobile, isTablet } = useScreenSize();
  const { sidebarOpen, closeSidebar } = useLayoutStore();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 min-w-0">
      {/* Desktop Sidebar */}
      {!isMobile && <AdminSidebar />}
      
      {/* Mobile Sidebar as Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={closeSidebar}>
          <SheetContent side="left" className="p-0 sm:max-w-[260px] w-[85vw]">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      )}
      
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        !isMobile && "ml-[260px]"
      )}>
        <AdminTopBar />
        <main className={cn(
          "flex-1 overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-all min-w-0",
          isMobile ? "p-3 pb-6" : isTablet ? "p-4 pb-6" : "p-6",
          className
        )}>
          <motion.div 
            className={cn(
              "w-full mx-auto space-y-4 md:space-y-8 min-w-0",
              wideContent ? "max-w-[95%]" : "max-w-7xl"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >
            {children}
          </motion.div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && <AdminMobileNavigation />}
      </div>
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          classNames: {
            toast: "group border-border shadow-sm bg-white dark:bg-gray-900",
            title: "font-medium text-foreground",
            description: "text-muted-foreground",
            actionButton: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90",
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

export default AdminLayout;
