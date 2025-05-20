
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#fcfcfc] to-[#f5f5f5] dark:from-[#0e0e0e] dark:to-[#151515]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px]">
        <TopBar />
        <main className={cn(
          "p-6 overflow-y-auto h-[calc(100vh-64px)] transition-all", 
          className
        )}>
          <motion.div 
            className="w-full max-w-[1600px] mx-auto space-y-8"
            initial={{ opacity: 0, y: 15 }}
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
            toast: "group border-border/10 shadow-xl bg-white/95 backdrop-blur-md rounded-xl",
            title: "font-medium text-foreground",
            description: "text-muted-foreground",
            actionButton: "bg-topspeed-600 hover:bg-topspeed-700 text-white transition-colors rounded-lg",
            cancelButton: "text-muted-foreground hover:text-foreground",
            error: "bg-white/95 backdrop-blur-md border-l-4 border-l-topspeed-600",
            success: "bg-white/95 backdrop-blur-md border-l-4 border-l-green-600",
            warning: "bg-white/95 backdrop-blur-md border-l-4 border-l-amber-600",
            info: "bg-white/95 backdrop-blur-md border-l-4 border-l-[#26A4DB]",
          }
        }}
      />
    </div>
  );
};

export default MainLayout;
