import { API_BASE_URL, API_ENDPOINTS } from "./config";

/**
 * Generates text using the backend AI model.
 * @param prompt - The prompt to send to the model.
 * @param maxLength - Maximum length of generated text.
 * @returns Generated text string.
 */
export async function generateText(prompt: string, maxLength: number = 256) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERATE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, max_length: maxLength })
  });
  const data = await response.json();
  return data.result;
}

/**
 * Summarizes text using the backend AI model.
 * @param text - The text to summarize.
 * @returns Summary string.
 */
export async function summarizeText(text: string) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUMMARIZE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await response.json();
  return data.summary;
}

/**
 * Performs Named Entity Recognition (NER) on text using the backend AI model.
 * @param text - The text to analyze.
 * @returns Array of recognized entities.
 */
export async function nerText(text: string) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await response.json();
  return data.entities;
}
