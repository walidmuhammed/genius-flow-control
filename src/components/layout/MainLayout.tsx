
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
