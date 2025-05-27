
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'client' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (name: string, email: string, role: 'client' | 'admin') => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('topspeed_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('topspeed_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = (name: string, email: string, role: 'client' | 'admin') => {
    const userData: UserProfile = {
      id: Date.now().toString(),
      email: email || `${role}@example.com`,
      full_name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      user_type: role,
    };
    
    setUser(userData);
    localStorage.setItem('topspeed_user', JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('topspeed_user');
    // Force a page reload to clear any cached state
    window.location.href = '/auth';
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
