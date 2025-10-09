import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RIDERS } from '@/data/riders';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'customer' | 'admin' | 'rider' || 'customer';
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleAdminRiderLogin = async () => {
    setLoading(true);
    try {
      // Validate password
      if (password !== 'TimelexxInn00233') {
        toast({
          title: 'Invalid Credentials',
          description: 'Incorrect password',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // For admin/rider, create account with username@timelexx.local as email
      const email = `${username.toLowerCase().replace(/\s+/g, '')}@timelexx.local`;
      
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If sign in fails, create new account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: username,
              role: role,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Wait for trigger to create profile
          await new Promise(resolve => setTimeout(resolve, 500));

          // Insert role into user_roles table
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: signUpData.user.id,
              role: role,
            });

          if (roleError && !roleError.message.includes('duplicate')) {
            console.error('Role insertion error:', roleError);
            throw roleError;
          }

          // Update profile with additional details
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: signUpData.user.id,
              email: email,
              full_name: username,
              phone_number: role === 'rider' ? username : null,
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
            throw profileError;
          }
        }
      } else {
        // Successfully signed in, check if role exists
        const { data: roleData, error: roleCheckError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', signInData.user.id)
          .eq('role', role)
          .single();

        if (roleCheckError || !roleData) {
          // Insert missing role
          await supabase
            .from('user_roles')
            .insert({
              user_id: signInData.user.id,
              role: role,
            });
        }
      }

      toast({
        title: 'Welcome!',
        description: `Signed in as ${role}`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleCustomerAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        // Customer login
        const email = `${username.toLowerCase().replace(/\s+/g, '')}@customer.timelexx.local`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: 'Welcome back!',
          description: `Signed in as ${username}`,
        });

        navigate('/dashboard');
      } else {
        // Customer signup
        if (!username || !password || !phone || !location) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in all fields',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const email = `${username.toLowerCase().replace(/\s+/g, '')}@customer.timelexx.local`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: username,
              phone_number: phone,
              location: location,
              role: 'customer',
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Wait for trigger to create profile
          await new Promise(resolve => setTimeout(resolve, 500));

          // Insert customer role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: 'customer',
            });

          if (roleError && !roleError.message.includes('duplicate')) {
            console.error('Role insertion error:', roleError);
            throw roleError;
          }

          // Update profile with full details
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: data.user.id,
              email: email,
              full_name: username,
              phone_number: phone,
              location: location,
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
            throw profileError;
          }
        }

        toast({
          title: 'Account Created!',
          description: 'You can now place orders',
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'customer') {
      handleCustomerAuth();
    } else {
      handleAdminRiderLogin();
    }
  };

  return (
    <div className="min-h-screen timelexx-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-premium-lg">
        <CardHeader className="text-center">
          <img
            src="/lovable-uploads/3b434d95-7b2c-4d7d-a0c2-8458f1f0999c.png"
            alt="Timelexx Inn Logo"
            className="h-24 mx-auto object-contain mb-2"
          />
          <CardTitle className="text-2xl">
            {role === 'customer' ? 'Customer' : role === 'admin' ? 'Admin' : 'Rider'} Portal
          </CardTitle>
          <CardDescription>
            {role === 'customer' ? (isLogin ? 'Sign in to your account' : 'Create a new account') : 'Sign in to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role === 'customer' ? (
            <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-location">Location</Label>
                    <Input
                      id="signup-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-username">
                  {role === 'rider' ? 'Select Rider' : 'Username'}
                </Label>
                {role === 'rider' ? (
                  <Select value={username} onValueChange={setUsername} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your name" />
                    </SelectTrigger>
                    <SelectContent>
                      {RIDERS.map(rider => (
                        <SelectItem key={rider.id} value={rider.name}>
                          {rider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="staff-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-password">Password</Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          )}

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
