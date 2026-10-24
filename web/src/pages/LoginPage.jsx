import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../icons.jsx';
import { AUTH_MODE, GOOGLE_CLIENT_ID, loadGoogleIdentity, userFromGoogleCredential, writeSession } from '../auth.js';

function GoogleSignIn({ setUser }) {
  const slot = useRef(null);
  const [error, setError] = useState(GOOGLE_CLIENT_ID ? '' : 'Sign-in is not configured: VITE_GOOGLE_CLIENT_ID is missing from this build.');
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let live = true;
    loadGoogleIdentity().then((google) => {
      if (!live || !slot.current) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: true,
        callback: ({ credential }) => {
          try {
            setUser(writeSession(userFromGoogleCredential(credential)));
          } catch (e) {
            setError(e.message);
          }
        }
      });
      google.accounts.id.renderButton(slot.current, { theme: 'filled_black', size: 'large', shape: 'rectangular', text: 'signin_with', width: 300 });
    }).catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, [setUser]);
  return (
    <>
      <div ref={slot} className="gis-slot" />
      {error && <p className="error">{error}</p>}
    </>
  );
}

function SignInShell({ children, note }) {
  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>Sign in</h1>
          <p className="hub-meta">Neon Vigil</p>
        </div>
        {children}
        {note && <p className="hub-meta" style={{ marginTop: 14, fontSize: 12 }}>{note}</p>}
      </div>
    </main>
  );
}

export default function LoginPage({ setUser }) {
  if (AUTH_MODE === 'google') {
    return <SignInShell note="Sign in to play Gigas Garden and open chat."><GoogleSignIn setUser={setUser} /></SignInShell>;
  }
  if (AUTH_MODE === 'mock') {
    return (
      <SignInShell note="Dev mock mode. Nothing leaves this browser. Not for a public build.">
        <p className="mock-banner">DEV MOCK SIGN-IN. NOT REAL OAUTH.</p>
        <button
          type="button"
          className="btn primary"
          style={{ width: '100%', padding: '12px 0' }}
          onClick={() => setUser(writeSession({ id: 'mock-user', name: 'User', email: 'user@mock.local', provider: 'mock' }))}
        >
          <Icon name="login" /> Mock sign-in
        </button>
      </SignInShell>
    );
  }
  return <ServerLogin setUser={setUser} />;
}

function ServerLogin({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || 'Login failed.');
      return;
    }
    setUser(writeSession(data.user) && data.user);
    navigate('/');
  }

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>Login</h1>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input name="email" type="email" onChange={handleChange} placeholder="you@example.com" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" onChange={handleChange} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit" disabled={loading} aria-label="Log in">
            <Icon name="login" /> {loading ? 'Signing in\u2026' : 'Log in'}
          </button>
        </form>
        <div className="divider"><span>or</span></div>
        <div className="oauth-row">
          <a className="btn ghost" href="/auth/google">Google</a>
          <a className="btn ghost" href="/auth/github">GitHub</a>
        </div>
        <p className="hub-meta" style={{ marginTop: 12, fontSize: 12 }}>BitChat login not active.</p>
        <p className="switch">
          New to the network? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
