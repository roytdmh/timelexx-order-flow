import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

type UserRole = 'customer' | 'admin' | 'rider';

interface UserProfile {
  full_name: string | null;
  phone_number: string | null;
  location: string | null;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setRole(data.role as UserRole);
    } else {
      setRole(null);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone_number, location, email')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session (do not flip loading here to avoid flicker)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchUserProfile(session.user.id);
      }
    });

    // Fallback: ensure loading eventually ends if no auth event fires
    const loadingTimeout = setTimeout(() => setLoading(false), 800);

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const signOut = async () => {
    // End active admin session if exists
    const sessionId = localStorage.getItem('adminSessionId');
    if (sessionId && role === 'admin') {
      try {
        await supabase
          .from('admin_sessions')
          .update({ ended_at: new Date().toISOString(), active: false })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
    // Clear stored names and session from localStorage
    localStorage.removeItem('adminName');
    localStorage.removeItem('riderName');
    localStorage.removeItem('adminSessionId');
    navigate('/');
  };

  return {
    user,
    session,
    role,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};
