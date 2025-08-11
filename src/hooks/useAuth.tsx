
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'client' | 'admin' | 'courier';
  phone?: string;
  business_name?: string;
  business_type?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: user?.email || '',
        full_name: data.full_name || '',
        user_type: data.user_type as 'client' | 'admin' | 'courier',
        phone: data.phone,
        business_name: data.business_name,
        business_type: data.business_type,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Removed sensitive logging for production security
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetching to avoid blocking the auth state change
        if (session?.user) {
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id);
            setProfile(userProfile);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(userProfile => {
          setProfile(userProfile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !password) {
        return { error: { message: 'Email and password are required' } };
      }
      
      if (password.length < 6) {
        return { error: { message: 'Password must be at least 6 characters' } };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      // Log failed login attempts for security monitoring
      if (error) {
        try {
          await supabase.rpc('log_security_event', {
            event_type: 'login_failed',
            entity_id: null,
            details: { email: email.trim().toLowerCase(), error: 'Authentication failed' } // Generic error for security
          });
        } catch (logError) {
          // Ignore logging errors to prevent blocking authentication
        }
        // Return generic error message to prevent user enumeration
        return { error: { message: 'Invalid email or password' } };
      }

      return { error };
    } catch (error) {
      return { error: { message: 'Authentication failed' } };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // Input validation
      if (!email || !password) {
        return { error: { message: 'Email and password are required' } };
      }
      
      if (password.length < 6) {
        return { error: { message: 'Password must be at least 6 characters' } };
      }

      // Validate business name length
      if (userData.business_name && userData.business_name.length > 200) {
        return { error: { message: 'Business name must be less than 200 characters' } };
      }

      // Validate full name length
      if (userData.full_name && userData.full_name.length > 100) {
        return { error: { message: 'Full name must be less than 100 characters' } };
      }

      // Sanitize input data
      const sanitizedData = {
        full_name: userData.full_name?.trim(),
        user_type: userData.user_type === 'admin' ? 'client' : (userData.user_type || 'client'), // Prevent admin signup
        phone: userData.phone?.trim(),
        business_name: userData.business_name?.trim(),
        business_type: userData.business_type?.trim() || 'Fashion & Apparel',
      };

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: sanitizedData
        }
      });

      // Log signup attempts
      try {
        await supabase.rpc('log_security_event', {
          event_type: error ? 'signup_failed' : 'signup_success',
          entity_id: null,
          details: { 
            email: email.trim().toLowerCase(), 
            business_name: sanitizedData.business_name,
            error: error ? 'Registration failed' : undefined // Generic error for security
          }
        });
      } catch (logError) {
        // Ignore logging errors to prevent blocking authentication
      }

      return { error };
    } catch (error) {
      return { error: { message: 'Registration failed. Please try again.' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      setUser(null);
      setProfile(null);
      setSession(null);
      // Force a page reload to clear any cached state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
