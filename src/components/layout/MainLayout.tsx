
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
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Fixed Top Bar */}
      <TopBar />
      
      {/* Fixed Sidebar - Desktop only */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Sidebar - Handled internally by Sidebar component */}
      {isMobile && <Sidebar />}
      
      {/* Main Content */}
      <main className={cn(
        "pt-16 min-h-screen transition-all duration-200",
        !isMobile ? "pl-64" : "pl-0"
      )}>
        <div className="w-full">
          {children}
        </div>
      </main>
      
      {/* Mobile Navigation - conditionally hidden */}
      {isMobile && !hideMobileNav && <MobileNavigation />}
    </div>
  );
};

export default MainLayout;
