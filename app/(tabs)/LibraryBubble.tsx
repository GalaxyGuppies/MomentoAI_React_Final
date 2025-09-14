import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LibraryBubbleProps {
  color: string;
  label: string;
  previewUri?: string;
}

export default function LibraryBubble({ color, label, previewUri }: LibraryBubbleProps) {
  // Enhance color opacity (ensure it's more solid)
  const bubbleColor = color.length === 9 ? color : color + 'E6'; // add ~90% opacity if not present
  return (
    <View style={styles.bubbleContainer}>
      {/* Drop shadow for depth */}
      <View style={styles.shadow} pointerEvents="none" />
      <LinearGradient
        colors={[color, '#fff', color]}
        start={[0.2, 0.1]}
        end={[0.8, 0.9]}
        style={styles.gradient}
      />
      {/* Preview image (under overlay) */}
      {previewUri && (
        <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
      )}
      {/* Glossy/reflective overlay (simulate with a white arc) */}
      <View style={styles.gloss} pointerEvents="none" />
      {/* Optional: keep PNG overlay for extra texture */}
      <Image source={require('../../assets/images/LibraryBubble.png')} style={styles.overlay} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    margin: 16,
    position: 'relative',
    // Drop shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 45,
    zIndex: 0,
  },
  shadow: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: -8,
    height: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 0,
    opacity: 0.7,
    // Blur effect is not natively supported, but this simulates a soft shadow
  },
  gloss: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    height: 28,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.32)',
    zIndex: 2,
    opacity: 0.85,
    // Simulate a reflective arc
    transform: [{ rotate: '-8deg' }],
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    zIndex: 3,
  },
  preview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    position: 'absolute',
    zIndex: 1,
    opacity: 1,
  },
  label: {
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    zIndex: 4,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
