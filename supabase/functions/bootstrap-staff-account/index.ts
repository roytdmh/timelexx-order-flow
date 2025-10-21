import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const ACCESS_CODE = Deno.env.get('ACCESS_CODE') as string;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function findUserByEmail(email: string) {
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const user = data.users.find((u: any) => (u.email?.toLowerCase?.() ?? '') === email.toLowerCase());
    if (user) return user;
    if (!data.users || data.users.length < perPage) return null;
    page++;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, name } = await req.json();
    if (!role || (role !== 'admin' && role !== 'rider')) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!ACCESS_CODE) {
      console.error('ACCESS_CODE not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const email = role === 'admin' ? 'admin@timelexx.admin' : 'rider@timelexx.com';

    // Ensure user exists with confirmed email and password == ACCESS_CODE
    let user = await findUserByEmail(email);

    if (!user) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: ACCESS_CODE,
        email_confirm: true,
      });
      if (createErr) throw createErr;
      user = created.user;
    } else {
      const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
        password: ACCESS_CODE,
        email_confirm: true,
      });
      if (updateErr) throw updateErr;
    }

    // Upsert role and profile
    if (user?.id) {
      await admin.from('user_roles').upsert({ user_id: user.id, role }, { onConflict: 'user_id,role' });
      await admin.from('profiles').upsert({
        user_id: user.id,
        email,
        full_name: (name ?? (role === 'admin' ? 'Administrator' : 'Rider')) as string,
      }, { onConflict: 'user_id' });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('bootstrap-staff-account error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
