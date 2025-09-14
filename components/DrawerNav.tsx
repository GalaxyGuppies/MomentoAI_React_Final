import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/types';
import { launchCamera } from 'react-native-image-picker';

const DrawerNav: React.FC = () => {
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const drawerOptions = [
    { label: 'Home', icon: <Ionicons name="home-outline" size={28} color="#007aff" />, color: '#f5f5f5', onPress: () => navigation.navigate('Home') },
    { label: 'Gallery', icon: <Ionicons name="images-outline" size={28} color="#FFC300" />, color: '#f5f5f5', onPress: () => navigation.navigate('Library') },
    { label: 'Camera', icon: <Ionicons name="camera-outline" size={28} color="#FF1744" />, color: '#f5f5f5', onPress: async () => {
      launchCamera({ mediaType: 'photo', quality: 1 }, (response) => {
        if (!response.didCancel && response.assets && response.assets[0]?.uri) {
          setImageUri(response.assets[0].uri);
        }
      });
    }},
    { label: 'Import', icon: <Ionicons name="cloud-upload-outline" size={28} color="#00C853" />, color: '#f5f5f5', onPress: () => navigation.navigate('Import') },
    { label: 'Settings', icon: <Ionicons name="settings-outline" size={28} color="#651FFF" />, color: '#f5f5f5', onPress: () => navigation.navigate('Settings') },
  ];


  return (
  <View style={{ position: 'absolute', top: 40, left: 16, zIndex: 100, maxWidth: 154, justifyContent: 'flex-start' }}>
      <TouchableOpacity
        onPress={() => setDrawerOpen(!drawerOpen)}
        style={{
          backgroundColor: '#fff',
          borderRadius: 18,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#00e6ff',
          shadowOpacity: 1,
          shadowRadius: 32,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
        }}
      >
  <Text style={{ fontSize: 16 }}>{drawerOpen ? '✖️' : '☰'}</Text>
      </TouchableOpacity>
      {drawerOpen && (
        <View style={{
          position: 'absolute',
          top: 54,
          left: 0,
          backgroundColor: '#fff',
          borderRadius: 20,
          paddingVertical: 18,
          paddingHorizontal: 10,
          shadowColor: '#00e6ff',
          shadowOpacity: 1,
          shadowRadius: 32,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 200,
        }}>
          {drawerOptions.map((opt, idx) => {
            const bounceAnim = new Animated.Value(1);
            const handlePressIn = () => {
              setPressedIdx(idx);
              Animated.spring(bounceAnim, {
                toValue: 1.15,
                friction: 4,
                useNativeDriver: true,
              }).start();
            };
            const handlePressOut = () => {
              setPressedIdx(null);
              Animated.spring(bounceAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
              }).start();
            };
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={async () => {
                  setDrawerOpen(false);
                  opt.onPress();
                }}
                activeOpacity={0.7}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: opt.color,
                  borderRadius: 18,
                  width: 32,
                  height: 32,
                  marginBottom: 12,
                  shadowColor: '#00e6ff',
                  shadowOpacity: 1,
                  shadowRadius: 32,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 12,
                }}
              >
                <Animated.View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  transform: [{ scale: pressedIdx === idx ? bounceAnim : 1 }],
                }}>
                  {React.cloneElement(opt.icon, { size: 16 })}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default DrawerNav;
