
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import TabNavigator from './navigation/TabNavigator';
import ImageDetail from './app/image-detail/[name]';
import { FileProvider } from './context/FileContext';
import { PersonalityProvider } from './utils/PersonalityContext';
import { DropShadowProvider } from './utils/DropShadowContext';
import DrawerNav from './components/DrawerNav';

export type RootStackParamList = {
  Main: undefined;
  ImageDetail: { name?: string | string[]; uri?: string; analysis?: any; uuid?: string };
};

const RootStack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <FileProvider>
      <DropShadowProvider>
        <PersonalityProvider>
          <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false } as StackNavigationOptions}>
              <RootStack.Screen name="Main" component={TabNavigator} />
              <RootStack.Screen name="ImageDetail" component={ImageDetail} options={{ headerShown: true, headerTitle: 'Image Detail' }} />
            </RootStack.Navigator>
            <DrawerNav />
          </NavigationContainer>
        </PersonalityProvider>
      </DropShadowProvider>
    </FileProvider>
  );
}
