import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Personality = 'Friendly' | 'Professional' | 'Playful' | 'Serious' | 'Rude' | 'Sarcastic' | 'TARS';
export type Emotion = 'Happy' | 'Calm' | 'Excited' | 'Focused' | 'Neutral' | 'Sad' | 'Surprised';

export interface PersonalityContextType {
  personality: Personality;
  setPersonality: (p: Personality) => void;
  emotion: Emotion;
  setEmotion: (e: Emotion) => void;
  randomizeEmotion: () => void;
}

const PersonalityContext = createContext<PersonalityContextType>({
  personality: 'Friendly',
  setPersonality: () => {},
  emotion: 'Neutral',
  setEmotion: () => {},
  randomizeEmotion: () => {},
});

export const usePersonality = () => useContext(PersonalityContext);

export const PersonalityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personality, setPersonalityState] = useState<Personality>('Friendly');
  const [emotion, setEmotionState] = useState<Emotion>('Neutral');

  useEffect(() => {
    AsyncStorage.getItem('personality').then(p => {
      if (p) {
        setPersonalityState(p as Personality);
      }
    });
    AsyncStorage.getItem('emotion').then(e => {
      if (e) {
        setEmotionState(e as Emotion);
      }
    });
  }, []);

  // Weighted random selection for more frequent, visible mood swings
  const emotionOptions: Emotion[] = [
    'Happy','Calm','Excited','Focused','Neutral','Sad','Surprised',
    'Happy','Calm','Excited','Focused','Sad','Surprised', // duplicate to increase non-neutral odds
    'Happy','Excited','Sad','Surprised' // even more non-neutral
  ];

  // Call this to randomly update the emotion (mood)
  const randomizeEmotion = () => {
    const next = emotionOptions[Math.floor(Math.random() * emotionOptions.length)];
    setEmotionState(next);
    AsyncStorage.setItem('emotion', next);
  };

  const setPersonality = (p: Personality) => {
    setPersonalityState(p);
    AsyncStorage.setItem('personality', p);
  };

  const setEmotion = (e: Emotion) => {
    setEmotionState(e);
    AsyncStorage.setItem('emotion', e);
  };

  // Expose randomizeEmotion in context for use in UI
  return (
    <PersonalityContext.Provider value={{ personality, setPersonality, emotion, setEmotion, randomizeEmotion }}>
      {children}
    </PersonalityContext.Provider>
  );
};