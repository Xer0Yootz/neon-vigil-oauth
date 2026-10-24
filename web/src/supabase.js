// Supabase client for the static (GitHub Pages) build: bitchat's Neon Vigil room lives in Supabase.
// Only the public URL and the anon/publishable key go in the build. Never a service_role or secret key.
import { createClient } from '@supabase/supabase-js';
import { GOOGLE_CLIENT_ID } from './auth.js';

const URL_ = import.meta.env.VITE_SUPABASE_URL || '';
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const ROOM_ID = 'neon-vigil';

export const supabase = URL_ && KEY
  ? createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'nv-supabase-auth' } })
  : null;

// Called right after Google sign-in on Pages. Needs the Google provider turned on in the Supabase dashboard
// with this same client ID; until then it fails quietly and chat falls back to an anonymous Supabase session.
export async function supabaseSignInWithGoogle(idToken) {
  if (!supabase || !GOOGLE_CLIENT_ID || !idToken) return null;
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error) {
    console.warn('Supabase Google sign-in not available yet:', error.message);
    return null;
  }
  return data.session;
}

// Makes sure there is a Supabase session so row level security can check auth.uid() on insert.
// Order: existing session (Google or anonymous) > anonymous sign-in.
export async function ensureChatSession() {
  if (!supabase) throw new Error('Chat is not configured on this build.');
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;
  const anon = await supabase.auth.signInAnonymously();
  if (anon.error) {
    if (anon.error.code === 'anonymous_provider_disabled') {
      throw new Error('Chat is read-only for now: guest posting is not switched on yet.');
    }
    throw new Error(`Chat sign-in failed: ${anon.error.message}`);
  }
  return anon.data.session;
}

export async function supabaseSignOut() {
  if (supabase) await supabase.auth.signOut().catch(() => {});
}
