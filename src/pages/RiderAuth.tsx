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
        navigate('/dashboard');
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

      const email = `${rider.name.toLowerCase()}@timelexx.com`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
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
            <CardDescription>Sign in to view your deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="rider-name">Rider Name</Label>
                <Select value={riderName} onValueChange={setRiderName} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your name" />
                  </SelectTrigger>
                  <SelectContent>
                    {RIDERS.map((rider) => (
                      <SelectItem key={rider.id} value={rider.name}>
                        {rider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rider-password">Password</Label>
                <Input
                  id="rider-password"
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
