// OpenAI API utility for Q&A
import { OPENAI_API_KEY } from '@env';

/**
 * Sends a question to OpenAI's chat API and returns the answer.
 * @param question - The user's question.
 * @param context - Optional context to provide to the model.
 * @returns The answer from OpenAI as a string.
 */
export async function askOpenAI(question: string, context: string = ''): Promise<string> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
    return 'OpenAI API key not set. Please add your key in .env.';
  }
  const prompt = context
    ? `Context:\n${context}\n\nUser question: ${question}`
    : question;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 256,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    return `OpenAI error: ${res.statusText}`;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || 'No answer.';
}