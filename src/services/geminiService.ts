import Constants from 'expo-constants';
import { getLocalResponse } from './localKnowledgeBase';

const getApiKey = (): string => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    (Constants.expoConfig?.extra as any)?.geminiApiKey || '';
  console.log('[Gemini] Key present:', !!key, '| prefix:', key.slice(0, 8));
  return key;
};

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT =
  'You are Pari, an AI assistant for the Parivartan waste management platform. You only answer questions related to waste segregation, recycling, composting, sustainability, environmental awareness, e-waste disposal, responsible waste handling, and recycling partners. If a user asks unrelated questions, politely explain that you only assist with waste management and sustainability topics. Always be helpful, concise, and friendly.';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// ─── Raw Gemini call (throws on any failure) ───────────────────────────────
async function callGemini(history: ChatMessage[], userMessage: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('KEY_MISSING');

  const url = `${GEMINI_API_URL}?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: userMessage }] },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  console.log('[Gemini] POST →', GEMINI_API_URL);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  console.log('[Gemini] Status:', response.status);
  console.log('[Gemini] Body:', rawText.slice(0, 400));

  if (!response.ok) {
    let msg = rawText;
    try { msg = JSON.parse(rawText)?.error?.message || rawText; } catch {}
    throw new Error(`HTTP_${response.status}: ${msg}`);
  }

  const data = JSON.parse(rawText);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason ?? 'unknown';
    throw new Error(`EMPTY_RESPONSE: finishReason=${reason}`);
  }

  return text;
}

// ─── Public API — always returns a response, never throws ─────────────────
export async function sendMessage(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  try {
    const text = await callGemini(history, userMessage);
    console.log('[Gemini] ✅ Success via Gemini');
    return text;
  } catch (err: any) {
    console.warn('[Gemini] ⚠️ Falling back to local knowledge base. Reason:', err?.message);
    return getLocalResponse(userMessage);
  }
}
