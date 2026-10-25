// Model adapters. Pick one with the AI_PROVIDER secret: 'xai' (default, for testing) or 'gemini'.
// Keys come only from function secrets: XAI_API_KEY or GEMINI_API_KEY. Never from a browser.
export type ChatInput = { system: string; user: string; maxTokens?: number };
export type Provider = { name: string; model: string; complete(input: ChatInput): Promise<string> };
type Env = (k: string) => string | undefined;

export const DEFAULTS = { provider: 'xai', xaiModel: 'grok-4.3', geminiModel: 'gemini-3.8-flash' };

export function makeProvider(env: Env, fetchFn: typeof fetch = fetch): Provider {
  const name = (env('AI_PROVIDER') || DEFAULTS.provider).toLowerCase();
  if (name === 'xai') {
    const key = env('XAI_API_KEY');
    if (!key) throw new Error('XAI_API_KEY secret is not set');
    const model = env('XAI_MODEL') || DEFAULTS.xaiModel;
    return {
      name, model,
      async complete({ system, user, maxTokens = 200 }) {
        const res = await fetchFn('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model, max_tokens: maxTokens, temperature: 0.6,
            messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          }),
        });
        if (!res.ok) throw new Error(`xai ${res.status}`);
        const data = await res.json();
        return String(data?.choices?.[0]?.message?.content ?? '');
      },
    };
  }
  if (name === 'gemini') {
    const key = env('GEMINI_API_KEY');
    if (!key) throw new Error('GEMINI_API_KEY secret is not set');
    const model = env('GEMINI_MODEL') || DEFAULTS.geminiModel;
    return {
      name, model,
      async complete({ system, user, maxTokens = 200 }) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
        const res = await fetchFn(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.6 },
          }),
        });
        if (!res.ok) throw new Error(`gemini ${res.status}`);
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts ?? [];
        return parts.map((p: { text?: string }) => p.text ?? '').join('');
      },
    };
  }
  throw new Error(`Unknown AI_PROVIDER "${name}". Use xai or gemini.`);
}
