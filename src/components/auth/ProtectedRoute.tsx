
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading, error } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', { user: !!user, profile, loading, error, requiredRole });

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-[#DB271E] hover:bg-[#c0211a]"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  if (requiredRole && profile.user_type !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    const redirectPath = profile.user_type === 'admin' ? '/dashboard/admin' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
