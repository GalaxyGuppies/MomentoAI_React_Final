// Local EXIF extraction utility using pure JS (privacy-friendly)
// You can use 'exif-js' or similar libraries for React Native/Expo
// This example assumes you have installed 'exif-js' via npm

import EXIF from 'exif-js';

/**
 * Extracts EXIF metadata from an image URI using exif-js.
 * @param uri - The URI of the image.
 * @returns A promise resolving to the EXIF metadata object.
 */
export async function extractExifFromUri(uri: string): Promise<any> {
  return new Promise((resolve) => {
    // Fetch the image as a blob
    fetch(uri)
      .then(res => res.blob())
      .then(blob => {
        EXIF.getData(blob, function(this: any) {
          const allExif = EXIF.getAllTags(this);
          resolve(allExif);
        });
      })
      .catch(() => resolve({}));
  });
}
