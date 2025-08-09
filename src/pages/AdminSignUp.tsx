import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Mail, Phone, User, Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    // Input sanitization and length limits
    let sanitizedValue = value;
    
    switch (field) {
      case 'fullName':
        sanitizedValue = value.slice(0, 100);
        break;
      case 'phone':
        sanitizedValue = value.slice(0, 20);
        break;
      case 'email':
        sanitizedValue = value.trim().toLowerCase().slice(0, 254);
        break;
      case 'adminCode':
        sanitizedValue = value.slice(0, 50);
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.adminCode) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Simple admin code validation (you can make this more secure)
    if (formData.adminCode !== 'TOPSPEED2024') {
      setError('Invalid admin access code');
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
        user_type: 'admin'
      });

      if (signUpError) throw signUpError;

      // Navigate to admin dashboard
      navigate('/dashboard/admin');
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
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
            <Shield className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Registration</h1>
          <p className="text-gray-300">Create administrator account</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center text-gray-900">
              Create Admin Account
            </CardTitle>
            <CardDescription className="text-center">
              Register as a platform administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Security Warning */}
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm">
                Admin registration requires a valid access code. Contact system administrator if you don't have one.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    maxLength={100}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    maxLength={20}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* Admin Access Code */}
              <div className="border-t pt-4 space-y-2">
                <Label htmlFor="adminCode" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Access Code *
                </Label>
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Enter admin access code"
                  value={formData.adminCode}
                  onChange={(e) => handleInputChange('adminCode', e.target.value)}
                  maxLength={50}
                  required
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    minLength={6}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Admin Account
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>🔒 Secure admin registration • Authorized personnel only</p>
          <p className="mt-1">© 2024 Topspeed. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSignUp;