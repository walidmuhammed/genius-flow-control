
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <TopBar />
        <main className={cn("p-6 overflow-y-auto h-[calc(100vh-64px)]", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
