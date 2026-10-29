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

// GitHub sign-in on Pages, via Supabase OAuth (no secret in the browser build).
// Needs the GitHub provider turned on in the Supabase dashboard with a GitHub
// OAuth App whose callback is the Supabase callback URL. Scope is email only:
// read the user's email + profile, never repo access. The browser is sent to
// GitHub and back to the app root; App.jsx then picks the session up and
// follows the saved ?next= destination (e.g. the game page).
export async function supabaseSignInWithGitHub() {
  if (!supabase) throw new Error('GitHub sign-in is not configured on this build.');
  const redirectTo = window.location.origin + (import.meta.env.BASE_URL || '/');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo, scopes: 'read:user user:email' }
  });
  if (error) throw new Error(error.message);
}

// After a Supabase OAuth return (GitHub, or Google via Supabase), turn the
// Supabase session into an app session. The session id is the email, so a
// Google sign-in and a GitHub sign-in with the SAME email are the SAME Neon
// Vigil identity at app level — automatic linking, the way the server backend
// merges by email — with no link/unlink controls. True Supabase identity
// linking (linkIdentity) is a later Options step, not this one.
export async function supabaseSessionUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u || !u.email) return null;
  const meta = u.app_metadata || {};
  const provider = (u.identities?.[0]?.provider) || meta.provider || 'github';
  return {
    id: u.email,
    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
    email: u.email,
    provider,
    githubUsername: u.user_metadata?.user_name || u.user_metadata?.preferred_username || '',
    exp: (data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 8 * 60 * 60 * 1000)
  };
}

// Owner-only second step: grant repo access to the OWNER GitHub account.
// The normal Pages GitHub sign-in above asks for read:user + user:email ONLY,
// so ordinary players never get repo scope. This function re-runs GitHub
// OAuth with the `repo` scope and is only offered when the signed-in GitHub
// login is Xer0Yootz — the owner's GitHub account, the one tied to
// bookings@jasmineinfiniti.com, modelmommi@gmail.com and msjasminemckay@gmail.com.
// Those three emails are the owner identity at app level; they are NOT
// hard-coded in the repo — the gate here is the public GitHub login name.
export async function supabaseRequestRepoAccess() {
  if (!supabase) throw new Error('GitHub sign-in is not configured on this build.');
  const redirectTo = window.location.origin + (import.meta.env.BASE_URL || '/');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo, scopes: 'repo' }
  });
  if (error) throw new Error(error.message);
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
