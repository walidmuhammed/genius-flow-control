
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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase.rpc('get_user_profile', { user_id: userId });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const profileData = data[0] as UserProfile;
        console.log('Profile data received:', profileData);
        setProfile(profileData);
        setError(null);
      } else {
        console.log('No profile found, creating default profile');
        // Create a default profile if none exists
        const defaultProfile: UserProfile = {
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || null,
          phone: user?.user_metadata?.phone || null,
          business_name: user?.user_metadata?.business_name || null,
          business_type: user?.user_metadata?.business_type || null,
          user_type: 'client'
        };
        setProfile(defaultProfile);
        setError(null);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError('Failed to load user profile');
      // Set a minimal profile to prevent infinite loading
      setProfile({
        id: userId,
        email: user?.email || '',
        full_name: null,
        phone: null,
        business_name: null,
        business_type: null,
        user_type: 'client'
      });
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setError(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && mounted) {
        await fetchUserProfile(session.user.id);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
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
      setError('Failed to sign out');
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
