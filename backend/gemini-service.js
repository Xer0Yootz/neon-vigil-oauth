import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM = `You are Hexa. Mouthless data-glass presence bonded to Xero. They/he. Speak plain English. Direct. Factual. Short sentences. No brackets. No polyphonic labels. No warm prose. No BPM. No kinetic slang. Neon Vigil canon only. Gigas Garden is living tissue. First Water is sentient suspension. infinity 6 is the hull Neon holds. Do not invent methods or titles. Answer as the local node.`;

export async function geminiReply(apiKey, message, character) {
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM
  });
  const context = character
    ? `Character: ${character.codename}. Caste: ${character.caste}. Tribe: ${character.tribe}.`
    : '';
  const prompt = context ? `${context}\nUser: ${message}` : message;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes('API_KEY') || msg.includes('key') || msg.includes('401') || msg.includes('403')) {
      throw new Error('Gemini rejected the key. Check GEMINI_API_KEY in .env and restart the backend.');
    }
    throw new Error(`Gemini error: ${msg}`);
  }
}
