
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideMobileNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className, hideMobileNav = false }) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex", className)}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* Mobile Navigation - conditionally hidden */}
      {isMobile && !hideMobileNav && <MobileNavigation />}
    </div>
  );
};

export default MainLayout;
