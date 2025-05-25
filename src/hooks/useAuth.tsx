
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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
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
      const { data, error } = await supabase.rpc('get_user_profile', { user_id: userId });
      
      if (error || !data || data.length === 0) {
        // Use user metadata as fallback
        if (user) {
          const defaultProfile = createDefaultProfile(user);
          setProfile(defaultProfile);
        }
        return;
      }
      
      const profileData = data[0] as UserProfile;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use user metadata as fallback
      if (user) {
        const defaultProfile = createDefaultProfile(user);
        setProfile(defaultProfile);
      }
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
