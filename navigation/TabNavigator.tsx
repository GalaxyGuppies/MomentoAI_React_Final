import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Import your tab screens
import LibraryStack from './LibraryStack';
import CameraScreen from '../app/(tabs)/camera';
import ImportScreen from '../app/(tabs)/import';
import SettingsScreen from '../app/(tabs)/settings';
import HomeScreen from '../app/(tabs)/index';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Library') iconName = 'images';
          else if (route.name === 'Camera') iconName = 'camera';
          else if (route.name === 'Import') iconName = 'cloud-upload';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Library" component={LibraryStack} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Import" component={ImportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
