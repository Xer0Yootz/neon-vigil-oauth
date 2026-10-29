import { useEffect, useRef, useState } from 'react';

// Floating music player, bottom-right, on every signed-in screen EXCEPT
// the sign-in screen and the Hub (Oct 28, 2026 order: "don't have the music
// player on the sign in screen or hub").
// This is THE SAME player as My Room's radio player (Oct 28, 2026 order):
// the same stations, in the same order, with the same saved choice — plus
// the Neon Vigil Theme as a local source. Station choice + radio volume are
// shared with My Room through the SAME prefs key My Room uses
// (nv.Infinity_6.radio.v1), so picking a station here carries to My Room and
// back. Starts paused — browsers block autoplay, so the user taps play.
// Collapses to a small round button.
// LIMIT, stated plainly: playback does NOT carry across page loads. Moving
// from chat to the game (a different page) restarts the player with the
// saved station — the choice follows you, the stream itself does not keep
// playing through the navigation.
const RADIO_KEY = 'nv.Infinity_6.radio.v1';
const OLD_RADIO_KEYS = ['nv.infinity6.radio.v1', 'nv.infiniti6.radio.v1'];

const STATIONS = [
  { id: 'theme', name: 'Neon Vigil Theme', url: null, site: null },
  { id: 'jerome', name: 'Jerome FM', url: 'https://radio.jeromefm.live/stream', site: 'https://jeromefm.live/' },
  { id: 'ssr1', name: 'SSR Ambient', url: 'https://systrum.net:8443/SSR1', site: 'https://systrum.net/' },
  { id: 'ssr2', name: 'SSR Electronic', url: 'https://systrum.net:8443/SSR2', site: 'https://systrum.net/' },
  { id: 'nightride', name: 'Nightride', url: 'https://stream.nightride.fm/nightride.mp3', site: 'https://nightride.fm/' },
  { id: 'chillsynth', name: 'Chillsynth', url: 'https://stream.nightride.fm/chillsynth.mp3', site: 'https://nightride.fm/' },
  { id: 'yumi', name: 'Yumi Co', url: 'https://yumicoradio.net/stream', site: 'https://yumicoradio.net/' },
  { id: 'sutro', name: 'Sutro FM', url: 'https://media.evenings.co/s/7Lo66BLQe', site: 'https://sutrofm.net/' },
];

function readPrefs() {
  try {
    let raw = null;
    for (const key of [RADIO_KEY, ...OLD_RADIO_KEYS]) {
      raw = localStorage.getItem(key);
      if (raw) {
        if (key !== RADIO_KEY) localStorage.setItem(RADIO_KEY, raw);
        break;
      }
    }
    const data = JSON.parse(raw || '{}');
    return data && typeof data === 'object' ? data : {};
  } catch { return {}; }
}

export default function FloatingMusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [stationId, setStationId] = useState(() => {
    const saved = readPrefs().station;
    return STATIONS.some((s) => s.id === saved) ? saved : 'theme';
  });
  const [volume, setVolume] = useState(() => {
    const v = Number(readPrefs().volume);
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.7;
  });
  const [error, setError] = useState('');
  const [showCyphr, setShowCyphr] = useState(false);
  const cyphrSeen = () => {
    try { return localStorage.getItem('nv-player-cyphr-seen') === '1'; } catch { return false; }
  };

  const station = STATIONS.find((s) => s.id === stationId) || STATIONS[0];

  useEffect(() => {
    const a = new Audio();
    a.preload = 'none';
    audioRef.current = a;
    return () => { a.pause(); audioRef.current = null; };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== RADIO_KEY) return;
      const prefs = readPrefs();
      if (STATIONS.some((s) => s.id === prefs.station)) setStationId(prefs.station);
      const v = Number(prefs.volume);
      if (Number.isFinite(v)) setVolume(Math.min(1, Math.max(0, v)));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function remember(next) {
    try { localStorage.setItem(RADIO_KEY, JSON.stringify({ ...readPrefs(), ...next })); } catch { /* ignore */ }
  }

  function setVol(v) {
    const clamped = Math.min(1, Math.max(0, Number(v) || 0));
    setVolume(clamped);
    remember({ volume: clamped });
  }

  function pickStation(id) {
    setStationId(id);
    remember({ station: id });
    setError('');
    const a = audioRef.current;
    if (a && playing) {
      const next = STATIONS.find((s) => s.id === id);
      const url = next?.id === 'theme'
        ? `${import.meta.env.BASE_URL || '/'}gigas-garden/assets/neon-vigil-theme.mp3`
        : next?.url;
      if (url) {
        a.src = url;
        a.volume = volume;
        a.play().catch(() => setError(`${next.name} is off air.`));
      }
    }
  }

  async function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    // First click on the player, ever: Cyphr shows up and instructs you.
    // The panel stays until you tap "Got it" — that tap is what marks it seen,
    // so the intro is shared (same key) with the game / My Room players later.
    if (!playing && !cyphrSeen()) setShowCyphr(true);
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    const url = station.id === 'theme'
      ? `${import.meta.env.BASE_URL || '/'}gigas-garden/assets/neon-vigil-theme.mp3`
      : station.url;
    if (!url) return;
    a.src = url;
    a.volume = volume;
    setError('');
    try {
      await a.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setError(`${station.name} is off air.`);
    }
  }

  const bar = {
    position: 'fixed', right: 12, bottom: 12, zIndex: 2147483000,
    display: 'flex', alignItems: 'center', gap: 8,
    color: '#fff', background: 'rgba(6,8,20,.92)',
    border: '1px solid rgba(0,240,255,.45)', boxShadow: '0 0 10px rgba(0,240,255,.25)',
    padding: '8px 10px', fontSize: 12, maxWidth: 'calc(100vw - 24px)', flexWrap: 'wrap'
  };

  if (collapsed) {
    return (
      <button type="button" onClick={() => setCollapsed(false)} aria-label="Open music player" title="Music player"
        style={{ ...bar, width: 40, height: 40, justifyContent: 'center', cursor: 'pointer', fontSize: 18, padding: 0 }}>♪</button>
    );
  }

  return (
    <>
      {showCyphr && (
        <div style={{ position: 'fixed', right: 12, bottom: 76, zIndex: 2147483000, width: 300, maxWidth: 'calc(100vw - 24px)',
          background: 'rgba(10,6,30,.96)', border: '1px solid rgba(0,240,255,.6)', boxShadow: '0 0 14px rgba(0,240,255,.35)',
          color: '#fff', padding: 14, fontSize: 12, lineHeight: 1.5 }}>
          <p style={{ margin: '0 0 8px', color: '#00f0ff', letterSpacing: 1 }}>CYPHR — INFINITY 6</p>
          <p style={{ margin: '0 0 8px' }}>Hi, I'm Cyphr. This is your music player — it follows you everywhere except the sign-in screen and the Hub.</p>
          <ul style={{ margin: '0 0 8px', paddingLeft: 16 }}>
            <li>▶ / ❚❚ plays or pauses. The Neon Vigil Theme plays first.</li>
            <li>Station menu: Theme first, then Jerome FM, SSR Ambient, SSR Electronic, Nightride, Chillsynth, Yumi Co, and Sutro FM. "Station site" opens that station's site.</li>
            <li>The volume slider is the radio volume. Your station choice carries to My Room.</li>
            <li>– collapses the player to a small ♪ button. Tap it to bring it back.</li>
          </ul>
          <button type="button" onClick={() => { setShowCyphr(false); try { localStorage.setItem('nv-player-cyphr-seen', '1'); } catch { /* ignore */ } }}
            style={{ width: '100%', padding: '8px 0', background: 'transparent', color: '#00f0ff', border: '1px solid rgba(0,240,255,.45)', cursor: 'pointer', fontSize: 12 }}>
            Got it
          </button>
        </div>
      )}
      <div style={bar} role="group" aria-label="Music player">
      <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause music' : 'Play music'} title={playing ? 'Pause' : 'Play'}
        style={{ background: 'none', border: 'none', color: '#00f0ff', cursor: 'pointer', fontSize: 16, padding: 0 }}>
        {playing ? '❚❚' : '▶'}
      </button>
      <select value={stationId} onChange={(e) => pickStation(e.target.value)} aria-label="Radio station"
        style={{ background: '#0b0414', color: '#fff', border: '1px solid rgba(0,240,255,.45)', fontSize: 12, maxWidth: 150 }}>
        {STATIONS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {station.site && (
        <a href={station.site} target="_blank" rel="noopener noreferrer" style={{ color: '#9beaff', fontSize: 11 }}>Station site</a>
      )}
      <input type="range" min="0" max="1" step="0.05" value={volume}
        onChange={(e) => setVol(e.target.value)} aria-label="Music volume"
        style={{ width: 90, accentColor: '#00f0ff' }} />
      <button type="button" onClick={() => setCollapsed(true)} aria-label="Collapse music player" title="Collapse"
        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, padding: 0 }}>–</button>
      {error && <span style={{ color: '#ff7ab8', fontSize: 11 }}>{error}</span>}
      </div>
    </>
  );
}
