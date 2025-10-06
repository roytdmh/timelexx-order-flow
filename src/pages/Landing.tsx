import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShieldCheck, Bike } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin' | 'rider'>('customer');

  const handleRoleSelect = (role: 'customer' | 'admin' | 'rider') => {
    setSelectedRole(role);
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen timelexx-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-premium-lg">
        <CardHeader className="text-center">
          <img
            src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
            alt="Timelexx Inn Logo"
            className="h-32 mx-auto object-contain mb-4"
          />
          <CardTitle className="text-3xl font-bold">Welcome to Timelexx Inn</CardTitle>
          <CardDescription className="text-lg italic">Eat good, Feel good</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="rider">Rider</TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-4">
              <div className="flex flex-col items-center space-y-4 p-6">
                <Users className="w-16 h-16 text-timelexx-red" />
                <h3 className="text-xl font-semibold">Customer Portal</h3>
                <p className="text-center text-muted-foreground">
                  Order delicious meals, track your orders, and view your order history
                </p>
                <Button 
                  onClick={() => handleRoleSelect('customer')}
                  className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                >
                  Continue as Customer
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="flex flex-col items-center space-y-4 p-6">
                <ShieldCheck className="w-16 h-16 text-timelexx-red" />
                <h3 className="text-xl font-semibold">Admin Portal</h3>
                <p className="text-center text-muted-foreground">
                  Full access to manage orders, track riders, view analytics and reports
                </p>
                <Button 
                  onClick={() => handleRoleSelect('admin')}
                  className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                >
                  Admin Sign In
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rider" className="space-y-4">
              <div className="flex flex-col items-center space-y-4 p-6">
                <Bike className="w-16 h-16 text-timelexx-red" />
                <h3 className="text-xl font-semibold">Rider Portal</h3>
                <p className="text-center text-muted-foreground">
                  View and manage your assigned delivery orders
                </p>
                <Button 
                  onClick={() => handleRoleSelect('rider')}
                  className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                >
                  Rider Sign In
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Landing;
