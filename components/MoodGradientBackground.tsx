import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { usePersonality } from '../utils/PersonalityContext';

const moodGradients: Record<string, string[]> = {
  Friendly: ['#fceabb', '#f8b500'],
  Professional: ['#cfd9df', '#e2ebf0'],
  Playful: ['#f7971e', '#ffd200'],
  Serious: ['#232526', '#414345'],
  Happy: ['#f9d423', '#ff4e50'],
  Calm: ['#a1c4fd', '#c2e9fb'],
  Excited: ['#f857a6', '#ff5858'],
  Focused: ['#43cea2', '#185a9d'],
  Neutral: ['#ece9e6', '#ffffff'],
  Sad: ['#485563', '#29323c'],
  Surprised: ['#f7971e', '#ffd200'],
};

export const MoodGradientBackground: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { personality, emotion } = usePersonality();
  // Prefer emotion gradient if not Neutral, else use personality
  const gradient = emotion !== 'Neutral' && moodGradients[emotion]
    ? moodGradients[emotion]
    : moodGradients[personality] || moodGradients['Neutral'];
  return (
    <LinearGradient
      colors={gradient}
      style={{ flex: 1, minHeight: '100%', minWidth: '100%' }}
    >
      {children}
    </LinearGradient>
  );
};