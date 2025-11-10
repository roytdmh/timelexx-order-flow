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
import { validateAccessCode, getAccessCode } from '@/utils/accessCodeValidator';
import { ImageCarousel } from '@/components/ImageCarousel';
import timelexxMenu from '@/assets/timelexx-menu.jpeg';
import timelexxLogo from '@/assets/timelexx-logo.png';

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
      // Validate username format
      if (!username.trim() || username.length < 2 || username.length > 50) {
        throw new Error('Please enter a valid name (2-50 characters)');
      }

      // Check predetermined code
      if (!validateAccessCode(password)) {
        throw new Error('Invalid access code');
      }

      // Create unique email based on admin name to avoid session conflicts
      const sanitizedName = username.trim().toLowerCase().replace(/\s+/g, '');
      const adminEmail = `${sanitizedName}@timelexx.admin`;
      const adminPassword = getAccessCode();

      let authUser = null as typeof supabase.auth.getUser extends any ? any : any;

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (signInError) {
        // If sign in fails, create the account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: username.trim(),
            }
          }
        });

        if (signUpError) {
          throw new Error('Failed to create admin account');
        }

        // Now sign in with the newly created account
        const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (newSignInError || !newSignInData?.user) {
          throw new Error('Failed to sign in after account creation');
        }

        authUser = newSignInData.user;
      } else {
        authUser = signInData?.user;
      }

      if (!authUser) {
        throw new Error('Authentication failed');
      }

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
            email: adminEmail,
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
      // Small delay to let auth listener propagate to dashboard before route change
      await new Promise(resolve => setTimeout(resolve, 200));
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
      
      <div className="pt-40 sm:pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <img
              src={timelexxLogo}
              alt="Timelexx Inn Logo"
              className="h-20 sm:h-24 md:h-32 lg:h-40 mx-auto object-contain mb-4 sm:mb-6"
              style={{
                filter: 'brightness(1.1) contrast(1.2) saturate(1.3)'
              }}
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-4">
              Welcome to Timelexx Inn
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 italic font-serif px-4">
              Eat good, Feel good
            </p>
          </div>

          {/* Admin Login Card */}
          <div className="flex items-center justify-center mb-8">
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

          {/* Carousel Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ImageCarousel />
          </div>

          {/* Menu Section */}
          <div className="animate-fade-in px-4" style={{ animationDelay: '0.4s' }}>
            <div className="relative max-w-4xl mx-auto">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-premium-lg">
                <img
                  src={timelexxMenu}
                  alt="Timelexx Inn Menu"
                  className="w-full h-auto"
                  style={{
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 10%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.9) 90%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 10%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.9) 90%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
