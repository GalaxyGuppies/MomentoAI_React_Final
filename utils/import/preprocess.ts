import { API_BASE_URL, API_ENDPOINTS } from '../config';
// Handles backend image preprocessing API calls
<<<<<<< HEAD
import { resizeImage } from '@/hooks/resizeImage';
=======
import { resizeImage } from '../../hooks/resizeImage';
>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)
import { decode as atob } from 'base-64';

export async function preprocessImageBackend(uri: string, PREPROCESS_API_URL: string, uuid_str: string): Promise<any> {
  try {
    const resizedBase64 = await resizeImage(uri, 4096, 4096);
    // Save base64 to file and use its URI for FormData
    let fileUri = '';
    if (resizedBase64 && typeof resizedBase64 === 'string') {
  const RNFS = require('react-native-fs');
  fileUri = `${RNFS.CachesDirectoryPath}/photo_${Date.now()}.jpg`;
  await RNFS.writeFile(fileUri, resizedBase64, 'base64');
    }
    const formData = new FormData();
    // Always use file URI object for React Native
    // Double-check file exists before upload
    if (fileUri) {
      const RNFS = require('react-native-fs');
      let fileInfo;
      try {
        fileInfo = await RNFS.stat(fileUri);
        console.log('[preprocessImageBackend] File exists at fileUri:', fileUri, 'size:', fileInfo.size);
      } catch (e) {
        console.error('[preprocessImageBackend] ERROR: File does not exist at fileUri:', fileUri);
        throw new Error('File does not exist at fileUri: ' + fileUri);
      }
    }
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
  formData.append('image_uri', uri);
  formData.append('uuid_str', uuid_str);
  // Debug: Log all request details
  console.log('[preprocessImageBackend] --- REQUEST DEBUG ---');
  console.log('[preprocessImageBackend] URL:', PREPROCESS_API_URL);
  console.log('[preprocessImageBackend] FormData fields:');
  console.log('  fileField:', fileUri);
  console.log('  image_uri:', uri);
  console.log('  uuid_str:', uuid_str);
  console.log('[preprocessImageBackend] ---------------------');
  console.log('[preprocessImageBackend] file URI:', fileUri);
    const response = await fetch(PREPROCESS_API_URL, {
      method: 'POST',
      body: formData,
      // DO NOT set Content-Type header for FormData; let fetch set it automatically
    });
    if (!response.ok) {
      console.error('[preprocessImageBackend] Response not OK:', response.status, response.statusText);
      return {};
    }
    let json = null;
    try {
      json = await response.json();
    } catch (err) {
      // Log raw response and headers for debugging
      const text = await response.text();
      console.error('Invalid JSON from preprocessImageBackend:', err);
      console.error('[preprocessImageBackend] Raw response:', text);
      if (response.headers && typeof response.headers.forEach === 'function') {
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value: string, key: string) => { headersObj[key] = value; });
        console.error('[preprocessImageBackend] Response headers:', headersObj);
      } else {
        console.error('[preprocessImageBackend] Response headers:', response.headers);
      }
      return {};
    }
    return json;
  } catch (err) {
    console.error('[preprocessImageBackend] error:', err);
    throw err;
  }
}

export async function testBackendConnection(PREPROCESS_API_URL: string): Promise<boolean> {
  try {
    const response = await fetch(PREPROCESS_API_URL, { method: 'GET' });
    if (response.ok) {
      console.log('[testBackendConnection] Success:', response.status);
      return true;
    } else {
      console.error('[testBackendConnection] Failed:', response.status, response.statusText);
      return false;
    }
  } catch (err) {
    console.error('[testBackendConnection] Network error:', err);
    return false;
  }
}

export function getFullImageUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * Confirm and resolve image category after backend response.
 * Use backend category unless it's 'Uncategorized', then fallback to frontend-detected category.
 * Returns the final category to use for saving/uploading the image.
 */
export function resolveImageCategory(backendCategory: string, frontendCategory: string): string {
  if (backendCategory && backendCategory !== 'Uncategorized') {
    return backendCategory;
  }
  return frontendCategory || 'Uncategorized';
}

// Example usage in your import workflow (e.g., in import.tsx):
//
// After receiving backend response:
// const backendCategory = backendResult.category;
// const frontendCategory = getCategory(labels, text); // or however you detect category in frontend
// const finalCategory = resolveImageCategory(backendCategory, frontendCategory);
// Use finalCategory when saving/uploading the image
//
// Example:
// const storedImage = {
//   ...otherFields,
//   category: finalCategory,
//   // ...
// };
// await fileContext.addFile(storedImage);
