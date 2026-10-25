// Chat names: every player claims one name, once. The database checks it (reserved for a Neon Vigil
// character, or already taken by another player) and puts it on every message. This file only turns
// those checks into plain messages. The same wording is used in the game's CHAT popup.
export const NAME_MIN = 2;
export const NAME_MAX = 24;

export const NAME_MESSAGES = {
  name_reserved: 'That name belongs to a Neon Vigil character. Pick a name of your own.',
  name_taken: 'Another player already has that name. Try a different one.',
  name_invalid: `Names are ${NAME_MIN} to ${NAME_MAX} characters, with at least two letters or numbers.`,
  name_required: 'Pick your chat name before you post.',
  name_mismatch: 'You can only post as your own chat name.',
};

export function nameErrorMessage(err) {
  if (!err) return '';
  if (err.hint && NAME_MESSAGES[err.hint]) return NAME_MESSAGES[err.hint];
  if (err.code === '23505') return NAME_MESSAGES.name_taken; // two players hit the same name at once
  if (err.code === '42501') return 'You are already set up with a chat name.';
  return err.message || 'Something went wrong. Try again.';
}

// Same rule the server uses to decide who answers: the first @Hexa or @Cyphr in the message.
export function mentionsCharacter(body) {
  return /@\s*(hexa|cyphr)/i.test(String(body || '').normalize('NFKC'));
}

export const AI_LABEL = { hexa: 'Hexa Sigil', cyphr: 'Cyphr' };
