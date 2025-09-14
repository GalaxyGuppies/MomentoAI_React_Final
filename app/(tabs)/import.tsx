import React, { useState, useContext, useEffect } from 'react';
import { preprocessImageBackend } from '../../utils/import/preprocess';
import { categorizeImage } from '../../utils/categorizeImage';
import { uploadImage } from '../../utils/import/upload';
import { buildMetadata } from '../../utils/import/metadata';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabParamList } from '../../navigation/types';
import { FileContext } from '../../context/FileContext';
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import AnalyticsDetails from '../../components/AnalyticsDetails';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
// import CameraRoll from '@react-native-community/cameraroll'; // Remove if not used
// import Constants from 'expo-constants'; // Remove Expo Constants
import { resolveImageCategory } from '../../utils/import/preprocess';
import { API_BASE_URL, API_ENDPOINTS } from '../../utils/config';
const PREPROCESS_API_URL = `${API_BASE_URL}${API_ENDPOINTS.UPLOAD_IMAGE}`;
const ADVANCED_PREPROCESS_API_URL = `${API_BASE_URL}${API_ENDPOINTS.ADVANCED_PREPROCESS}`;
const NER_API_URL = `${API_BASE_URL}${API_ENDPOINTS.NER}`;
const GOOGLE_CLOUD_API_KEY = ''; // Set your Google Cloud API key here if needed

// Utility: convert image file to base64
async function fileToBase64(uri: string): Promise<string> {
  return await RNFS.readFile(uri, 'base64');
}

import { resizeImage } from '../../hooks/resizeImage';

// NER server
async function analyzeTextWithNER(text: string) {
  try {
    const response = await fetch(NER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return await response.json();
  } catch (err) {
    console.error('NER error:', err);
    return null;
  }
}

// Google Vision API

// Helper to render image preview with aspect ratio preserved
interface AspectRatioImageProps {
  uri: string;
  maxWidth?: number;
  maxHeight?: number;
  style?: object;
}

function AspectRatioImage({ uri, maxWidth = 200, maxHeight = 200, style = {} }: AspectRatioImageProps) {
  const [dimensions, setDimensions] = useState({ width: maxWidth, height: maxHeight });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uri) {
      Image.getSize(
        uri,
        (width, height) => {
          let ratio = width / height;
          let displayWidth = maxWidth;
          let displayHeight = maxHeight;
          if (width > height) {
            displayHeight = Math.round(maxWidth / ratio);
          } else {
            displayWidth = Math.round(maxHeight * ratio);
          }
          setDimensions({ width: displayWidth, height: displayHeight });
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
  }, [uri]);

  if (loading) return <ActivityIndicator size="small" />;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={{ uri }}
        style={{ width: dimensions.width, height: dimensions.height, ...style }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function ImportScreen() {

  // Enhanced morphing bubble loader and morph-to-button
  const renderMorphingBubble = () => {
    const minSize = 40;
    const maxSize = 100;
    const size = minSize + ((maxSize - minSize) * (progress / (total || 1)));
    const colors = ['#90EE90', '#FFD700', '#87CEFA', '#FFB6C1', '#007aff', '#8A2BE2', '#FFA07A'];
    const color = colors[Math.floor((progress / (total || 1)) * (colors.length - 1))] || '#007aff';
    // If processing is done, morph bubble into button
    if (showBubbleButton) {
      return (
        <Pressable
          style={{
            width: maxSize,
            height: maxSize,
            borderRadius: maxSize / 2,
            backgroundColor: color,
            opacity: 0.9,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: color,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 18,
            marginVertical: 24,
          }}
          onPress={() => navigation.navigate('Library')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22 }}>View Categories</Text>
        </Pressable>
      );
    }
    // Animated bubble during processing
    return (
      <View style={{ alignItems: 'center', marginVertical: 24 }}>
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.85,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          borderWidth: 3,
          borderColor: '#fff',
        }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>{progress}/{total}</Text>
        </View>
      </View>
    );
  };
  const navigation = useNavigation<NativeStackNavigationProp<TabParamList>>();
  const fileContext = useContext(FileContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [previews, setPreviews] = useState<Array<{ processed?: string, edge?: string, segment?: string }>>([]);
  const [showBubbleButton, setShowBubbleButton] = useState(false);
  // Remove results state

  // Helper to convert nulls to undefined for previews
  function safePreview(processed: string | null, edge: string | null, segment: string | null) {
    return {
      processed: processed ?? undefined,
      edge: edge ?? undefined,
      segment: segment ?? undefined,
    };
  }

  // Multi-image picker and batch analysis
  const pickAndAnalyzeImages = async () => {
    launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0, // 0 = unlimited
      quality: 0.8,
      includeBase64: true,
    }, async (pickerResult) => {
      if (pickerResult.didCancel || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }
      setIsProcessing(true);
      setTotal(pickerResult.assets.length);
      setProgress(0);
      setStatusText('Preprocessing...');
      let batchPreviews: Array<{ processed?: string, edge?: string, segment?: string }> = [];
      // Track UUIDs for each image
      const imageUUIDs: string[] = pickerResult.assets.map(() => uuid.v4() as string);
      for (let i = 0; i < pickerResult.assets.length; i++) {
        const image = pickerResult.assets[i];
        const imageUUID = imageUUIDs[i];
        setStatusText(`Processing image ${i + 1} of ${pickerResult.assets.length}...`);

        // Backend responses
        let preprocessRes: any = {};
        let advRes: any = {};
        try {
          if (!image.uri) throw new Error('Image URI is undefined');
          preprocessRes = await preprocessImageBackend(image.uri, PREPROCESS_API_URL, imageUUID);
        } catch (err) {
          console.error(`[Import] preprocessImageBackend error for image ${i + 1}:`, err);
        }
        // ... rest of the for-loop logic remains unchanged ...
      // Advanced preprocessing and other logic remain as before

      // Ensure persistent directory for images
      const persistentDir = RNFS.DocumentDirectoryPath + '/images/';
      try {
        await RNFS.mkdir(persistentDir);
      } catch (e) {
        // Directory may already exist
      }

      // Helper to save base64 image to persistent storage
      async function saveToPersistent(name: string, base64: string) {
        const path = `${persistentDir}${name}_${Date.now()}_${i}.jpg`;
        await RNFS.writeFile(path, base64, 'base64');
        return path;
      }

      // Robust image URI assignment (prefer persistent storage)
  let processedUri = preprocessRes.processed_image_url || null;
  // Use backend HTTP URL if available, otherwise fallback to local image
  let originalImgUri = preprocessRes.original_image_url || image.uri;
      let edgeImgUri = advRes.edge_image_url || null;
      let segmentImgUri = advRes.segment_image_url || null;

      try {
        if (preprocessRes.processed && !preprocessRes.processed_image_url) {
          processedUri = await saveToPersistent('processed', preprocessRes.processed);
        }
  // Always use the original imported image URI for originalImgUri
  // (No longer saving backend original/base64 to persistent storage)
        if (advRes.edgeUri && !advRes.edge_image_url) {
          edgeImgUri = await saveToPersistent('edge', advRes.edgeUri);
        }
        if (advRes.segmentUri && !advRes.segment_image_url) {
          segmentImgUri = await saveToPersistent('segment', advRes.segmentUri);
        }
      } catch (err) {
        console.error(`[Import] Error saving images for image ${i + 1}:`, err);
      }

      // Validate file existence before storing metadata
      async function validateUri(uri: string | null): Promise<string | null> {
        if (!uri) return null;
        try {
          const exists = await RNFS.exists(uri);
          return exists ? uri : null;
        } catch {
          return null;
        }
      }
      processedUri = await validateUri(processedUri) || image.uri;
      // Do not validate HTTP URLs, only validate local files
      if (originalImgUri.startsWith('http')) {
        // Use as-is
      } else {
        originalImgUri = await validateUri(originalImgUri) || image.uri;
      }
      edgeImgUri = await validateUri(edgeImgUri);
      segmentImgUri = await validateUri(segmentImgUri);
  // Use backend findings for categorization and metadata
  let extractedText = preprocessRes.extracted_text || '';
  let detectedLabels: string[] = preprocessRes.labels || [];
  let detectedObjects: string[] = preprocessRes.objects || [];
  let detectedKeywords: string[] = preprocessRes.keywords || [];

  // Debug log for backend findings
  console.log('[Import] Backend findings:');
  console.log('  Labels:', detectedLabels);
  console.log('  Objects:', detectedObjects);
  console.log('  Keywords:', detectedKeywords);
  console.log('  Extracted Text:', extractedText);

      // --- BLIP Integration ---
      // --- YOLO Integration ---
      let yoloObjects: string[] = [];
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: image.uri,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
        // YOLO object detection
  const yoloRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.IMAGE_YOLO}`, {
          method: 'POST',
          body: formData,
        });
        const yoloData = await yoloRes.json();
        yoloObjects = yoloData.objects || [];
      } catch (e) {
        yoloObjects = ['[YOLO error]'];
        console.error(`[Import] YOLO error for image ${i + 1}:`, e);
      }

      batchPreviews.push(safePreview(processedUri, edgeImgUri, segmentImgUri));

  // --- Frontend Taxonomy-Based Categorization ---
  const finalCategory = categorizeImage({ labels: [...detectedLabels, ...detectedObjects, ...detectedKeywords], text: extractedText });

      // --- Technical Metadata ---
      let exifData = {};
      let fileHash = '';
      let createdAt = Date.now();
  let deviceInfo = 'Unknown Device'; // Optionally use react-native-device-info for device name
      try {
        // CameraRoll does not provide EXIF data. If you need EXIF, use a library like 'react-native-exif' or 'react-native-image-crop-picker'.
        exifData = {};
      } catch (e) {
        exifData = {};
        fileHash = '';
      }

      // --- Metadata Structure ---
  // Use the same UUID generated for preprocess
  // (imageUUID is already defined above for this image)
      console.log('[Import] --- Image Prep Debug ---');
      console.log('[Import] image:', image);
      console.log('[Import] originalImgUri:', originalImgUri);
      console.log('[Import] processedUri:', processedUri);
      console.log('[Import] edgeImgUri:', edgeImgUri);
      console.log('[Import] segmentImgUri:', segmentImgUri);
      console.log('[Import] detectedLabels:', detectedLabels);
      console.log('[Import] extractedText:', extractedText);
      console.log('[Import] deviceInfo:', deviceInfo);
      console.log('[Import] imageUUID:', imageUUID);
      console.log('[Import] finalCategory:', finalCategory);
      const storedImage = {
        uuid: imageUUID,
  uri: originalImgUri ?? image.uri,
        category: finalCategory,
        subcategory: '',
        processed: processedUri ?? undefined,
        edge: edgeImgUri ?? undefined,
        segment: segmentImgUri ?? undefined,
        processedImageUrl: preprocessRes.processed_image_url ?? null,
        originalImageUrl: preprocessRes.original_image_url ?? null,
        segmentedImageUrl: advRes.segment_image_url ?? null,
        // Only include allowed analytics fields (date, time, location)
        analytics: {
          // Use type assertions to avoid TS errors if exifData is an object
          date: (exifData as any)?.DateTimeOriginal || undefined,
          time: (exifData as any)?.Time || undefined,
          location: (exifData as any)?.GPSLatitude && (exifData as any)?.GPSLongitude
            ? `${(exifData as any).GPSLatitude},${(exifData as any).GPSLongitude}`
            : undefined,
        },
        // Store all other analysis fields in a separate property
        analysis: {
          labels: detectedLabels,
          objects: detectedObjects,
          keywords: detectedKeywords,
          extractedText,
        },
        exif: { ...exifData, uuid: imageUUID },
        metadata: buildMetadata({ image, detectedLabels, detectedObjects, detectedKeywords, extractedText, imageUUID, deviceInfo, processedUri, originalImgUri, edgeImgUri, segmentImgUri }),
      };

      // --- Upload image to backend, always send UUID ---
      try {
        // Use processedImageUrl and finalCategory for upload
        const processedImageUrl = preprocessRes.processed_image_url || processedUri;
        console.log('[Import] --- Backend Upload Debug ---');
        console.log('[Import] uploadImage fileUri:', processedImageUrl || image.uri);
        console.log('[Import] uploadImage category:', finalCategory);
        console.log('[Import] uploadImage uuid:', imageUUID);
        console.log('[Import] uploadImage metadata:', storedImage.metadata);
        console.log('[Import] uploadImage API_BASE_URL:', API_BASE_URL);
        const uploadPayload = {
          fileUri: processedImageUrl || image.uri,
          uuid: imageUUID,
          metadata: storedImage.metadata,
        };
        console.log('[Import] uploadImage payload:', uploadPayload);
        const backendResult = await uploadImage(uploadPayload);
        console.log('[Import] backendResult:', backendResult);
        if (backendResult) {
          if (backendResult.uuid) {
            storedImage.uuid = backendResult.uuid;
            storedImage.metadata.technical.uuid = backendResult.uuid;
            storedImage.metadata.administrative.uuid = backendResult.uuid;
          }
          // Use backend analytics for categorization and metadata if present
          if (backendResult.analytics) {
            storedImage.analytics = backendResult.analytics;
            // Use backend findings for categorization
            const backendLabels = backendResult.analytics.labels || [];
            const backendObjects = backendResult.analytics.objects || [];
            const backendKeywords = backendResult.analytics.keywords || [];
            const backendText = backendResult.analytics.extracted_text || '';
            storedImage.category = categorizeImage({ labels: [...backendLabels, ...backendObjects, ...backendKeywords], text: backendText });
            storedImage.analysis = {
              labels: backendLabels,
              objects: backendObjects,
              keywords: backendKeywords,
              extractedText: backendText,
            };
          }
          // Use backend HTTP image URL if present
          if (backendResult.image_url) {
            // If image_url is relative, prepend API_BASE_URL
            const isFullUrl = backendResult.image_url.startsWith('http');
            storedImage.uri = isFullUrl ? backendResult.image_url : `${API_BASE_URL}${backendResult.image_url}`;
          }
        }
      } catch (err) {
        console.error(`[Import] Error uploading image ${i + 1} to backend:`, err);
      }

      if (fileContext && fileContext.addFile) {
        try {
          await fileContext.addFile(storedImage);
        } catch (err) {
          console.error(`[Import] addFile error for image ${i + 1}:`, err);
        }
      } else {
        console.warn(`[Import] fileContext or addFile missing for image ${i + 1}`);
      }
      setProgress(i + 1);
      if (fileContext && fileContext.refreshFiles) {
        await fileContext.refreshFiles();
      }
    }
    setPreviews(batchPreviews);
    setStatusText('Analysis complete.');
    setIsProcessing(false);

    setShowBubbleButton(true);
  }); // Close launchImageLibrary callback
}; // End of pickAndAnalyzeImages

  // Creative progress bar animation
  // Morphing bubble loader animation
  // Enhanced morphing bubble loader and morph-to-button



  // Creative progress bar animation
  // Morphing bubble loader animation
  // Enhanced morphing bubble loader and morph-to-button

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import & Analyze</Text>
      <Text style={styles.subtitle}>Select one or more photos for intelligent categorization.</Text>
      {isProcessing ? (
        <View style={styles.progressContainer}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      ) : (
        <>
          <Pressable style={styles.button} onPress={pickAndAnalyzeImages}>
            <Text style={styles.buttonText}>Import Photo(s)</Text>
          </Pressable>
          {/* If no previews and not processing, show reset button */}
          {previews.length === 0 && (
            <Pressable style={[styles.button, { backgroundColor: '#ff3b30', marginTop: 16 }]} onPress={() => {
              setIsProcessing(false);
              setStatusText('');
              setProgress(0);
              setTotal(0);
              setPreviews([]);
              setShowBubbleButton(false);
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Reset Import</Text>
            </Pressable>
          )}
        </>
      )}
      {/* Always render morphing bubble/button after import */}
      {renderMorphingBubble()}
      {/* Preview section - render AspectRatioImage components */}
      <View style={styles.previewContainer}>
        {previews.map((preview, index) => {
          const previewUri = preview.processed || preview.edge || preview.segment || 'https://via.placeholder.com/120x120?text=No+Image';
          const storedImage = fileContext?.files?.[fileContext.files.length - previews.length + index];
          const category = storedImage?.category || 'Uncategorized';
          const subcategory = storedImage?.subcategory || '';
          return (
            <View key={index} style={{ alignItems: 'center', margin: 8, minWidth: 140 }}>
              <AspectRatioImage uri={previewUri} maxWidth={120} maxHeight={120} style={styles.preview} />
              <Text style={{ fontSize: 14, color: '#333', marginTop: 4, textAlign: 'center' }}>
                Filed in: <Text style={{ fontWeight: 'bold' }}>{category}</Text>
                {subcategory ? <Text> / <Text style={{ fontWeight: 'bold' }}>{subcategory}</Text></Text> : null}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
  button: { backgroundColor: '#007aff', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  progressContainer: { width: '80%', alignItems: 'center' },
  statusText: { fontSize: 16, marginBottom: 20, color: '#333' },
  previewContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 },
  preview: { width: 120, height: 120, margin: 5, borderRadius: 8 },
});

