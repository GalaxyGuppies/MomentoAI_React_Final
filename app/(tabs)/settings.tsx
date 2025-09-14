import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePersonality, Personality } from '../../utils/PersonalityContext';

const PERSONALITIES: { key: Personality; label: string; description: string }[] = [
  { key: 'Friendly', label: 'Friendly', description: 'Cheerful and supportive.' },
  { key: 'Professional', label: 'Professional', description: 'Polished and efficient.' },
  { key: 'Playful', label: 'Playful', description: 'Fun and energetic.' },
  { key: 'Serious', label: 'Serious', description: 'Focused and direct.' },
  { key: 'Sarcastic', label: 'Sarcastic', description: 'Witty and dry humor.' },
  { key: 'TARS', label: 'TARS', description: 'Honest, logical, and a bit robotic.' },
  { key: 'Rude', label: 'Rude', description: 'Outright rude, sarcastic, and often unhelpful.' },
];

export default function SettingsScreen() {
  const { personality, setPersonality } = usePersonality();
  const [selected, setSelected] = useState<Personality>(personality);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation();

  async function handleSave() {
    setSaving(true);
    await setPersonality(selected);
    setSaving(false);
    navigation.navigate('Home');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Custom header with back and home buttons */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back"
          >
            <Text style={styles.headerIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <Pressable
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Home')}
            accessibilityLabel="Home"
          >
            <Text style={styles.headerIcon}>🏠</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Icon Personality</Text>
        {PERSONALITIES.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.option, selected === p.key && styles.selected]}
            onPress={() => setSelected(p.key)}
          >
            <Text style={styles.label}>{p.label}</Text>
            <Text style={styles.desc}>{p.description}</Text>
            {selected === p.key && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
        <Pressable
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving || selected === personality}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(240,240,240,0.9)',
    minWidth: 36,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 22,
    color: '#007aff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#007aff',
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selected: {
    borderColor: '#007aff',
    backgroundColor: '#e6f0ff',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: '#007aff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  check: {
    position: 'absolute',
    right: 18,
    top: 18,
    fontSize: 22,
    color: '#007aff',
    fontWeight: 'bold',
  },
});
