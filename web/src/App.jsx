import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GridField from './pages/GridField.jsx';
import LoadingScreen from './pages/LoadingScreen.jsx';
import Flourish from './pages/Flourish.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import CharacterCreation from './pages/CharacterCreation.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';
import HubPage from './pages/HubPage.jsx';
import { AUTH_MODE, readSession, writeSession, takeNext } from './auth.js';

const MIN_INTRO_MS = 1800;
const LOADED_HOLD_MS = 700;
const FLOURISH_MS = 1600;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flourish, setFlourish] = useState(false);
  const [progress, setProgress] = useState(8);
  const [label, setLabel] = useState('Hex operating system loading');

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    async function load() {
      try {
        setProgress(20);
        if (AUTH_MODE !== 'server') {
          // Static build (GitHub Pages) or dev mock: the session lives in this browser only.
          const session = readSession();
          setUser(session);
          setProgress(90);
          setLabel(session ? 'Logging in to the IWW' : 'No IWW session');
          return;
        }
        setLabel('Hex operating system loading');
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (cancelled) return;
        setProgress(55);

        if (!authResponse.ok) {
          setUser(null);
          setProgress(90);
          setLabel('No IWW session');
        } else {
          const data = await authResponse.json();
          setUser(data.user);
          writeSession(data.user); // lets the game page gate see the session too
          setProgress(70);
          setLabel('Logging in to the IWW');

          const characterResponse = await fetch('/api/character/me', { credentials: 'include' });
          if (cancelled) return;
          setProgress(90);

          if (characterResponse.ok) {
            const characterData = await characterResponse.json();
            setCharacter(characterData.character || null);
          } else {
            setCharacter(null);
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setProgress(90);
          setLabel('IWW read failed');
        }
      } finally {
        if (!cancelled) {
          setProgress(100);
          setLabel('Entering virtual reality construct');
        }
        const elapsed = Date.now() - started;
        const remaining = Math.max(LOADED_HOLD_MS, MIN_INTRO_MS - elapsed);
        await wait(remaining);
        if (!cancelled) {
          setLoading(false);
          setFlourish(true);
          await wait(FLOURISH_MS);
          if (!cancelled) setFlourish(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // After sign-in, go back to whatever sent the visitor here (the gated game page), else stay in the app.
  useEffect(() => {
    if (loading || flourish || !user) return;
    const next = takeNext();
    if (next) window.location.assign(next);
  }, [loading, flourish, user]);

  const serverMode = AUTH_MODE === 'server';
  let screen = null;
  if (loading) {
    screen = (
      <LoadingScreen
        progress={progress}
        label={label}
        onSkip={() => {
          setLoading(false);
          setFlourish(true);
          setTimeout(() => setFlourish(false), FLOURISH_MS);
        }}
      />
    );
  } else if (flourish) {
    screen = <Flourish />;
  } else {
    screen = (
      <Routes>
        <Route path="/" element={user ? <Navigate to="/hub" replace /> : <LoginPage setUser={setUser} />} />
        <Route path="/signup" element={user || !serverMode ? <Navigate to="/" replace /> : <SignupPage setUser={setUser} />} />
        <Route path="/character/create" element={user && serverMode && !character ? <CharacterCreation setCharacter={setCharacter} /> : <Navigate to="/" replace />} />
        <Route path="/character/edit" element={user && serverMode ? <CharacterCreation setCharacter={setCharacter} existing={character} /> : <Navigate to="/" replace />} />
        <Route path="/hub" element={user ? <HubPage user={user} character={character} setUser={setUser} /> : <Navigate to="/" replace />} />
        <Route path="/dashboard" element={user && serverMode && character ? <DashboardPage user={user} character={character} setUser={setUser} /> : <Navigate to="/" replace />} />
        <Route path="/chat" element={user ? <GroupChatPage user={user} character={character} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <GridField />
      <div className="screen-layer">{screen}</div>
    </>
  );
}
