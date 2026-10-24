import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import WorldViewer from '../components/WorldViewer.jsx';
import { AUTH_MODE, BASE, GAME_URL, signOut } from '../auth.js';

const MODES = [
  { id: 'procedural', label: 'In World Preview', icon: 'globe' },
  { id: 'skybox', label: 'No Background Preview', icon: 'image-off' }
];

export default function HubPage({ user, character, setUser }) {
  const navigate = useNavigate();
  const [lightsOn, setLightsOn] = useState(() => {
    const saved = localStorage.getItem('5150-lights');
    return saved === null ? true : saved === 'on';
  });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('5150-view') || 'procedural');
  const [mapOpen, setMapOpen] = useState(false);
  const [weather, setWeather] = useState('');
  const accent = character?.accentColor || '#DD00FF';

  useEffect(() => {
    localStorage.setItem('5150-lights', lightsOn ? 'on' : 'off');
  }, [lightsOn]);

  useEffect(() => {
    localStorage.setItem('5150-view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!character?.latitude || !character?.longitude) return;
    async function load() {
      try {
        const res = await fetch(`/api/weather?lat=${character.latitude}&lon=${character.longitude}`);
        if (!res.ok) return;
        const data = await res.json();
        setWeather(`${data.label} ${data.temp != null ? Math.round(data.temp) + '\u00b0C' : ''}`);
      } catch {
        setWeather('Weather unavailable');
      }
    }
    load();
  }, [character]);

  async function logout() {
    await signOut();
    setUser(null);
    navigate('/');
  }

  const iconBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    padding: 0
  };

  return (
    <main className="page-shell">
      <div className="panel hub-panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1 style={{ color: accent }}>{character?.codename || user.name}</h1>
          <p className="hub-meta">{character ? `${character.caste} / ${character.tribe}` : `Signed in with ${user.provider || 'session'}`}</p>
          {AUTH_MODE === 'mock' && <p className="mock-banner">DEV MOCK SESSION</p>}
        </div>

        <div className="hub-choices">
          <a className="hub-choice play" href={GAME_URL}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 2L22 7V17L12 22L2 17V7Z" />
              <path d="M10 8.5L16 12L10 15.5Z" />
            </svg>
            <span>Play Gigas Garden</span>
          </a>
          <Link className="hub-choice chat" to="/chat">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 9h8M8 13h5" />
            </svg>
            <span>Chat</span>
          </Link>
        </div>

        <div className="view-modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={viewMode === m.id ? 'mode-btn active' : 'mode-btn'}
              onClick={() => { setViewMode(m.id); setMapOpen(false); }}
              aria-label={m.label}
              style={iconBtn}
            >
              <Icon name={m.icon} />
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 8 }}>
          <button
            type="button"
            className="lights-bulb"
            onClick={() => setLightsOn((v) => !v)}
            aria-label={lightsOn ? 'Turn off the lights' : 'Turn on the lights'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
          </button>
        </div>

        <WorldViewer
          modelUrl={character?.modelUrl}
          worldUrl={character?.worldUrl}
          viewMode={mapOpen ? 'plate' : viewMode}
          plateUrl={character?.plateUrl || `${BASE}garden-shore.jpg`}
          height={280}
          lightsOn={lightsOn}
          accentColor={accent}
        />

        <nav className="hub-actions" style={{ marginTop: 12 }}>
          <button type="button" className={mapOpen ? 'btn primary' : 'btn ghost'} onClick={() => setMapOpen((v) => !v)} aria-label="Toggle view" aria-pressed={mapOpen} title="Toggle view" style={iconBtn}>
            <Icon name="eye" />
          </button>
          {AUTH_MODE === 'server' && <Link className="btn ghost" to="/character/edit" aria-label="Edit Info" style={iconBtn}><Icon name="avatar" /></Link>}
          {AUTH_MODE === 'server' && character && <Link className="btn ghost" to="/dashboard" aria-label="Repos" style={iconBtn}><Icon name="repos" /></Link>}
          <button type="button" className="btn ghost" onClick={logout} aria-label="Log out" style={iconBtn}><Icon name="logout" /></button>
        </nav>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#8aa0b8' }}>
          GRID STATUS: {weather || (character ? 'reading' : 'online')} \u00b7 {character?.location || 'no location'} \u00b7 <span style={{ color: accent }}>{accent}</span>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, letterSpacing: '0.08em', color: '#8aa0b8' }}>Neon Vigil</p>
      </div>
    </main>
  );
}
