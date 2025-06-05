
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNavigation from './MobileNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideMobileNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className, hideMobileNav = false }) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col", className)}>
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content Container */}
      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}
        
        {/* Main Content */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation - conditionally hidden */}
      {isMobile && !hideMobileNav && <MobileNavigation />}
    </div>
  );
};

export default MainLayout;
