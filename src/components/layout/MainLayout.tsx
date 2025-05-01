
import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50/80">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        <TopBar />
        <main className={cn("p-6 overflow-y-auto h-[calc(100vh-64px)] transition-all", className)}>
          <div className="w-full max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
