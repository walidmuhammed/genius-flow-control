import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Building2, Mail, Phone, User, Lock, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import BusinessTypeSelector from '@/components/auth/BusinessTypeSelector';

const ClientSignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    password: '',
    confirmPassword: '',
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
      case 'businessName':
        sanitizedValue = value.slice(0, 200);
        break;
      case 'phone':
        sanitizedValue = value.slice(0, 20);
        break;
      case 'email':
        sanitizedValue = value.trim().toLowerCase().slice(0, 254);
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.businessName || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!formData.businessType) {
      setError('Please select your business type');
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
        business_name: formData.businessName,
        business_type: formData.businessType,
        user_type: 'client'
      });

      if (signUpError) throw signUpError;

      // Navigate to client dashboard
      navigate('/dashboard/client');
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
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
        className="w-full max-w-2xl"
      >
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4"
          >
            <Store className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Create Client Account</h1>
          <p className="text-muted-foreground">Start managing your deliveries today</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Business Registration</CardTitle>
            <CardDescription className="text-center">
              Set up your business account for delivery management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Business Information */}
              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    maxLength={200}
                    required
                    className="h-11"
                  />
                </div>

                <BusinessTypeSelector
                  value={formData.businessType}
                  onChange={(value) => handleInputChange('businessType', value)}
                  error={error && !formData.businessType ? 'Please select your business type' : undefined}
                />
              </div>

              {/* Password */}
              <div className="border-t pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertDescription className="text-destructive text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-medium transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create My Account
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-primary hover:underline font-medium">
                  Sign in here
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

export default ClientSignUp;