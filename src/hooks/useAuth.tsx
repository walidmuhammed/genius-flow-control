
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  full_name?: string;
  user_type: 'client' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (name: string, email: string, role: 'client' | 'admin') => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('topspeed_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('topspeed_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = (name: string, email: string, role: 'client' | 'admin') => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email || `${role}@topspeed.com`,
      full_name: name || `${role} User`,
      user_type: role
    };
    
    setUser(newUser);
    localStorage.setItem('topspeed_user', JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('topspeed_user');
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
