import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface FloatingEmojiProps {
  emoji: string;
  trigger: any; // change this value to trigger animation
}

export const FloatingEmoji: React.FC<FloatingEmojiProps> = ({ emoji, trigger }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.2,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0.8,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, [trigger, emoji]);

  // Emoji floats up a bit, lingers, then slides off to the right and fades out
  const translateY = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, -18, -18, -18],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 60],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View style={[styles.emoji, { transform: [{ translateY }, { translateX }], opacity }]}> 
      <Text style={{ fontSize: 44 }}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  emoji: {
    position: 'absolute',
    left: '50%',
    marginLeft: -22,
    top: -48,
    zIndex: 20,
    // pointerEvents: 'none',
  },
});
