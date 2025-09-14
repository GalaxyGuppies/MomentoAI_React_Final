import React from 'react';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useFiles } from '../context/FileContext';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';

// Define types for navigation and file items
type RootStackParamList = {
  CategoryDetail: { category?: string | string[] };
  ImageDetail: { uri: string; analysis?: string };
};

type FileItem = {
  uri: string;
  processed?: string;
  edge?: string;
  segment?: string;
  analysis?: unknown;
  category?: string;
  subcategory?: string[];
  categories?: string[];
};

export default function CategoryDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'CategoryDetail'>>();
  const navigation = useNavigation<any>();
  const { category } = (route.params || {}) as { category?: string | string[] };
  const { files } = useFiles();
  const catStr = Array.isArray(category) ? category[0] : category;
  const displayCategory = catStr === 'Uncategorized' ? 'Misc.' : catStr;
  // Use backend-provided category and subcategory for filtering
  const filtered = (files as FileItem[]).filter((f: FileItem) => {
    if (f.category === catStr) return true;
    if (catStr && Array.isArray(f.subcategory) && f.subcategory.includes(catStr)) return true;
    if (catStr && Array.isArray(f.categories) && f.categories.includes(catStr)) return true;
    return false;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 32 : 16 }}>
      <StatusBar barStyle="dark-content" />
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#007aff', margin: 16, textAlign: 'center' }}>{displayCategory}</Text>
      <FlatList
        data={filtered}
        keyExtractor={(f: FileItem, idx: number) => f.uri + idx}
        numColumns={3}
        contentContainerStyle={{ padding: 16, alignItems: 'center' }}
        renderItem={({ item }: { item: FileItem }) => {
          const imgUri = item.processed || item.edge || item.segment || item.uri;
          return (
            <Pressable
              style={{ margin: 8 }}
              onPress={() => navigation.navigate('ImageDetail', {
                uri: encodeURIComponent(imgUri),
                analysis: item.analysis ? JSON.stringify(item.analysis) : undefined,
              })}
            >
              <Image source={{ uri: imgUri }} style={{ width: 90, height: 90, borderRadius: 12, backgroundColor: '#eee' }} />
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={{ color: 'gray', textAlign: 'center', marginTop: 32, fontSize: 18 }}>No images in this category.</Text>}
      />
    </SafeAreaView>
  );
}

