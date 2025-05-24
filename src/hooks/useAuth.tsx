
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  business_name: string | null;
  business_type: string | null;
  user_type: 'client' | 'admin';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,
  signOut: async () => {},
  refreshProfile: async () => {},
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createDefaultProfile = (user: User): UserProfile => {
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      phone: user.user_metadata?.phone || null,
      business_name: user.user_metadata?.business_name || null,
      business_type: user.user_metadata?.business_type || null,
      user_type: user.user_metadata?.user_type || 'client'
    };
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase.rpc('get_user_profile', { user_id: userId });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        // Create default profile if fetch fails
        if (user) {
          const defaultProfile = createDefaultProfile(user);
          setProfile(defaultProfile);
          setError(null);
        }
        return;
      }
      
      if (data && data.length > 0) {
        const profileData = data[0] as UserProfile;
        console.log('Profile data received:', profileData);
        setProfile(profileData);
        setError(null);
      } else {
        console.log('No profile found, creating default profile');
        if (user) {
          const defaultProfile = createDefaultProfile(user);
          setProfile(defaultProfile);
          setError(null);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Always create a fallback profile to prevent infinite loading
      if (user) {
        const defaultProfile = createDefaultProfile(user);
        setProfile(defaultProfile);
      }
      setError(null); // Don't show errors to user for profile issues
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && mounted) {
        // Use setTimeout to prevent blocking the auth state change
        timeoutId = setTimeout(() => {
          if (mounted) {
            fetchUserProfile(session.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
        setError(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuthStateChange('INITIAL_SESSION', session);
      }
    });

    // Failsafe timeout to prevent infinite loading
    const failsafeTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('Failsafe: Setting loading to false');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(failsafeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
