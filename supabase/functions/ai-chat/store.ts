// The real Store, backed by Supabase with the service role key. Server side only.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { type Msg, ROOM_ID, type Store } from './handler.ts';
import type { Tag } from './router.ts';

const COLS = 'id, room_id, user_id, user_name, body, created_at, is_ai';

export function serviceKey(env: (k: string) => string | undefined): string {
  const legacy = env('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  const keys = env('SUPABASE_SECRET_KEYS');
  if (keys) return JSON.parse(keys).default;
  throw new Error('no service key in the function environment');
}

export function makeStore(env: (k: string) => string | undefined): Store {
  const db: SupabaseClient = createClient(env('SUPABASE_URL')!, serviceKey(env), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    async userFromToken(token) {
      const { data, error } = await db.auth.getUser(token);
      return error || !data?.user ? null : { id: data.user.id };
    },
    async getMessage(id) {
      const { data } = await db.from('messages').select(COLS).eq('id', id).maybeSingle();
      return (data as Msg) ?? null;
    },
    async hasReply(messageId) {
      const { count } = await db.from('messages').select('id', { count: 'exact', head: true })
        .eq('is_ai', true).eq('reply_to', messageId);
      return (count ?? 0) > 0;
    },
    async recentMessages(limit) {
      const { data } = await db.from('messages').select(COLS).eq('room_id', ROOM_ID)
        .order('created_at', { ascending: false }).limit(limit);
      return ((data as Msg[]) ?? []).reverse();
    },
    async countAiSince(sinceIso, tag?: Tag) {
      let q = db.from('messages').select('id', { count: 'exact', head: true }).eq('is_ai', true).gte('created_at', sinceIso);
      if (tag) q = q.eq('character_tag', tag);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
    async countAiRepliesToUserSince(userId, sinceIso) {
      const { data: mine, error } = await db.from('messages').select('id').eq('user_id', userId).gte('created_at', sinceIso).limit(500);
      if (error) throw error;
      const ids = (mine ?? []).map((m: { id: string }) => m.id);
      if (!ids.length) return 0;
      const { count, error: e2 } = await db.from('messages').select('id', { count: 'exact', head: true })
        .eq('is_ai', true).in('reply_to', ids);
      if (e2) throw e2;
      return count ?? 0;
    },
    async insertAiReply({ tag, body, reply_to }) {
      // The database trigger sets user_name ("Hexa Sigil" or "Cyphr") and checks this is the service role.
      const { error } = await db.from('messages').insert({ room_id: ROOM_ID, is_ai: true, character_tag: tag, body, reply_to });
      if (error) throw error;
    },
  };
}
