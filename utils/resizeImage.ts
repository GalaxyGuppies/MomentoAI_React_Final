import ImagePicker from 'react-native-image-crop-picker';

// Resize image to max dimension (default 4096)
export async function resizeImage(uri: string, maxDim: number = 4096): Promise<{ uri: string, width: number, height: number }> {
  const result = await ImagePicker.openCropper({
    path: uri,
    width: maxDim,
    height: maxDim,
    compressImageQuality: 1,
    cropping: true,
    cropperCircleOverlay: false,
    mediaType: 'photo',
    includeBase64: false,
  });
  return { uri: result.path, width: result.width, height: result.height };
}
