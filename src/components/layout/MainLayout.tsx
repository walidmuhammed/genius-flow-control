
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#fafafa] to-[#f5f5f7] dark:from-[#101010] dark:to-[#141418]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className={cn(
          "p-6 overflow-y-auto h-[calc(100vh-64px)] transition-all", 
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
            toast: "group border-border/10 shadow-xl bg-white/90 backdrop-blur-xl",
            title: "font-medium text-foreground",
            description: "text-muted-foreground",
            actionButton: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90",
            cancelButton: "text-muted-foreground",
            error: "bg-white/90 backdrop-blur-xl border-l-4 border-l-[#DC291E] shadow-xl",
            success: "bg-white/90 backdrop-blur-xl border-l-4 border-l-green-600 shadow-xl",
            warning: "bg-white/90 backdrop-blur-xl border-l-4 border-l-amber-600 shadow-xl",
            info: "bg-white/90 backdrop-blur-xl border-l-4 border-l-[#26A4DB] shadow-xl",
          }
        }}
      />
    </div>
  );
};

export default MainLayout;
