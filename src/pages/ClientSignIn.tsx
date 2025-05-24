
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
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In - Topspeed";
    
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profileData } = await supabase.rpc('get_user_profile', { user_id: session.user.id });
        if (profileData && profileData.length > 0) {
          if (profileData[0].user_type === 'admin') {
            navigate('/dashboard/admin');
          } else {
            navigate('/');
          }
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  const isEmail = (input: string) => {
    return input.includes('@');
  };

  const handleClientSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        const { data: profileData } = await supabase.rpc('get_user_profile', { user_id: data.user.id });
        
        if (profileData && profileData.length > 0 && profileData[0].user_type === 'admin') {
          setError('Please use the admin section below to access your account.');
          await supabase.auth.signOut();
          return;
        }

        navigate('/');
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');

    // Hardcoded admin credentials for now
    if (adminUsername === 'admin' && adminPassword === 'admin') {
      // Simulate a brief loading state for UX
      setTimeout(() => {
        setAdminLoading(false);
        navigate('/dashboard/admin');
      }, 500);
    } else {
      setAdminError('Invalid admin credentials');
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#DB271E] rounded-xl mb-4">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your business account</p>
        </div>

        {/* Client Sign In */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-center">Client Sign In</CardTitle>
            <CardDescription className="text-center text-sm">
              Access your delivery dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClientSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email or Phone
                </Label>
                <Input
                  id="emailOrPhone"
                  type="text"
                  placeholder="Enter your email or phone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  className="h-10"
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
                  className="h-10"
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
                className="w-full h-10 bg-[#DB271E] hover:bg-[#c0211a] text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-[#DB271E] hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access Section */}
        <Card className="shadow-lg border border-gray-300 bg-gray-50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-center flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Access
            </CardTitle>
            <CardDescription className="text-center text-sm">
              For delivery management staff only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminUsername" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="adminUsername"
                  type="text"
                  placeholder="Enter admin username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              {adminError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">
                    {adminError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={adminLoading}
                className="w-full h-10 bg-gray-700 hover:bg-gray-800 text-white font-medium transition-all duration-200"
              >
                {adminLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accessing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Access
                  </>
                )}
              </Button>
            </form>
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
