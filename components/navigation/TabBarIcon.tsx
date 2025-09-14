import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ViewStyle } from 'react-native';

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
  style?: ViewStyle;
}

export function TabBarIcon({ name, color, size = 24, style }: TabBarIconProps) {
  return <Ionicons name={name} color={color} size={size} style={style} />;
}
