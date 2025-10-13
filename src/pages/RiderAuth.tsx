import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LandingNav } from '@/components/LandingNav';
import { Bike } from 'lucide-react';
import { RIDERS } from '@/data/riders';

const RiderAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [riderName, setRiderName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (roleData?.role) {
          navigate('/dashboard');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rider = RIDERS.find(r => r.name === riderName);
      if (!rider) {
        throw new Error('Invalid rider selection');
      }

      // Check predetermined code
      if (password !== 'TimelexxInn00233') {
        throw new Error('Invalid access code');
      }

      // Use master rider account for authentication
      const masterEmail = 'rider@timelexx.com';
      const masterPassword = 'TimelexxInn00233';
      
      let authUser = null as typeof supabase.auth.getUser extends any ? any : any;

      // 1) Try sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: masterEmail,
        password: masterPassword,
      });

      if (signInError) {
        // 2) If invalid credentials/user not found, create the master rider account
        const redirectUrl = `${window.location.origin}/`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: masterEmail,
          password: masterPassword,
          options: { emailRedirectTo: redirectUrl },
        });

        if (signUpError && (signUpError as any).status !== 422) {
          // 422 means already exists; anything else is a real error
          throw signUpError;
        }

        if (signUpData?.user) {
          authUser = signUpData.user;
        } else {
          // If already exists, retry sign in
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: masterEmail,
            password: masterPassword,
          });
          if (retryError) throw retryError;
          authUser = retryData.user;
        }
      } else {
        authUser = signInData.user;
      }
      
      // Verify rider role exists (create if missing)
      if (authUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .maybeSingle();
        
        if (!roleData || roleData.role !== 'rider') {
          const { error: roleInsertError } = await supabase.from('user_roles').insert({
            user_id: authUser.id,
            role: 'rider',
          });
          if (roleInsertError) {
            console.error('Role assignment error:', roleInsertError);
            // proceed anyway
          }
        }
        
        // Store rider name in localStorage for tracking
        localStorage.setItem('riderName', rider.name);
      }
      
      toast.success(`Welcome ${rider.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
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
            <Bike className="w-16 h-16 text-timelexx-red mx-auto mb-4" />
            <CardTitle className="text-2xl">Rider Portal</CardTitle>
            <CardDescription>Select your name and enter access code to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="rider-name">Rider Name</Label>
                <Select value={riderName} onValueChange={setRiderName} required>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select your name" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {RIDERS.map((rider) => (
                      <SelectItem key={rider.id} value={rider.name}>
                        {rider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rider-password">Access Code</Label>
                <Input
                  id="rider-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In as Rider'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiderAuth;
