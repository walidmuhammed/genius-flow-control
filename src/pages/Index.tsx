
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Topspeed - Mission Control";
    
    // Redirect authenticated users to their dashboard
    if (user && profile) {
      const redirectPath = profile.user_type === 'admin' ? '/admin' : '/dashboard';
      navigate(redirectPath);
    }
  }, [user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#DB271E] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#DB271E] rounded-3xl mb-8">
          <Truck className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Topspeed
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your trusted courier and delivery management platform
        </p>
        
        <div className="space-y-4">
          <p className="text-gray-500">
            Streamline your delivery operations with our comprehensive logistics solution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/sign-in')}
              className="bg-[#DB271E] hover:bg-[#c0211a] text-white px-8 py-3 text-lg"
            >
              Get Started
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/sign-in')}
              className="border-[#DB271E] text-[#DB271E] hover:bg-[#DB271E] hover:text-white px-8 py-3 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-gray-400">
          © 2024 Topspeed. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Index;
