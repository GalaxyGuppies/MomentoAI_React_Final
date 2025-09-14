import ImagePicker from 'react-native-image-crop-picker';

/**
 * Resizes an image to the specified dimensions and returns a base64 string.
 * @param uri - The URI of the image to resize.
 * @param maxWidth - Maximum width of the resized image.
 * @param maxHeight - Maximum height of the resized image.
 * @returns Base64 string of the resized image, or empty string on error.
 */
export async function resizeImage(uri: string, maxWidth: number, maxHeight: number): Promise<string> {
  try {
    const result = await ImagePicker.openCropper({
      path: uri,
      width: maxWidth,
      height: maxHeight,
      compressImageQuality: 0.7,
      cropping: true,
      cropperCircleOverlay: false,
      mediaType: 'photo',
      includeBase64: true,
    });
    return result.data || '';
  } catch (error) {
    return '';
  }
}
