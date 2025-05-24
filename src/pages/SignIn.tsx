
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, ArrowRight, Building2, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const SignIn = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    document.title = "Sign In - Topspeed";
    
    // Redirect if already authenticated
    if (!loading && user && profile) {
      if (profile.user_type === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }
    }
  }, [navigate, user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin text-[#DB271E] mx-auto mb-4 rounded-full border-2 border-current border-t-transparent" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
      >
        {/* Logo/Branding */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-[#DB271E] rounded-3xl mb-6"
          >
            <Truck className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Topspeed</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Lebanon's premier delivery management platform. Choose your access type to continue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Client Access */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 mx-auto group-hover:bg-blue-200 transition-colors">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Business Owner
                </CardTitle>
                <CardDescription className="text-base">
                  Manage your deliveries, track orders, and grow your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Create and manage delivery orders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Track real-time order status</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Manage customer information</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>View analytics and reports</span>
                  </div>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Link to="/auth/signin">
                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 group">
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button variant="outline" className="w-full h-11 border-blue-200 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-all duration-200">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Access */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4 mx-auto group-hover:bg-red-200 transition-colors">
                  <Shield className="h-8 w-8 text-[#DB271E]" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Delivery Admin
                </CardTitle>
                <CardDescription className="text-base">
                  Manage operations, couriers, and system oversight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#DB271E] rounded-full" />
                    <span>Oversee all delivery operations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#DB271E] rounded-full" />
                    <span>Manage courier assignments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#DB271E] rounded-full" />
                    <span>Handle customer support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#DB271E] rounded-full" />
                    <span>System administration</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link to="/auth/admin">
                    <Button className="w-full h-11 bg-[#DB271E] hover:bg-[#c0211a] text-white font-medium rounded-lg transition-all duration-200 group">
                      Admin Access
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2024 Topspeed. Lebanon's trusted delivery partner.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
