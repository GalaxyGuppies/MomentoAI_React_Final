import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LibraryScreen from '../app/(tabs)/library';
import ImageDetail from '../app/image-detail/[name]';

export type LibraryStackParamList = {
  Library: undefined;
  ImageDetail: {
    name?: string | string[];
    uri?: string;
    analysis?: any;
    uuid?: string;
  };
};

const Stack = createStackNavigator<LibraryStackParamList>();

export default function LibraryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ImageDetail" component={ImageDetail} options={{ headerTitle: 'Image Detail' }} />
    </Stack.Navigator>
  );
}
