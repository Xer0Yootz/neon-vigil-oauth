// Sign-in modes, picked at build time with VITE_AUTH_MODE:
//   server : the Express backend (backend/server.js) runs the session, Google or GitHub OAuth and email login.
//   google : static hosting (GitHub Pages). Google Identity Services signs in fully in the browser, no secret.
//   mock   : DEV ONLY. A fake local session for screenshots and offline testing. Never ship this.
export const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'server').toLowerCase();
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const BASE = import.meta.env.BASE_URL || '/';
export const GAME_URL = `${BASE}gigas-garden/`;

// The game page gate (public/auth-gate.js) reads this same key, so keep the two in step.
const SESSION_KEY = 'nv-vigil-session';
const NEXT_KEY = 'nv-vigil-next';

export function readSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (s && s.exp > Date.now()) return s;
  } catch { /* bad JSON means no session */ }
  return null;
}

export function writeSession(user, ttlMs = 8 * 60 * 60 * 1000) {
  const s = {
    id: user.id || user.email || user.name,
    name: user.name || 'User',
    email: user.email || '',
    provider: user.provider || AUTH_MODE,
    exp: user.exp || Date.now() + ttlMs
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Return target after sign-in, e.g. the game page that bounced the visitor. Same-origin paths under BASE only.
export function rememberNext() {
  const n = new URLSearchParams(window.location.search).get('next');
  if (n && n.startsWith(BASE) && !n.startsWith('//')) sessionStorage.setItem(NEXT_KEY, n);
}

export function takeNext() {
  const n = sessionStorage.getItem(NEXT_KEY);
  sessionStorage.removeItem(NEXT_KEY);
  return n;
}

function decodeJwt(token) {
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(Array.from(atob(part), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
  return JSON.parse(json);
}

// Google ID token from Google Identity Services. No backend means no signature check here, so this is a
// front-door gate for a public static site, not access control for private data.
export function userFromGoogleCredential(credential) {
  const c = decodeJwt(credential);
  if (c.aud !== GOOGLE_CLIENT_ID) throw new Error('Token is for a different client.');
  if (c.iss !== 'accounts.google.com' && c.iss !== 'https://accounts.google.com') throw new Error('Token issuer is not Google.');
  if (c.exp * 1000 < Date.now()) throw new Error('Token expired.');
  return { id: c.sub, name: c.name || c.email, email: c.email, provider: 'google', exp: c.exp * 1000 };
}

let gisPromise = null;
export function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  gisPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error('Google sign-in script failed to load.'));
    document.head.appendChild(s);
  });
  return gisPromise;
}

export async function signOut() {
  clearSession();
  if (AUTH_MODE !== 'server') {
    const { supabaseSignOut } = await import('./supabase.js');
    await supabaseSignOut();
  }
  if (AUTH_MODE === 'server') {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  }
  if (AUTH_MODE === 'google') window.google?.accounts?.id?.disableAutoSelect();
}
