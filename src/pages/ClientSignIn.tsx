
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ClientSignIn = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    document.title = "Sign In - Topspeed";
    
    // Redirect if already authenticated
    if (!authLoading && user && profile) {
      if (profile.user_type === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }
    }
  }, [navigate, user, profile, authLoading]);

  const handleClientSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Client attempting sign in with:', emailOrPhone);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password: password,
      });

      if (signInError) {
        console.error('Client sign in error:', signInError);
        throw signInError;
      }

      console.log('Client sign in successful:', data.user?.id);

      if (data.user) {
        // Small delay to ensure auth state updates
        setTimeout(() => {
          navigate('/');
        }, 100);
      }
    } catch (err: any) {
      console.error('Client sign in failed:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Temporary hardcoded admin credentials
      if (emailOrPhone === 'admin' && password === 'admin') {
        // Create a temporary admin session (this is temporary)
        console.log('Admin access granted with hardcoded credentials');
        navigate('/dashboard/admin');
      } else {
        setError('Invalid admin credentials. Use admin/admin for now.');
      }
    } catch (err: any) {
      console.error('Admin sign in failed:', err);
      setError('Admin sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#DB271E] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DB271E] rounded-2xl mb-4">
            {isAdminMode ? <Shield className="h-8 w-8 text-white" /> : <LogIn className="h-8 w-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isAdminMode ? 'Admin Access' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isAdminMode ? 'Admin dashboard access' : 'Sign in to your business account'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAdminMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Client
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAdminMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">
              {isAdminMode ? 'Admin Sign In' : 'Client Sign In'}
            </CardTitle>
            <CardDescription className="text-center">
              {isAdminMode ? 'Access the admin dashboard' : 'Access your delivery dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isAdminMode ? handleAdminSignIn : handleClientSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {isAdminMode ? 'Username' : 'Email'}
                </Label>
                <Input
                  id="emailOrPhone"
                  type={isAdminMode ? "text" : "email"}
                  placeholder={isAdminMode ? "Enter admin username" : "Enter your email"}
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
                    {isAdminMode ? <Shield className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {!isAdminMode && (
              <div className="mt-6 space-y-3 text-center">
                <div className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/auth/signup" className="text-[#DB271E] hover:underline font-medium">
                    Sign up here
                  </Link>
                </div>
              </div>
            )}

            {isAdminMode && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Temporary Admin Access:</strong><br />
                  Username: admin<br />
                  Password: admin
                </p>
              </div>
            )}
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
