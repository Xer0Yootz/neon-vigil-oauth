import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../icons.jsx';
import { AUTH_MODE } from '../auth.js';
import { supabase, ROOM_ID, ensureChatSession } from '../supabase.js';

const DISCORD_SERVER_ID = '';

// The Neon Vigil room. Server mode: the backend (/api/bitchat). Static build (GitHub Pages): Supabase, with
// live updates over Realtime. Without Supabase settings in the build it says so plainly instead of failing.
export default function GroupChatPage(props) {
  if (AUTH_MODE === 'server') return <ServerChat {...props} />;
  if (supabase) return <SupabaseChat {...props} />;
  return <ChatOffline {...props} />;
}

const MAX_BODY = 2000;

function SupabaseChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Connecting');
  const [uid, setUid] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    let live = true;
    let channel = null;
    const add = (row) => setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
    (async () => {
      try {
        // Reading is open to everyone; posting needs a Supabase session. If that fails, still show the room.
        try {
          const session = await ensureChatSession();
          if (live) setUid(session.user.id);
        } catch (e) {
          if (live) setError(e.message);
        }
        if (!live) return;
        channel = supabase
          .channel(`room:${ROOM_ID}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${ROOM_ID}` }, (payload) => add(payload.new))
          .subscribe((s) => live && setStatus(s === 'SUBSCRIBED' ? 'Live' : s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' ? 'Live updates paused' : 'Connecting'));
        const { data, error: readErr } = await supabase
          .from('messages')
          .select('id, user_id, user_name, body, created_at')
          .eq('room_id', ROOM_ID)
          .order('created_at', { ascending: false })
          .limit(100);
        if (!live) return;
        if (readErr) throw readErr;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          return [...data.reverse().filter((m) => !seen.has(m.id)), ...prev];
        });
      } catch (e) {
        if (live) { setError(e.message || 'Chat failed to load'); setStatus('Offline'); }
      }
    })();
    return () => { live = false; if (channel) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    setError('');
    const body = text.trim();
    if (!body || !uid || sending) return;
    if (body.length > MAX_BODY) { setError(`Keep it under ${MAX_BODY} characters.`); return; }
    setSending(true);
    const { data, error: sendErr } = await supabase
      .from('messages')
      .insert({ room_id: ROOM_ID, user_id: uid, user_name: (user.name || 'User').slice(0, 60), body })
      .select('id, user_id, user_name, body, created_at')
      .single();
    setSending(false);
    if (sendErr) { setError(sendErr.message || 'Send failed'); return; }
    setText('');
    setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
  };

  return (
    <ChatFrame user={user} status={status}>
      <MessageList
        items={messages.map((m) => ({ id: m.id, mine: m.user_id === uid, name: m.user_name, body: m.body }))}
        endRef={endRef}
      />
      <form className="form" onSubmit={send}>
        <label>
          <span>Message</span>
          <input value={text} maxLength={MAX_BODY} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit" aria-label="Send" disabled={!uid || sending}>Send</button>
      </form>
    </ChatFrame>
  );
}

function ChatFrame({ user, status, children }) {
  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>Chat</h1>
          <p className="hub-meta">{user.name}</p>
        </div>
        <p><Link to="/hub" className="btn ghost" aria-label="Back" style={{ display: 'inline-flex', width: 40, height: 40, padding: 0, marginBottom: 12 }}><Icon name="back" /></Link></p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
          <span className="btn primary" aria-label="Neon Vigil room">Neon Vigil</span>
          <p className="hub-meta" style={{ fontSize: 11, margin: 0 }}>{status}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function MessageList({ items, endRef }) {
  return (
    <div style={{
      height: 280,
      overflowY: 'auto',
      border: '1px solid rgba(0, 240, 255, 0.3)',
      padding: 10,
      marginBottom: 10,
      background: 'rgba(0,0,0,0.35)'
    }}>
      {items.length === 0 && <p className="hub-meta" style={{ fontSize: 12 }}>No messages yet.</p>}
      {items.map((m) => (
        <div key={m.id} style={{ display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
          <div style={{
            maxWidth: '75%',
            padding: '8px 10px',
            background: m.mine ? 'rgba(195, 0, 255, 0.25)' : 'rgba(0, 240, 255, 0.12)',
            border: m.mine ? '1px solid rgba(195, 0, 255, 0.5)' : '1px solid rgba(0, 240, 255, 0.4)'
          }}>
            <div style={{ fontSize: 10, color: '#8aa0b8', marginBottom: 2 }}>{m.mine ? 'You' : m.name}</div>
            <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.body}</div>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function ChatOffline({ user }) {
  return (
    <ChatFrame user={user} status="Not connected">
      <p className="hub-meta">The Neon Vigil room is not connected on this build. It needs the Supabase settings at build time.</p>
    </ChatFrame>
  );
}

function ServerChat({ user, character }) {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [btStatus, setBtStatus] = useState('Bluetooth not requested');
  const [btDevice, setBtDevice] = useState('');
  const [room, setRoom] = useState('neon');
  const endRef = useRef(null);

  async function ensureRoom() {
    const keyRes = await fetch('/api/bitchat/keypair', { credentials: 'include' });
    if (!keyRes.ok) return;
    const groupsRes = await fetch('/api/bitchat/groups', { credentials: 'include' });
    const groupsData = await groupsRes.json();
    let list = groupsData.groups || [];
    if (!list.length) {
      const createRes = await fetch('/api/bitchat/groups', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Neon Vigil' })
      });
      if (createRes.ok) {
        const created = await createRes.json();
        list = [{ id: created.id, name: 'Neon Vigil' }];
      }
    }
    setGroups(list);
    if (list[0]) {
      setGroupId(list[0].id);
      loadMessages(list[0].id);
    }
  }

  useEffect(() => {
    ensureRoom();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (id) => {
    const response = await fetch(`/api/bitchat/messages/${id}`, { credentials: 'include' });
    const data = await response.json();
    setMessages(data.messages || []);
  };

  const allowBluetooth = async () => {
    if (!navigator.bluetooth) {
      setBtStatus('Bluetooth not available in this browser');
      return;
    }
    try {
      setBtStatus('Requesting Bluetooth');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      });
      setBtDevice(device.name || 'Unnamed device');
      setBtStatus('Bluetooth allowed');
      device.addEventListener('gattserverdisconnected', () => {
        setBtStatus('Device disconnected');
        setBtDevice('');
      });
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setBtStatus('No device selected');
      } else if (err.name === 'SecurityError' || err.name === 'NotAllowedError') {
        setBtStatus('Bluetooth blocked');
      } else {
        setBtStatus('Bluetooth failed');
      }
    }
  };

  const send = async (event) => {
    event.preventDefault();
    setError('');
    if (!text.trim() || !groupId) return;
    const response = await fetch('/api/bitchat/send', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        ciphertext: text.trim(),
        nonce: 'plain'
      })
    });
    if (response.ok) {
      setText('');
      loadMessages(groupId);
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'Send failed');
    }
  };

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
      <div className="panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>Chat</h1>
          <p className="hub-meta">{user.name}{character ? ` / ${character.codename}` : ''}</p>
        </div>
        <p><Link to="/hub" className="btn ghost" aria-label="Back" style={{ ...iconBtn, marginBottom: 12 }}><Icon name="back" /></Link></p>

        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn ghost" onClick={allowBluetooth} aria-label="Allow Bluetooth" style={iconBtn}>
            <Icon name="bluetooth" />
          </button>
          <p className="hub-meta" style={{ fontSize: 11, margin: 0 }}>
            {btStatus}{btDevice ? ` \u00b7 ${btDevice}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <button type="button" className={room === 'neon' ? 'btn primary' : 'btn ghost'} onClick={() => setRoom('neon')} aria-label="Neon Vigil room">
            Neon Vigil
          </button>
          <button type="button" className={room === 'discord' ? 'btn primary' : 'btn ghost'} onClick={() => setRoom('discord')} aria-label="Discord room">
            Discord
          </button>
        </div>

        {room === 'neon' && (
          <>
            <div style={{
              height: 280,
              overflowY: 'auto',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              padding: 10,
              marginBottom: 10,
              background: 'rgba(0,0,0,0.35)'
            }}>
              {messages.length === 0 && <p className="hub-meta" style={{ fontSize: 12 }}>No messages yet.</p>}
              {messages.map((message) => {
                const mine = message.sender_id === user.id;
                return (
                  <div key={message.id} style={{
                    display: 'flex',
                    justifyContent: mine ? 'flex-end' : 'flex-start',
                    marginBottom: 8
                  }}>
                    <div style={{
                      maxWidth: '75%',
                      padding: '8px 10px',
                      background: mine ? 'rgba(195, 0, 255, 0.25)' : 'rgba(0, 240, 255, 0.12)',
                      border: mine ? '1px solid rgba(195, 0, 255, 0.5)' : '1px solid rgba(0, 240, 255, 0.4)'
                    }}>
                      <div style={{ fontSize: 10, color: '#8aa0b8', marginBottom: 2 }}>
                        {mine ? 'You' : message.sender_name}
                      </div>
                      <div style={{ fontSize: 14 }}>{message.ciphertext}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form className="form" onSubmit={send}>
              <label>
                <span>Message</span>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
              </label>
              {error && <p className="error">{error}</p>}
              <button className="btn primary" type="submit" aria-label="Send">Send</button>
            </form>
          </>
        )}

        {room === 'discord' && (
          <div style={{
            height: 360,
            border: '1px solid rgba(0, 240, 255, 0.3)',
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}>
            {DISCORD_SERVER_ID ? (
              <iframe
                title="Discord"
                src={`https://discord.com/widget?id=${DISCORD_SERVER_ID}&theme=dark`}
                width="100%"
                height="340"
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              />
            ) : (
              <>
                <p className="hub-meta" style={{ marginBottom: 8 }}>Discord room</p>
                <p className="hub-meta" style={{ fontSize: 12, textAlign: 'center' }}>
                  Paste your Discord server ID to show the widget here.
                </p>
                <a className="btn ghost" href="https://discord.com" target="_blank" rel="noreferrer" style={{ marginTop: 12 }}>
                  Open Discord
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
