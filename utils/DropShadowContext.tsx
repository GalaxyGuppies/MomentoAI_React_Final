import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DropShadowContextType {
  dropShadowColor: string | null;
  setDropShadowColor: (color: string | null) => void;
}

const DropShadowContext = createContext<DropShadowContextType>({
  dropShadowColor: null,
  setDropShadowColor: () => {},
});

export const useDropShadow = () => useContext(DropShadowContext);

export const DropShadowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dropShadowColor, setDropShadowColorState] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('dropShadowColor').then(color => {
      if (color) setDropShadowColorState(color);
    });
  }, []);

  const setDropShadowColor = (color: string | null) => {
    setDropShadowColorState(color);
    if (color) {
      AsyncStorage.setItem('dropShadowColor', color);
    } else {
      AsyncStorage.removeItem('dropShadowColor');
    }
  };

  return (
    <DropShadowContext.Provider value={{ dropShadowColor, setDropShadowColor }}>
      {children}
    </DropShadowContext.Provider>
  );
};
