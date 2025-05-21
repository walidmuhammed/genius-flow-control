
import * as React from "react";

// Breakpoint values (in pixels)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<ScreenSize>('lg');
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [isTablet, setIsTablet] = React.useState<boolean>(false);
  const [isDesktop, setIsDesktop] = React.useState<boolean>(true);
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Determine screen size
      if (width < BREAKPOINTS.sm) {
        setScreenSize('xs');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < BREAKPOINTS.md) {
        setScreenSize('sm');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < BREAKPOINTS.lg) {
        setScreenSize('md');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < BREAKPOINTS.xl) {
        setScreenSize('lg');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else if (width < BREAKPOINTS['2xl']) {
        setScreenSize('xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else {
        setScreenSize('2xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isMobile,
    isTablet, 
    isDesktop,
    isSmallScreen: isMobile || isTablet
  };
}
