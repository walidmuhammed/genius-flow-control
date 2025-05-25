
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SignIn = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin'>('client');
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  useEffect(() => {
    document.title = "Sign In - Topspeed";
    
    // Redirect if already signed in
    if (user) {
      const redirectPath = user.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/client';
      navigate(redirectPath);
    }
  }, [navigate, user]);

  const handleSignIn = () => {
    signIn(name, email, selectedRole);
    
    // Immediate redirect
    const redirectPath = selectedRole === 'admin' ? '/dashboard/admin' : '/dashboard/client';
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DB271E] rounded-2xl mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Topspeed</h1>
          <p className="text-gray-600">Quick access to your dashboard</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your details and select your role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Select Your Role</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    selectedRole === 'client'
                      ? 'border-[#DB271E] bg-[#DB271E]/5 text-[#DB271E]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Client</div>
                  <div className="text-xs text-gray-500">Business Dashboard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    selectedRole === 'admin'
                      ? 'border-[#DB271E] bg-[#DB271E]/5 text-[#DB271E]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Admin</div>
                  <div className="text-xs text-gray-500">Management Panel</div>
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={handleSignIn}
              className="w-full h-11 bg-[#DB271E] hover:bg-[#c0211a] text-white font-medium"
            >
              Sign In as {selectedRole === 'client' ? 'Client' : 'Admin'}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2024 Topspeed. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
