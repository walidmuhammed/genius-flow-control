
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from './Dashboard';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Topspeed - Mission Control";
    
    // Redirect admin users to their dashboard
    if (user?.user_type === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // If no user, show signin
  if (!user) {
    return <Dashboard />;
  }

  // Show appropriate dashboard based on user type
  if (user.user_type === 'admin') {
    navigate('/admin');
    return null;
  }

  return <Dashboard />;
};

export default Index;
