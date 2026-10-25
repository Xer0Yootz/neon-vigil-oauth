// Turns a persona Markdown file into the system prompt the model sees.
// Keeps only the ```text block, drops held Queries and PROPOSED notes, and swaps the two fixed lines
// for a rule: the room posts those lines itself, the model never writes them.
export function extractPrompt(markdown: string): string {
  const m = markdown.match(/```text\n([\s\S]*?)```/);
  if (!m) throw new Error('persona file has no ```text block');
  return sanitizePrompt(m[1]);
}

export function sanitizePrompt(text: string): string {
  const fixedRule =
    '- Never write the ship status line or the Praxia sync line yourself. The room posts those lines, word for word, on its own.';
  const lines = text
    .replace(/\s*\[QUERY[^\]]*\]/g, '')
    .replace(/\s*\(PROPOSED[^)]*\)/g, '')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''));
  const out: string[] = [];
  let addedFixedRule = false;
  for (const line of lines) {
    if (/GRID OK \| IWW VIEWPORT|You cannot sync with Praxia/.test(line)) {
      if (!addedFixedRule) { out.push(fixedRule); addedFixedRule = true; }
      continue;
    }
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
