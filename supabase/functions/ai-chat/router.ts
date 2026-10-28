// Who answers. No line is scripted; the book decides Praxia's lines (Jasmine 10-25).
export type Tag = 'hexa' | 'cyphr';

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

export type Route =
  | { kind: 'none' }
  | { kind: 'model'; tag: Tag };

export function route(body: string): Route {
  const tag = firstMention(body);
  if (!tag) return { kind: 'none' };
  return { kind: 'model', tag };
}
