import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Store, Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  { 
    value: 'client', 
    label: 'Client', 
    icon: Store, 
    description: 'Business owner sending packages',
    features: ['Manage orders', 'Track deliveries', 'Customer management', 'Billing & invoices'],
    route: '/auth/client-signup'
  },
  { 
    value: 'admin', 
    label: 'Admin', 
    icon: Shield, 
    description: 'Platform administrator',
    features: ['Manage all users', 'System settings', 'Analytics', 'Financial oversight'],
    route: '/auth/admin-signup'
  },
  { 
    value: 'courier', 
    label: 'Courier', 
    icon: Truck, 
    description: 'Delivery person',
    features: ['View assigned orders', 'Update delivery status', 'Earnings tracking', 'Route optimization'],
    route: '/auth/courier-signup'
  }
];

const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up - Topspeed";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Join Topspeed</h1>
          <p className="text-muted-foreground">Choose your account type to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <motion.div
                key={role.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Card 
                  className="relative h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 hover:border-primary/50"
                  onClick={() => navigate(role.route)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{role.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      {role.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-center text-primary font-medium group-hover:text-primary/80 transition-colors">
                      <span className="mr-2">Get Started</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2024 Topspeed. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;