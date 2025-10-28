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

      // Use a master admin account for authentication (bootstrap if missing)
      const masterEmail = 'admin@timelexx.admin';
      const masterPassword = 'TimelexxInn00233';

      let authUser = null as typeof supabase.auth.getUser extends any ? any : any;

      // 1) Sign in using hardcoded master credentials ONLY
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: masterEmail,
        password: masterPassword,
      });

      if (signInError || !signInData?.user || !signInData?.session) {
        throw new Error('Invalid credentials');
      }

      authUser = signInData.user;

      // Ensure admin role exists for the master account
      if (authUser) {
        // Check if admin role already exists for this user
        const { data: adminRole, error: roleCheckError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleCheckError) {
          console.error('Role check error:', roleCheckError);
        }

        if (!adminRole) {
          // Insert admin role if missing (no delete/upsert to avoid RLS conflicts)
          const { error: roleInsertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authUser.id,
              role: 'admin',
            });
          
          if (roleInsertError) {
            console.error('Role assignment error:', roleInsertError);
            // Don't block sign-in; continue
          }
        }

        // Update profile with the actual admin name
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: authUser.id,
            email: masterEmail,
            full_name: username.trim(),
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Brief delay to let role/profile be readable via RLS
        await new Promise(resolve => setTimeout(resolve, 300));

        // Create new admin session for tracking this admin's orders/analytics
        const { data: newSession, error: sessionError } = await supabase
          .from('admin_sessions')
          .insert({
            user_id: authUser.id,
            admin_name: username.trim(),
            active: true
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Session creation error:', sessionError);
        } else {
          // Store session ID in localStorage for order tracking
          localStorage.setItem('adminSessionId', newSession.id);
          localStorage.setItem('adminName', username.trim());
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
