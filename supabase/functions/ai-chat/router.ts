// Who answers, and which lines stay scripted.
export type Tag = 'hexa' | 'cyphr';

export const STATUS_LINE = 'GRID OK | IWW VIEWPORT | DEEP TIME 5150';
export const PRAXIA_LINE = 'Praxia. You cannot sync with Praxia.';
export const DECLINE: Record<Tag, string> = { hexa: 'Not on record.', cyphr: 'No record.' };
export const SIGN_OFF = 'Further Directives, User?';

// Folds look-alike letters so "@Ｈexa" or "@Неха" still count as a mention.
export function foldText(s: string): string {
  return s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[аеорсухкмтнвіјѕ]/g, (c) => ({ а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', у: 'y', х: 'x', к: 'k', м: 'm', т: 't', н: 'h', в: 'b', і: 'i', ј: 'j', ѕ: 's' } as Record<string, string>)[c]);
}

const MENTION = /@\s*(hexa(?:[\s_-]*sigil)?|cyphr)\b/g;

// The first @mention wins. One responder only, never both.
export function firstMention(body: string): Tag | null {
  const m = MENTION.exec(foldText(body));
  MENTION.lastIndex = 0;
  if (!m) return null;
  return m[1].startsWith('hexa') ? 'hexa' : 'cyphr';
}

export function isPraxiaSync(body: string): boolean {
  const t = foldText(body);
  return /praxia/.test(t) && /\bsync/.test(t);
}

export function isStatusRequest(body: string): boolean {
  // Only a plain status request ("@Hexa status?", "ship status", "sitrep"), not "status of Xero".
  const rest = foldText(body).replace(MENTION, ' ').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  return /^(status|status report|sitrep)$/.test(rest) || /\b(ship status|status report|sitrep)\b/.test(rest);
}

export type Route =
  | { kind: 'none' }
  | { kind: 'scripted'; tag: Tag; text: string }
  | { kind: 'model'; tag: Tag };

export function route(body: string): Route {
  const tag = firstMention(body);
  if (!tag) return { kind: 'none' };
  // Praxia's line is fixed text, posted as Cyphr under the v1 rule (Query Q2 is open on who says it).
  if (isPraxiaSync(body)) return { kind: 'scripted', tag: 'cyphr', text: PRAXIA_LINE };
  if (isStatusRequest(body)) return { kind: 'scripted', tag, text: STATUS_LINE };
  return { kind: 'model', tag };
}
