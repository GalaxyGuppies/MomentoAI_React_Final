import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator, Text } from 'react-native';

interface AspectRatioImageProps {
  uri: string;
  maxWidth?: number;
  maxHeight?: number;
  style?: object;
}

export default function AspectRatioImage({ uri, maxWidth = 200, maxHeight = 200, style = {} }: AspectRatioImageProps) {
  const [dimensions, setDimensions] = useState({ width: maxWidth, height: maxHeight });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Normalize file URI to always have exactly three slashes (file:///)
  function normalizeUri(inputUri: string): string {
    if (inputUri && inputUri.startsWith('file:/')) {
      // Replace any sequence of more than three slashes after 'file:' with exactly three
      return inputUri.replace(/^file:\/*/, 'file:///');
    }
    return inputUri;
  }

  const normalizedUri = normalizeUri(uri);

  useEffect(() => {
    setError(false);
    setLoading(true);
    if (normalizedUri) {
      Image.getSize(
        normalizedUri,
        (width, height) => {
          let ratio = width / height;
          let displayWidth = maxWidth;
          let displayHeight = maxHeight;
          if (width > height) {
            displayHeight = Math.round(maxWidth / ratio);
          } else {
            displayWidth = Math.round(maxHeight * ratio);
          }
          setDimensions({ width: displayWidth, height: displayHeight });
          setLoading(false);
        },
        () => {
          setError(true);
          setLoading(false);
        }
      );
    }
  }, [normalizedUri, maxWidth, maxHeight]);

  if (loading) return <ActivityIndicator size="small" />;
  if (error) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', width: maxWidth, height: maxHeight, backgroundColor: '#fff0f0', borderRadius: 8, borderWidth: 1, borderColor: '#e53935', padding: 10 }}>
        <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 16 }}>Failed to load image</Text>
        <Text style={{ color: '#333', fontSize: 12, marginTop: 6 }}>URI: {normalizedUri}</Text>
        <Text style={{ color: '#333', fontSize: 12, marginTop: 2 }}>Check if file exists at this URI and if permissions are correct.</Text>
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={{ uri: normalizedUri }}
        style={{ width: dimensions.width, height: dimensions.height, ...style }}
        resizeMode="contain"
        onError={() => setError(true)}
      />
    </View>
  );
}
