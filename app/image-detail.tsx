import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import RNFS from 'react-native-fs';
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabParamList } from '../navigation/types';
<<<<<<< HEAD
import { useFiles } from '@/context/FileContext';
=======
import { useFiles } from '../context/FileContext';
>>>>>>> bb36236 (fix: update asset imports, metro config, and resolve asset registry issues)

type EventInfo = {
  start?: Date;
  end?: Date;
  location?: string;
  title?: string;
};

const { width } = Dimensions.get('window');

export default function FolderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TabParamList>>();
  const route = useRoute();
  const { name, uri, analysis } = (route.params || {}) as { name?: string | string[]; uri?: string; analysis?: any };
  const { files } = useFiles();

  // State
  const [eventInfo, setEventInfo] = useState<EventInfo>({});
  const [nerEntities, setNerEntities] = useState<any[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');
  const [imageExists, setImageExists] = useState(true);

  // Derived values
  const folderName = typeof name === 'string' ? name.trim() : Array.isArray(name) ? (typeof name[0] === 'string' ? name[0].trim() : '') : '';
  const imagesInCategory = files.filter(f => {
    if (f.category === folderName) return true;
    if (Array.isArray(f.categories) && f.categories.includes(folderName)) return true;
    return false;
  });
  const decodedUri = Array.isArray(uri) ? decodeURIComponent(uri[0]) : (typeof uri === 'string' ? decodeURIComponent(uri) : undefined);
  const currentIndex = decodedUri ? imagesInCategory.findIndex(f => f.uri === decodedUri) : -1;
  const file = decodedUri ? files.find(f => f.uri === decodedUri) : null;
  const imageUri = file?.processedImageUrl || file?.segmentedImageUrl || file?.originalImageUrl || file?.processed || file?.segment || file?.edge || file?.uri || decodedUri || '';
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const analysisObj = typeof analysis === 'string' && decodedUri ? JSON.parse(analysis) : file?.analysis;

  useEffect(() => {
    if (analysisObj) {
      setExtractedText(
        analysisObj?.text ||
        analysisObj?.ocr ||
        (analysisObj?.responses?.[0]?.fullTextAnnotation?.text ?? '')
      );
    }
  }, [analysisObj]);

  // NER fetch
  useEffect(() => {
    async function fetchNER() {
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NER}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: extractedText }),
        });
        const data = await res.json();
        setNerEntities(data.entities || []);
      } catch {
        setNerEntities([]);
      }
    }
    if (extractedText && extractedText.length > 0) fetchNER();
  }, [extractedText]);

  // Event info extraction
  useEffect(() => {
    const dateEnt = nerEntities.find((e: any) => e.label === 'DATE');
    const locEnt = nerEntities.find((e: any) => ['GPE', 'LOC', 'CITY', 'LOCATION'].includes(e.label));
    const timeEnt = nerEntities.find((e: any) => e.label === 'TIME');
    let start, location, title;
    if (dateEnt) {
      let dateStr = dateEnt.text;
      let timeStr = timeEnt ? timeEnt.text : undefined;
      start = new Date(dateStr + (timeStr ? ' ' + timeStr : ''));
    }
    location = locEnt ? locEnt.text : '';
    setEventInfo({ start, location, title });
  }, [nerEntities]);

  // Navigation handler
  const goToImage = (idx: number) => {
    if (idx < 0 || idx >= imagesInCategory.length) return;
    const nextFile = imagesInCategory[idx];
    navigation.navigate('image-detail/[name]', {
      uri: encodeURIComponent(nextFile.uri),
      name: encodeURIComponent(folderName),
      analysis: nextFile.analysis ? JSON.stringify(nextFile.analysis) : undefined,
    });
  };

  if (!uri) {
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>No image selected.</Text></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Top image section */}
        <View style={{ position: 'relative', width: '100%', alignItems: 'center', marginTop: 16 }}>
          {imageUri && !imageError ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: width * 0.9, height: width * 0.9, borderRadius: 24, shadowColor: '#007aff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 18, backgroundColor: '#fff' }}
              accessibilityLabel="Main image (full-res color)"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => { setImageError(true); setImageLoading(false); }}
            />
          ) : (
            <View style={{ width: width * 0.9, height: width * 0.9, borderRadius: 24, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#bbb', fontSize: 22 }}>Image not found</Text>
              {!file && (
                <Text style={{ color: '#e53935', fontSize: 14, marginTop: 8 }}>
                  No file found for URI: {decodedUri}
                </Text>
              )}
              {file && (
                <Text style={{ color: '#e53935', fontSize: 14, marginTop: 8 }}>
                  Image URI: {file.uri}
                </Text>
              )}
            </View>
          )}
          {imageLoading && !imageError && (
            <ActivityIndicator size="large" color="#007aff" style={{ position: 'absolute', top: '45%', left: '45%' }} />
          )}
          {imageError && (
            <Text style={{ color: '#e53935', fontSize: 16, marginTop: 8 }}>Failed to load image. Please check the URI or file.</Text>
          )}
          {/* Delete button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 12,
              right: 24,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 6,
              elevation: 4
            }}
            onPress={() => {
              Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {/* handleDeleteImage logic */} },
              ]);
            }}
            accessibilityLabel="Delete image"
          >
            <Text style={{ fontSize: 18, color: '#e53935', fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation and action controls */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => goToImage(currentIndex > 0 ? currentIndex - 1 : imagesInCategory.length - 1)} accessibilityLabel="Previous image">
            <Text style={{ fontSize: 28, color: '#1976d2', marginHorizontal: 12 }}>{'‹'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {/* handleCopyImage logic */}} accessibilityLabel="Copy image">
            <Text style={{ fontSize: 22, color: '#34A853', marginHorizontal: 12 }}>⧉</Text>
          </TouchableOpacity>
          {/* Removed Add to Calendar functionality for now */}
          <TouchableOpacity onPress={() => {/* handleMoveImage logic */}} accessibilityLabel="Move image">
            <Text style={{ fontSize: 22, color: '#F4B400', marginHorizontal: 12 }}>⇄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goToImage(currentIndex < imagesInCategory.length - 1 ? currentIndex + 1 : 0)} accessibilityLabel="Next image">
            <Text style={{ fontSize: 28, color: '#1976d2', marginHorizontal: 12 }}>{'›'}</Text>
          </TouchableOpacity>
        </View>

        {/* Keywords section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#F4B400', marginRight: 6 }}>🏷️ Keywords:</Text>
          {(analysisObj?.labels && analysisObj.labels.length > 0 ? analysisObj.labels.slice(0, 5) : ['No keywords found']).map((kw: any, i: number) => (
            <View key={kw + i} style={{ backgroundColor: '#e3f2fd', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4, marginBottom: 2 }}>
              <Text style={{ fontSize: 13, color: '#1976d2' }}>{kw}</Text>
            </View>
          ))}
        </View>

        {/* Important details section */}
        <View style={{ width: '90%', backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginTop: 8, alignSelf: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Details</Text>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: 'bold', color: '#4285F4' }}>Who:</Text>
            <Text>{analysisObj?.who || 'N/A'}</Text>
          </View>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: 'bold', color: '#F4B400' }}>What:</Text>
            <Text>{analysisObj?.what || 'N/A'}</Text>
          </View>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: 'bold', color: '#34A853' }}>Where:</Text>
            <Text>{analysisObj?.where || eventInfo.location || 'N/A'}</Text>
          </View>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: 'bold', color: '#1976d2' }}>When:</Text>
            <Text>{eventInfo && eventInfo.start ? eventInfo.start.toLocaleString() : 'N/A'}</Text>
          </View>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: 'bold', color: '#e53935' }}>Text:</Text>
            <Text>{extractedText || 'N/A'}</Text>
          </View>
        </View>

        {/* Thumbnail gallery */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10, marginTop: 4, width: '90%' }}>
          {imagesInCategory.map((img, idx) => (
            <Pressable key={img.uri} onPress={() => goToImage(idx)} accessibilityLabel={`Thumbnail ${idx + 1}`}
              style={{ borderWidth: idx === currentIndex ? 2 : 0, borderColor: '#007aff', borderRadius: 8, marginRight: 6 }}>
              <Image
                source={{
                  uri:
                    img.processedImageUrl ||
                    img.segmentedImageUrl ||
                    img.originalImageUrl ||
                    img.processed ||
                    img.segment ||
                    img.edge ||
                    img.uri ||
                    ''
                }}
                style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#fff' }}
              />
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}