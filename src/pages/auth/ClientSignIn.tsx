
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRateLimit } from '@/hooks/useRateLimit';
import { getGenericErrorMessage } from '@/utils/securityLogger';

const ClientSignIn = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Rate limiting for security
  const rateLimit = useRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
  });

  useEffect(() => {
    document.title = "Sign In - Topspeed";
    
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  const isEmail = (input: string) => {
    return input.includes('@');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    const rateLimitCheck = rateLimit.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.message || 'Too many attempts. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For now, we'll sign in with email. Phone authentication can be added later
      const sanitizedEmail = emailOrPhone.trim().toLowerCase();
      const signInData = isEmail(sanitizedEmail) 
        ? { email: sanitizedEmail, password }
        : { email: sanitizedEmail, password }; // Assume it's email for now

      const { data, error: signInError } = await supabase.auth.signInWithPassword(signInData);

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Get user profile to check role
        const { data: profileData } = await supabase.rpc('get_user_profile', { user_id: data.user.id });
        
        if (profileData && profileData.length > 0 && profileData[0].user_type === 'admin') {
          setError('Please use the admin sign-in page to access your account.');
          await supabase.auth.signOut();
          return;
        }

        navigate('/');
      }
    } catch (err: any) {
      rateLimit.recordAttempt();
      setError(getGenericErrorMessage('auth'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#DB271E] rounded-2xl mb-4"
          >
            <LogIn className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your business account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Client Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your delivery dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email or Phone */}
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email or Phone Number
                </Label>
                <Input
                  id="emailOrPhone"
                  type="text"
                  placeholder="Enter your email or phone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#DB271E] bg-gray-100 border-gray-300 rounded focus:ring-[#DB271E] focus:ring-2"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#DB271E] hover:bg-[#c0211a] text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 space-y-3 text-center">
              <button className="text-sm text-gray-600 hover:text-[#DB271E] transition-colors duration-200">
                Forgot your password?
              </button>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-[#DB271E] hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
              <div className="text-sm text-gray-500">
                Are you a delivery admin?{' '}
                <Link to="/auth/admin" className="text-[#DB271E] hover:underline font-medium">
                  Admin Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2024 Topspeed. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientSignIn;
