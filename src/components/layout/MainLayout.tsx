
import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNavigation from './MobileNavigation';
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Sidebar as Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={closeSidebar}>
          <SheetContent side="left" className="p-0 sm:max-w-[260px] w-[85vw]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className={cn(
          "p-3 sm:p-4 md:p-6 overflow-y-auto h-[calc(100vh-64px)] transition-all bg-gray-50",
          className
        )}>
          <motion.div 
            className="w-full max-w-[1600px] mx-auto space-y-4 md:space-y-8"
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
        {isMobile && <MobileNavigation />}
      </div>
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          classNames: {
            toast: "group border-border shadow-sm bg-white",
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

export default MainLayout;
