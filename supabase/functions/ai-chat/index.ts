// Supabase Edge Function entry point. Not deployed. See docs/howto/bitchat-name-lock-and-voices.md.
import { handle } from './handler.ts';
import { makeProvider } from './providers.ts';
import { makeStore } from './store.ts';
import { PERSONAS } from './personas.generated.ts';

const env = (k: string) => Deno.env.get(k);
const store = makeStore(env);

Deno.serve((req) =>
  handle(req, { env, store, provider: () => makeProvider(env), personas: PERSONAS }).catch((e) => {
    console.error('ai-chat failed:', (e as Error).message);
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  })
);
