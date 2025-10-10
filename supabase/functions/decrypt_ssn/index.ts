// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

interface reqPayload {
  profileId: string;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')?.trim();
    if (!authHeader) {
      throw new Error('Authorization header is missing.');
    }
    const token = authHeader.replace('Bearer ', '');

    // Create a Supabase client with the Auth context of the logged in user.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError) throw userError;

    if (!user) throw new Error('User not found.');

    const { profileId }: reqPayload = await req.json(); //this needs to be a profile_id of type uuid sent in the request

    // pull row
    const { data, error } = await supabase
      .from('employees')
      .select('ssn_hash')
      .eq('id', profileId)
      .single();

    if (error) throw error;

    if (!data) throw new Error('No such user found.');

    //decrypt ssn_hash
    const { data: decryptedSSN, error: rpcError } = await supabaseAdmin.rpc(
      'decrypt_ssn',
      { p_data: data.ssn_hash }
    );

    if (rpcError) throw rpcError;

    //return response
    return new Response(JSON.stringify({ profileId, decryptedSSN }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'An unknown error occurred' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
  }
});
