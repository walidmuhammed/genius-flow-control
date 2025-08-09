import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, Store, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  { value: 'client', label: 'Client', icon: Store, description: 'Business owner sending packages' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Platform administrator' },
  { value: 'courier', label: 'Courier', icon: Truck, description: 'Delivery person' }
];

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin' | 'courier'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  useEffect(() => {
    document.title = "Sign In - Topspeed";
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select your role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        throw signInError;
      }

      // Wait a moment for auth state to update, then navigate
      setTimeout(() => {
        switch (selectedRole) {
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'courier':
            navigate('/dashboard/courier');
            break;
          default:
            navigate('/dashboard/client');
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
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
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4"
          >
            <Truck className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Topspeed account</p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Role Selector */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Sign in as *
                </Label>
                <Select value={selectedRole} onValueChange={(value: 'client' | 'admin' | 'courier') => setSelectedRole(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => {
                      const IconComponent = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value} className="p-3">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertDescription className="text-destructive text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-medium transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    {selectedRole === 'admin' && <Shield className="mr-2 h-4 w-4" />}
                    {selectedRole === 'client' && <Store className="mr-2 h-4 w-4" />}
                    {selectedRole === 'courier' && <Truck className="mr-2 h-4 w-4" />}
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2024 Topspeed. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;