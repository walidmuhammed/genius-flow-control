import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface CourierProtectedRouteProps {
  children: React.ReactNode;
}

const CourierProtectedRoute: React.FC<CourierProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('CourierProtectedRoute check:', { 
    loading, 
    hasUser: !!user, 
    userType: profile?.user_type,
    currentPath: location.pathname 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying courier access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to courier signin');
    return <Navigate to="/auth/courier" state={{ from: location }} replace />;
  }

  if (!profile) {
    console.log('No profile found, redirecting to courier signin');
    return <Navigate to="/auth/courier" state={{ from: location }} replace />;
  }

  if (profile.user_type !== 'courier') {
    console.log('User is not a courier, user type:', profile.user_type);
    return <Navigate to="/auth/courier" state={{ from: location }} replace />;
  }

  // Check if courier is pending approval
  if (profile.user_type === 'courier') {
    // For pending couriers, show pending approval screen
    if (location.pathname !== '/dashboard/courier/pending') {
      // We'll redirect to pending page later, for now just show message
      console.log('Courier access granted but may be pending');
    }
  }

  console.log('Courier access granted');
  return <>{children}</>;
};

export default CourierProtectedRoute;