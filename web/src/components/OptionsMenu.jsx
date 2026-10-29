import { useEffect, useState } from 'react';
import { supabaseRequestRepoAccess } from '../supabase.js';

// Options button + panel, shown on every React-app screen once signed in.
// For now it holds ONLY the volume slider — Link accounts lives here later,
// with no link/unlink controls until then (Oct 28, 2026 order).
// The slider uses the SAME key the Gigas Garden game uses (nv-theme-volume),
// so the Hub slider and the in-game HUD slider stay in sync.
// NOTE: this panel controls volume; it does not start music in the React app
// (the theme track only plays inside the game). A floating music player that
// hovers in the same place everywhere is still an open design question.
const VOLUME_KEY = 'nv-theme-volume';

export default function OptionsMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(() => {
    const v = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.8;
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === VOLUME_KEY) {
        const v = Number(e.newValue);
        if (Number.isFinite(v)) setVolume(Math.min(1, Math.max(0, v)));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function setVol(v) {
    const clamped = Math.min(1, Math.max(0, Number(v) || 0));
    setVolume(clamped);
    try { localStorage.setItem(VOLUME_KEY, String(clamped)); } catch { /* ignore */ }
  }

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 76, zIndex: 2147483000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {open && (
        <div style={{ background: 'rgba(6,8,20,.92)', border: '1px solid rgba(0,240,255,.45)', boxShadow: '0 0 10px rgba(0,240,255,.25)', padding: 14, width: 240, color: '#fff' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, letterSpacing: 1 }}>OPTIONS</p>
          <label style={{ display: 'block', fontSize: 12, color: '#9beaff' }}>
            Volume
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVol(e.target.value)}
              aria-label="Music volume"
              style={{ width: '100%', accentColor: '#00f0ff', marginTop: 6 }}
            />
          </label>
          <p style={{ margin: '10px 0 0', fontSize: 11, color: '#9beaff' }}>
            {volume === 0 ? 'Muted' : `Volume ${Math.round(volume * 100)}%`} — same setting as the in-game volume slider.
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 11, color: '#888' }}>Link accounts — coming later, in this panel.</p>
          {user?.githubUsername === 'Xer0Yootz' && (
            <button
              type="button"
              onClick={async () => { try { await supabaseRequestRepoAccess(); } catch { /* stays on page */ } }}
              style={{ marginTop: 10, width: '100%', padding: '8px 0', background: 'transparent', color: '#00f0ff', border: '1px solid rgba(0,240,255,.45)', cursor: 'pointer', fontSize: 12 }}
            >
              Grant GitHub repo access (owner)
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Options"
        title="Options"
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff', background: 'rgba(6,8,20,.72)', border: '1px solid rgba(0,240,255,.45)', boxShadow: '0 0 8px rgba(0,240,255,.25)', cursor: 'pointer', fontSize: 18 }}
      >
        ⚙
      </button>
    </div>
  );
}
