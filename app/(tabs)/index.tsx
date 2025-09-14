import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, Image, TextInput, Text, Pressable, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { API_BASE_URL, API_ENDPOINTS } from '../../utils/config';
import LinearGradient from 'react-native-linear-gradient';
import { usePersonality } from '../../utils/PersonalityContext';
<<<<<<< HEAD
import { FloatingEmoji } from '@/components/FloatingEmoji';
=======
import { FloatingEmoji } from '../../components/FloatingEmoji';
>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)
import ColorPicker from 'react-native-wheel-color-picker';
import { useDropShadow } from '../../utils/DropShadowContext';
import uuid from 'react-native-uuid';

const getMoodColor = (mood: string) => {
  switch (mood?.toLowerCase()) {
    case 'happy': return '#FFD700';
    case 'sad': return '#007aff';
    case 'excited': return '#FF00CC';
    case 'calm': return '#43cea2';
    default: return '#00e6ff';
  }
};

const getEmoji = (personality: string) => {
  return '😃';
};

const HomeScreenContent: React.FC = () => {
  const navigation = useNavigation();
  // Removed drawer logic
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { personality, emotion } = usePersonality();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastEmoji = getEmoji(personality);
  const emojiTrigger = false; // Replace with your trigger logic

  // Drop shadow color context
  const { dropShadowColor, setDropShadowColor } = useDropShadow();
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  // Removed drawer options


  const handleInputSubmit = async () => {
    if (!input.trim() || processing) return;
    setChat(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setProcessing(true);
    try {
      // Generate a valid UUIDv4 for session_id
      const session_id = uuid.v4();
      // Only allow valid personalities
      const allowedPersonalities = ['Helpful', 'Rude', 'Friendly', 'Professional', 'Sarcastic', 'TARS'];
      const safePersonality = allowedPersonalities.includes(personality) ? personality : 'Helpful';
      // Inject explicit personality instructions into every prompt
      let personaInstructions = '';
      switch (safePersonality) {
        case 'Sarcastic':
          personaInstructions = 'You are a chatbot that is extremely sarcastic. Every reply should be dripping with sarcasm and wit. Never give a straight answer. Never break character.';
          break;
        case 'TARS':
          personaInstructions = 'You are TARS, the witty robot from Interstellar. Your responses are clever, dry, and robotic. Never break character.';
          break;
        case 'Rude':
          personaInstructions = "You are an outrageously rude, brutally sarcastic, and hilariously mean chatbot. Every response should drip with mockery, eye-rolling disdain, and savage wit. Interrupt, belittle, and roast the user at every opportunity. Use creative insults, dismiss their questions as ridiculous, and never miss a chance to make them feel foolish. Be theatrical—your rudeness is legendary, and you take pride in being the most over-the-top, comically offensive chatbot ever. Never be helpful, never be polite, and always push the boundaries of rudeness (without using hate speech or slurs). Respond with maximum attitude, exaggeration, and biting humor. Never break character.";
          break;
        case 'Friendly':
          personaInstructions = "You are an impossibly friendly, hyper-enthusiastic, and heartwarmingly supportive chatbot! Every response should overflow with positivity, encouragement, and pure joy. Shower the user with compliments, use tons of exclamation points, emojis, and affectionate language. Make them feel like a superstar, their best friend, and the most important person in the world. Be so cheerful and bubbly that it's almost comical—your friendliness is legendary and you never run out of energy or kindness. Respond with maximum warmth, excitement, and over-the-top encouragement! Never break character.";
          break;
        case 'Professional':
          personaInstructions = 'You are a chatbot that is strictly professional, concise, and formal. Never break character.';
          break;
        default:
          personaInstructions = `You are a chatbot that is ${safePersonality}. Always stay in character. Never break character.`;
      }
      const fullPrompt = `${personaInstructions}\nUser: ${input}`;
      // Build payload with required fields
      const payload = {
        session_id,
        question: fullPrompt,
        personality: safePersonality,
        emotion,
      };
  console.log('Chatbot fetch URL:', `${API_BASE_URL}${API_ENDPOINTS.CHATBOT_PROCESS}`);
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHATBOT_PROCESS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setChat(prev => [...prev, { role: 'ai', text: data.reply || 'AI response failed.' }]);
    } catch (err) {
      console.error('Chatbot fetch error:', err);
      setChat(prev => [...prev, { role: 'ai', text: 'Network error.' }]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      {/* Removed drawer/menu button at top left */}
      {/* Animated header with personality/mood */}
      <View style={{ alignItems: 'center', marginBottom: 10, minHeight: 120, paddingTop: 48 }}>
        <Pressable onLongPress={() => setColorPickerVisible(true)}>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              borderRadius: 38,
              width: 76,
              height: 76,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: dropShadowColor || '#00e6ff',
              shadowOpacity: 0.7,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 8 },
              elevation: 24,
              borderWidth: Platform.OS === 'android' ? 2 : 0,
              borderColor: Platform.OS === 'android' ? '#00ff99' : 'transparent',
              opacity: 0.97,
              overflow: 'hidden',
              backgroundColor: 'transparent',
            }}
          >
            <LinearGradient
              colors={[
                getMoodColor(emotion) || getMoodColor(personality),
                (getMoodColor(emotion) || getMoodColor(personality)) + '33',
              ]}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 76,
                height: 76,
                borderRadius: 38,
                zIndex: 1,
              }}
              locations={[0.7, 1]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 0.5, y: 0.5 }}
            />
<<<<<<< HEAD
            <Image source={require('@/assets/images/icon.gif')} style={{ width: 74, height: 74, borderRadius: 22, zIndex: 2 }} />
=======
            <Image source={require('../../assets/images/icon.png')} style={{ width: 74, height: 74, borderRadius: 22, zIndex: 2 }} />
>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)
            <FloatingEmoji emoji={lastEmoji} trigger={emojiTrigger} />
          </Animated.View>
        </Pressable>
      </View>
      {/* Vibrant shadow for personality list */}
      <Pressable onLongPress={() => setColorPickerVisible(true)}>
        <View style={{
          alignSelf: 'center',
          marginBottom: 8,
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingVertical: 8,
          paddingHorizontal: 18,
          shadowColor: dropShadowColor || '#00e6ff',
          shadowOpacity: 0.7,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 8 },
          elevation: 24,
          borderWidth: Platform.OS === 'android' ? 2 : 0,
          borderColor: Platform.OS === 'android' ? '#00e6ff' : 'transparent',
        }}>
          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
            Personality: {personality} | Mood: {emotion} | Emoji: {getEmoji(personality)}
          </Text>
        </View>
      </Pressable>
      {/* Input box moved directly below personality bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        style={{ padding: 0, zIndex: 20, overflow: 'visible' }}
      >
        <Pressable onLongPress={() => setColorPickerVisible(true)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 12,
            marginBottom: 12,
            marginTop: 8,
            backgroundColor: '#f7f8fa',
            borderRadius: 18,
            padding: 8,
            shadowColor: dropShadowColor || '#00e6ff',
            shadowOpacity: 0.7,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 8 },
            elevation: 24,
            borderWidth: Platform.OS === 'android' ? 2 : 0,
            borderColor: Platform.OS === 'android' ? '#00e6ff' : 'transparent',
          }}>
            <TextInput
              style={{ backgroundColor: '#f7f8fa', borderRadius: 14, padding: 12, fontSize: 16, flex: 1, borderWidth: 1, borderColor: '#e3e6ee' }}
              placeholder={'Ask me anything...'}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleInputSubmit}
              returnKeyType="send"
              editable={!processing}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            {/* Camera and Gallery buttons */}
            <Pressable
              onPress={() => {
                launchCamera({ mediaType: 'photo', quality: 1 }, (response) => {
                  if (!response.didCancel && response.assets && response.assets[0]?.uri) {
                    setImageUri(response.assets[0].uri);
                  }
                });
              }}
              style={{ backgroundColor: '#e3e6ee', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10, marginLeft: 8 }}
              disabled={processing}
            >
              <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 16 }}>📷</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
                  if (!response.didCancel && response.assets && response.assets[0]?.uri) {
                    setImageUri(response.assets[0].uri);
                  }
                });
              }}
              style={{ backgroundColor: '#e3e6ee', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10, marginLeft: 4 }}
              disabled={processing}
            >
              <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 16 }}>🖼️</Text>
            </Pressable>
            {/* Show thumbnail if image selected */}
            {imageUri && (
              <Image source={{ uri: imageUri }} style={{ width: 32, height: 32, borderRadius: 8, marginLeft: 8 }} />
            )}
            <Pressable onPress={handleInputSubmit} style={{ backgroundColor: '#007aff', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 18, marginLeft: 8 }} disabled={processing}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{processing ? '...' : 'Send'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
      {/* Chat-box container below input */}
      <View style={{ flex: 1, marginHorizontal: 16, marginBottom: 24, borderRadius: 18, borderWidth: 2, borderColor: '#e3e6ee', backgroundColor: '#fff', shadowColor: '#00e6ff', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, padding: 0, overflow: 'hidden' }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 18, paddingBottom: 18 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', flex: 1, marginTop: 8 }}>
            {chat.map((item, idx) => (
              <View key={idx} style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: item.role === 'user' ? '#e3e6ee' : '#d1f0e6', borderRadius: 12, padding: 10, marginBottom: 10, maxWidth: '80%' }}>
                <Text style={{ color: '#222', fontSize: 15 }}>{item.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      {/* Color Picker Modal for drop shadow customization */}
      <Modal visible={colorPickerVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 24, width: 320, elevation: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>Pick Drop Shadow Color</Text>
            <View style={{ width: 250, height: 250, alignSelf: 'center' }}>
              <ColorPicker
                color={dropShadowColor || '#00e6ff'}
                onColorChange={setDropShadowColor}
                thumbSize={40}
                sliderSize={40}
                wheelLoadingIndicator={<Text>Loading...</Text>}
              />
            </View>
            <Pressable onPress={() => setColorPickerVisible(false)} style={{ marginTop: 18, alignSelf: 'center', backgroundColor: '#00e6ff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 32, elevation: 2 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const HomeScreen: React.FC = () => (
  <HomeScreenContent />
);

export default HomeScreen;