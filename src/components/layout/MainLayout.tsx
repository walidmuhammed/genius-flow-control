
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
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        {/* Background gradient effect */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-[#DC291E]/5 to-[#26A4DB]/5 blur-3xl pointer-events-none" />
        
        <TopBar />
        <main className={cn(
          "p-4 md:p-6 overflow-y-auto h-[calc(100vh-64px)] transition-all", 
          className
        )}>
          <motion.div 
            className="w-full max-w-[1600px] mx-auto space-y-6"
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
        position="top-right"
        toastOptions={{
          style: { 
            background: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            color: '#000',
          },
        }} 
      />
    </div>
  );
};

export default MainLayout;
