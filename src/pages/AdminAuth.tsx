import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LandingNav } from '@/components/LandingNav';
import { ShieldCheck } from 'lucide-react';

const AdminAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
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
      // Normalize username to lowercase for authentication
      const normalizedUsername = username.toLowerCase();
      
      // Validate username format (alphanumeric and underscore only)
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
        throw new Error('Invalid username format');
      }

      // Check predetermined password
      if (password !== 'TimelexxInn00233') {
        throw new Error('Invalid password');
      }

      // Convert username to internal email format for Supabase auth
      const internalEmail = `${normalizedUsername}@timelexx.admin`;
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({ 
        email: internalEmail, 
        password 
      });
      
      if (error) throw error;
      
      // Verify admin role exists
      if (authData.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .maybeSingle();
        
        if (!roleData || roleData.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Account does not have admin privileges');
        }
      }
      
      toast.success('Admin signed in successfully!');
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
            <ShieldCheck className="w-16 h-16 text-timelexx-red mx-auto mb-4" />
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>Sign in to access admin features</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="admin-username">Admin Username</Label>
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your admin username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In as Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
