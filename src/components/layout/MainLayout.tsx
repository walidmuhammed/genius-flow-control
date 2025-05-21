
import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className={cn(
          "p-6 overflow-y-auto h-[calc(100vh-64px)] transition-all bg-gray-50 dark:bg-gray-900", 
          className
        )}>
          <motion.div 
            className="w-full max-w-[1600px] mx-auto space-y-8"
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

export default MainLayout;
