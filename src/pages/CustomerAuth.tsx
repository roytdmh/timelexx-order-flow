import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LandingNav } from '@/components/LandingNav';
import { Users } from 'lucide-react';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Normalize username to lowercase for validation and storage
      const normalizedUsername = username.toLowerCase();
      
      // Validate username format (alphanumeric and underscore only)
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
        throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      }

      // Check if username already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', `${normalizedUsername}@timelexx.customer`)
        .single();

      if (existingProfile) {
        throw new Error('Username already taken');
      }

      // Create email from username for Supabase auth (internal use only)
      const internalEmail = `${normalizedUsername}@timelexx.customer`;
      
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: internalEmail,
        password,
        options: { 
          emailRedirectTo: redirectUrl,
          data: { username: normalizedUsername }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: authData.user.id,
          full_name: fullName,
          phone_number: phone,
          location: location,
          email: internalEmail
        });

        if (profileError) throw profileError;

        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'customer'
        });

        if (roleError) throw roleError;

        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Normalize username to lowercase for authentication
      const normalizedUsername = username.toLowerCase();
      
      // Convert username to internal email format
      const internalEmail = `${normalizedUsername}@timelexx.customer`;
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email: internalEmail, 
        password 
      });
      if (error) throw error;
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen timelexx-gradient">
      <LandingNav />
      
      <div className="pt-24 pb-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-premium-lg">
          <CardHeader className="text-center">
            <Users className="w-16 h-16 text-timelexx-red mx-auto mb-4" />
            <CardTitle className="text-2xl">Customer Portal</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-username">Username</Label>
                    <Input
                      id="signin-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username (3-20 characters)"
                      pattern="[a-zA-Z0-9_]{3,20}"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Letters, numbers, and underscores only
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-location">Location</Label>
                    <Input
                      id="signup-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 6 characters
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerAuth;
