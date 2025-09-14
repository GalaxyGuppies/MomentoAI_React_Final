

import React, { useState } from 'react';
import { View, Pressable, Text, Modal, TouchableOpacity, Animated, Image, StyleSheet, Platform, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../navigation/types';
import { launchCamera } from 'react-native-image-picker';
// import RNFS from 'react-native-fs'; // Uncomment if file system is needed

export default function BottomNavBar() {
  const [navOpen, setNavOpen] = useState(false);
  const scale = new Animated.Value(1);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  // Camera button handler: open camera, analyze image, show result in chat if on home
  async function handleCamera() {
    try {
      launchCamera({ mediaType: 'photo', quality: 1 }, (response) => {
        if (response.didCancel || !response.assets || !response.assets[0]?.uri) {
          return;
        }
        // ...existing camera logic with response.assets[0].uri...
      });
    } catch (e: any) {
      Alert.alert('Camera Error', e?.message || 'Could not process the image.');
    }
  }

  // Minimal nav bar UI for demonstration (customize as needed)
  return (
    <View style={styles.container}>
  <Pressable onPress={() => navigation.navigate('Home')} style={styles.iconBtn} accessibilityLabel="Home">
        <Ionicons name="home" size={28} color="#007aff" />
      </Pressable>
  <Pressable onPress={() => navigation.navigate('Library')} style={styles.iconBtn} accessibilityLabel="Library">
        <Ionicons name="images" size={28} color="#007aff" />
      </Pressable>
  <Pressable onPress={handleCamera} style={styles.cameraButton} accessibilityLabel="Camera">
        <Ionicons name="camera" size={28} color="#fff" />
      </Pressable>
  <Pressable onPress={() => navigation.navigate('Import')} style={styles.iconBtn} accessibilityLabel="Import">
        <Ionicons name="cloud-upload" size={28} color="#007aff" />
      </Pressable>
  <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconBtn} accessibilityLabel="Settings">
        <Ionicons name="settings" size={28} color="#007aff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 0,
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'ios' ? 18 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderColor: '#e3e6ee',
  },
  drawerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e3e6ee',
  },
  drawerModal: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 260,
    height: 320,
    backgroundColor: '#fff',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderTopRightRadius: 18,
  },
  drawerItem: {
    marginBottom: 18,
  },
  drawerText: {
    fontSize: 18,
  },
  cameraButton: {
    backgroundColor: '#007aff',
    borderRadius: 32,
    padding: 16,
    marginHorizontal: 12,
    top: 8, // Lowered from -16 to 8 to avoid overlap with nav bar handle
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    marginRight: 4,
  },
  animatedIcon: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

