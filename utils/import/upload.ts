import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
// Handles image upload to backend
// Removed RNFetchBlob imports
export async function uploadImage({ fileUri, uuid, metadata }: {
  fileUri: string;
  uuid: string;
  metadata: any;
}): Promise<any> {
  // Optimize image before upload (resize/compress)
  let optimizedUri = fileUri;
  try {
    const manipResult = await ImagePicker.openCropper({
      path: fileUri,
      width: 2048,
      height: 2048,
      compressImageQuality: 0.7,
      cropping: true,
      cropperCircleOverlay: false,
      mediaType: 'photo',
      includeBase64: false,
    });
    optimizedUri = manipResult.path;
    console.log('[UploadAsync] optimizedUri:', optimizedUri);
  } catch (err) {
    console.warn('Image optimization failed, using original:', err);
  }
  if (!optimizedUri || typeof optimizedUri !== 'string' || !optimizedUri.startsWith('file')) {
    throw new Error('Invalid fileUri for upload: ' + optimizedUri);
  }
  let fileInfo;
  try {
    fileInfo = await RNFS.stat(optimizedUri);
  } catch (e) {
    throw new Error('File does not exist at URI: ' + optimizedUri);
  }
  const uploadUrl = `${API_BASE_URL}${API_ENDPOINTS.UPLOAD_IMAGE}`;
  console.log('[UploadAsync] fileUri:', optimizedUri);
  console.log('[UploadAsync] uuid_str:', uuid);
  console.log('[UploadAsync] metadata:', JSON.stringify(metadata));
  console.log('UploadAsync fetch URL:', uploadUrl);
  try {
    // Use fetch for custom timeout
    const formData = new FormData();
    formData.append('file', {
      uri: optimizedUri,
      type: 'image/jpeg',
      name: optimizedUri.split('/').pop(),
    } as any);
    formData.append('uuid_str', uuid);
    formData.append('metadata', JSON.stringify(metadata));

  // ...existing code...

    function fetchWithTimeout(resource: RequestInfo, options: any = {}) {
      const { timeout = 120000 } = options; // 2 min timeout
      return Promise.race([
        fetch(resource, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
    }

    const response = await fetchWithTimeout(uploadUrl, {
      method: 'POST',
      body: formData,
      timeout: 120000,
    }) as Response;
    if (!response.ok) {
      const body = await response.text();
      console.error('UploadAsync error:', body);
      throw new Error(body);
    }
    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = await response.text();
    }
    return result;
  } catch (err) {
    console.error('UploadAsync exception:', err);
    throw err;
  }
}
