import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, name, accessCode } = await req.json();

    if (!accessCode || !role) {
      return new Response(
        JSON.stringify({ error: 'Access code and role are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate access code
    const validAccessCode = Deno.env.get('ACCESS_CODE');
    if (!validAccessCode) {
      console.error('ACCESS_CODE not configured in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (accessCode !== validAccessCode) {
      return new Response(
        JSON.stringify({ error: 'Invalid access code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Determine master email based on role
    const masterEmail = role === 'admin' ? 'admin@timelexx.admin' : 'rider@timelexx.com';

    console.log(`Bootstrapping ${role} account: ${masterEmail}`);

    // Try to create the user first
    console.log(`Attempting to create ${role} user`);
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: masterEmail,
      password: accessCode,
      email_confirm: true,
    });

    let userId: string;

    if (createError) {
      // User might already exist, try to list users to find them
      console.log('User creation failed, attempting to find existing user');
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        return new Response(
          JSON.stringify({ error: 'Failed to manage user account' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const existingUser = listData.users.find(u => u.email === masterEmail);
      
      if (!existingUser) {
        console.error('User not found after creation failure');
        return new Response(
          JSON.stringify({ error: 'Failed to create or find user account' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      userId = existingUser.id;
      console.log(`Found existing user: ${userId}, updating password`);
      
      // Update the user's password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: accessCode,
        email_confirm: true,
      });

      if (updateError) {
        console.error('Error updating user password:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update user password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      userId = createData.user.id;
      console.log(`Created new user with ID: ${userId}`);
    }

    // Upsert role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: userId, role: role },
        { onConflict: 'user_id,role', ignoreDuplicates: true }
      );

    if (roleError) {
      console.error('Error upserting role:', roleError);
    }

    // Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          email: masterEmail,
          full_name: name || null,
        },
        { onConflict: 'user_id' }
      );

    if (profileError) {
      console.error('Error upserting profile:', profileError);
    }

    console.log(`Successfully bootstrapped ${role} account`);

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bootstrap-staff-account:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
