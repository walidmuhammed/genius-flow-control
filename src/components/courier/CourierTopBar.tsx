import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import useLayoutStore from '@/stores/layoutStore';
import { useAuth } from '@/hooks/useAuth';
import { useScreenSize } from '@/hooks/useScreenSize';

const CourierTopBar = () => {
  const { toggleSidebar } = useLayoutStore();
  const { profile } = useAuth();
  const { isMobile } = useScreenSize();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Courier Dashboard
          </h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
        </Button>

        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-white text-xs">
              {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          {!isMobile && (
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white">
                {profile?.full_name || 'Courier'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                ID: {profile?.id?.slice(-6).toUpperCase() || 'N/A'}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CourierTopBar;