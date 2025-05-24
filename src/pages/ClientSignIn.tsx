
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Mail, Lock, Shield } from 'lucide-react';

const ClientSignIn = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting sign in with:', emailOrPhone);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password: password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      console.log('Sign in successful:', data.user?.id);

      if (data.user) {
        // Wait a moment for the auth state to update
        setTimeout(() => {
          navigate('/');
        }, 100);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DB271E] rounded-2xl mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your business account</p>
        </div>

        {/* Client Sign In */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your delivery dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="emailOrPhone"
                  type="email"
                  placeholder="Enter your email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
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
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

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

            <div className="mt-6 space-y-3 text-center">
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

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Topspeed. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientSignIn;
