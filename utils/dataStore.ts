/**
 * Sends extracted data to backend for storage in vicuna_data.
 * @param title - Title of the data.
 * @param content - Content to store.
 * @returns True if the request was successful, false otherwise.
 */
import { DATASTORE_BASE_URL, API_ENDPOINTS } from "./config";

export async function saveExtractedData(title: string, content: string) {
  const response = await fetch(`${DATASTORE_BASE_URL}${API_ENDPOINTS.SAVE_DATA}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  return response.ok;
}
