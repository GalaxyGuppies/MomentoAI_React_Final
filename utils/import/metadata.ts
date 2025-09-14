// Handles metadata construction for images
export function buildMetadata({ image, detectedLabels, extractedText, imageUUID, deviceInfo, processedUri, originalImgUri, edgeImgUri, segmentImgUri }: any) {
  return {
    technical: {
      createdAt: Date.now(),
      device: deviceInfo,
      size: image?.fileSize || null,
      type: image?.type || null,
      originalUri: image.uri,
      originalImgUri: originalImgUri ?? null,
      uuid: imageUUID,
    },
    descriptive: {
      labels: detectedLabels,
      text: extractedText,
      yoloObjects: [],
    },
    administrative: {
      importedBy: 'user',
      importTimestamp: Date.now(),
      uuid: imageUUID,
    },
    contextual: {
      previousCorrections: [],
    },
  };
}
