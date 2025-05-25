
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
      navigate('/dashboard/admin');
    }
  }, [user, navigate]);

  // Only render client dashboard for client users
  if (user?.user_type === 'client') {
    return <Dashboard />;
  }

  return <Dashboard />;
};

export default Index;
