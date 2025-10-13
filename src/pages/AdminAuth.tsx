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
      // Validate username format (alphanumeric, spaces, and underscore only)
      if (!username.trim() || username.length < 2 || username.length > 50) {
        throw new Error('Please enter a valid name (2-50 characters)');
      }

      // Check predetermined code
      if (password !== 'TimelexxInn00233') {
        throw new Error('Invalid access code');
      }

      // Store admin name in localStorage for report generation
      localStorage.setItem('adminName', username.trim());

      // Use a master admin account for authentication
      const masterEmail = 'admin@timelexx.admin';
      const masterPassword = 'TimelexxInn00233';
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({ 
        email: masterEmail, 
        password: masterPassword 
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
      
      toast.success(`Welcome ${username.trim()}!`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid name or access code');
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
            <CardDescription>Enter your name and access code to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="admin-username">Your Name</Label>
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This name will appear on generated reports
                </p>
              </div>
              <div>
                <Label htmlFor="admin-password">Access Code</Label>
                <Input
                  id="admin-password"
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
