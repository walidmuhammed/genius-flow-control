
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Mail, Lock } from 'lucide-react';

const AdminSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Sign In - Topspeed";
    
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user has admin profile
        try {
          const { data: profileData } = await supabase.rpc('get_user_profile', { user_id: session.user.id });
          if (profileData && profileData.length > 0 && profileData[0].user_type === 'admin') {
            navigate('/dashboard/admin');
          }
        } catch (error) {
          console.error('Error checking admin profile:', error);
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Admin attempting sign in with:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Admin sign in error:', signInError);
        throw signInError;
      }

      if (data.user) {
        console.log('Admin sign in successful, checking profile...');
        
        // Get user profile to verify admin role
        const { data: profileData } = await supabase.rpc('get_user_profile', { user_id: data.user.id });
        
        if (!profileData || profileData.length === 0 || profileData[0].user_type !== 'admin') {
          setError('Access denied. Admin credentials required.');
          await supabase.auth.signOut();
          return;
        }

        console.log('Admin access granted');
        navigate('/dashboard/admin');
      }
    } catch (err: any) {
      console.error('Admin sign in failed:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid admin credentials. Please check your email and password.');
      } else {
        setError(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DB271E] rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-gray-300">Delivery Management System</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center text-gray-900">
              Admin Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Access the delivery management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500">
                Need client access?{' '}
                <Link to="/auth/signin" className="text-[#DB271E] hover:underline font-medium">
                  Client Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>🔒 Secure admin access • Authorized personnel only</p>
          <p className="mt-1">© 2024 Topspeed. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
