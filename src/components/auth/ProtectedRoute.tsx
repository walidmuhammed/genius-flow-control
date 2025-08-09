
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'client' | 'admin' | 'courier';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#DB271E] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && profile.user_type !== requiredRole) {
    const getRedirectPath = () => {
      switch (profile.user_type) {
        case 'admin':
          return '/dashboard/admin';
        case 'courier':
          return '/dashboard/courier';
        default:
          return '/dashboard/client';
      }
    };
    return <Navigate to={getRedirectPath()} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
