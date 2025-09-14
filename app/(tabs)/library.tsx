import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, Animated, Platform, ScrollView, Text, View, Pressable, TouchableOpacity, Alert, SafeAreaView, StatusBar, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { LibraryStackParamList } from '../../navigation/LibraryStack';
import { useFiles } from '../../context/FileContext';
import { Category } from '../../utils/types';
import LibraryBubble from './LibraryBubble';
import FileGrid from './library/FileGrid';
import InfoModal from './library/InfoModal';
import MoveDuplicateModal from './library/MoveDuplicateModal';
import UnlockModal from './library/UnlockModal';
import SetPasswordModal from './library/SetPasswordModal';
import { Picker } from '@react-native-picker/picker';
// AnimatedBubble: animates scale on hover (web) and press (mobile)
type AnimatedBubbleProps = {
  onPress: () => void;
  color: string;
  label: string;
  previewUri?: string;
  bubbleSize: number;
  bubbleMargin: number;
};

const AnimatedBubble = ({ onPress, color, label, previewUri, bubbleSize, bubbleMargin }: AnimatedBubbleProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      friction: 5,
      tension: 120,
    }).start();
  };
  const handlePressIn = () => animateTo(0.93);
  const handlePressOut = () => animateTo(1);
  // For web hover
  const handleHoverIn = () => { if (Platform.OS === 'web') animateTo(1.07); };
  const handleHoverOut = () => { if (Platform.OS === 'web') animateTo(1); };
  return (
    <Animated.View
      style={{
        margin: bubbleMargin,
        alignItems: 'center',
        width: bubbleSize,
        height: bubbleSize,
        transform: [{ scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        style={{ alignItems: 'center', justifyContent: 'center', width: bubbleSize, height: bubbleSize }}
      >
        <LibraryBubble color={color} label={label} previewUri={previewUri} />
      </Pressable>
    </Animated.View>
  );
};
// --- Category Data ---
const TOP_LEVEL_CATEGORIES: Category[] = [
  { uuid: 'uncat', name: 'Uncategorized', color: '#CCCCCC', children: [] },
  { uuid: 'personal', name: 'Personal Moments', color: '#8A2BE2', children: [
    { uuid: 'people', name: 'People', color: '#FFD700' },
    { uuid: 'pets', name: 'Pets & Animals', color: '#FFB6C1' },
    { uuid: 'events', name: 'Events', color: '#F08080' },
  ]},
  { uuid: 'outdoors', name: 'Outdoors & Nature', color: '#87CEFA', children: [
    { uuid: 'landscapes', name: 'Landscapes', color: '#90EE90' },
    { uuid: 'travel', name: 'Travel', color: '#00BFFF' },
    { uuid: 'weather', name: 'Weather & Sky', color: '#B0E0E6' },
  ]},
  { uuid: 'food', name: 'Food & Lifestyle', color: '#FFDAB9', children: [
    { uuid: 'food', name: 'Food', color: '#FFA07A' },
    { uuid: 'fashion', name: 'Fashion', color: '#FFB347' },
    { uuid: 'items', name: 'Personal Items', color: '#E6E6FA' },
  ]},
  { uuid: 'art', name: 'Art & Architecture', color: '#DDA0DD', children: [
    { uuid: 'architecture', name: 'Architecture', color: '#B0E0E6' },
    { uuid: 'art', name: 'Art', color: '#F15BB5' },
    { uuid: 'creative', name: 'Creative', color: '#43C6AC' },
  ]},
  { uuid: 'digital', name: 'Digital & Gaming', color: '#4D96FF', children: [
    { uuid: 'memes', name: 'Memes & Humor', color: '#FFD93D' },
    { uuid: 'social', name: 'Social Media', color: '#F67280' },
    { uuid: 'gaming', name: 'Gaming', color: '#00BBF9' },
  ]},
  { uuid: 'documents', name: 'Documents & Data', color: '#20B2AA', children: [
    { uuid: 'info', name: 'Important Info', color: '#FFD700' },
    { uuid: 'work', name: 'Work & School', color: '#B5EAEA' },
    { uuid: 'comm', name: 'Communications', color: '#FFB7B2' },
  ]},
  { uuid: 'tech', name: 'Technical & Help', color: '#FF6347', children: [
    { uuid: 'trouble', name: 'Troubleshooting', color: '#DC143C' },
    { uuid: 'tutorials', name: 'Tutorials', color: '#43E97B' },
    { uuid: 'uiux', name: 'UI/UX', color: '#8FBC8F' },
  ]},
  { uuid: 'objects', name: 'Objects & Collections', color: '#FFC75F', children: [
    { uuid: 'products', name: 'Products', color: '#FF8C42' },
    { uuid: 'stilllife', name: 'Still Life', color: '#E2F0CB' },
    { uuid: 'collections', name: 'Collections', color: '#B39CD0' },
  ]},
  { uuid: 'urban', name: 'Urban Life', color: '#355C7D', children: [
    { uuid: 'cityscapes', name: 'Cityscapes', color: '#6495ED' },
    { uuid: 'transport', name: 'Transportation', color: '#FFD700' },
    { uuid: 'streetlife', name: 'Street Life', color: '#F9CA24' },
  ]},
  { uuid: 'finance', name: 'Financial & Commerce', color: '#FFD700', children: [
    { uuid: 'transactions', name: 'Transactions', color: '#FF6B6B' },
    { uuid: 'banking', name: 'Banking', color: '#20B2AA' },
    { uuid: 'investments', name: 'Investments', color: '#00BBF9' },
    { uuid: 'commerce', name: 'Commerce', color: '#FFA07A' },
  ]},
  { uuid: 'health', name: 'Health & Fitness', color: '#43E97B', children: [
    { uuid: 'wellness', name: 'Wellness', color: '#B5EAEA' },
    { uuid: 'fitness', name: 'Fitness', color: '#FFD93D' },
  ]},
];

export default function LibraryScreen() {
  // Move modal state
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [selectedMoveCategory, setSelectedMoveCategory] = useState<string>('');
  const [selectedMoveSubcategory, setSelectedMoveSubcategory] = useState<string>('');
  // Modal state for image actions
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedFileForAction, setSelectedFileForAction] = useState<any>(null);

  // Handler for long-press on image
  const handleFileLongPress = (file: any) => {
    setSelectedFileForAction(file);
    setActionModalVisible(true);
  };
  const { files, clearAllFiles, deleteFile, moveFile, duplicateFile, refreshFiles } = useFiles();
  const navigation = useNavigation<StackNavigationProp<LibraryStackParamList>>();

  // --- Refactored State ---
  const [view, setView] = useState<'categoryGrid' | 'subcategoryGrid' | 'imageGrid'>('categoryGrid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);

  // --- Helper: Get peek image for category/subcategory ---
  const getPeekImage = (cat: Category) => {
    const file = files.find((f: any) => {
      // Check for main category match
      if (f.category === cat.name) return true;
      if (Array.isArray(f.categories) && f.categories.includes(cat.name)) return true;
      // Check for subcategory match (string or array)
      if (f.subcategory === cat.name) return true;
      if (Array.isArray(f.subcategory) && f.subcategory.includes(cat.name)) return true;
      // Check if categories array contains a subcategory name
      if (Array.isArray(f.categories) && f.categories.some((c: string) => c === cat.name)) return true;
      return false;
    });
    return file?.processed || file?.segment || file?.edge || file?.uri || null;
  };

  // --- Category Grid ---
  // Helper to chunk an array into rows of n columns (for vertical grid: 4 rows, 3 columns)
  function chunkToRows<T>(arr: T[], numCols: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += numCols) {
      res.push(arr.slice(i, i + numCols));
    }
    // Pad to 4 rows if needed
    while (res.length < 4) {
      res.push(Array(numCols).fill(undefined as any));
    }
    // Pad last row to 3 columns if needed
    if (res[res.length - 1].length < numCols) {
      res[res.length - 1] = [
        ...res[res.length - 1],
        ...Array(numCols - res[res.length - 1].length).fill(undefined as any)
      ];
    }
    return res;
  }

  // Responsive sizing for bubbles
  const screenWidth = Dimensions.get('window').width;
  const bubbleSize = Math.floor((screenWidth - 48) / 3); // 16px margin on each side, 3 bubbles per row
  const bubbleMargin = 8;

  const renderCategoryGrid = () => {
    const rows = chunkToRows(TOP_LEVEL_CATEGORIES, 3); // 3 columns, up to 4 rows
    return (
      <ScrollView contentContainerStyle={{ padding: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Categories</Text>
        <View style={{ height: 8 }} />
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
            {row.map((cat, colIdx) => {
              if (!cat) {
                // Render empty space for missing categories
                return <View key={colIdx} style={{ width: bubbleSize + bubbleMargin * 2, height: bubbleSize + bubbleMargin * 2 }} />;
              }
              const peekImg = getPeekImage(cat);
              return (
                <AnimatedBubble
                  key={cat.uuid}
                  onPress={() => {
                    if (cat.name === 'Uncategorized') {
                      setSelectedCategory(cat);
                      setView('imageGrid');
                    } else if (cat.children && cat.children.length > 0) {
                      setSelectedCategory(cat);
                      setView('subcategoryGrid');
                    } else {
                      setSelectedCategory(cat);
                      setView('imageGrid');
                    }
                  }}
                  color={String(cat.color)}
                  label={String(cat.name)}
                  previewUri={peekImg ?? undefined}
                  bubbleSize={bubbleSize}
                  bubbleMargin={bubbleMargin}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  // --- Subcategory Grid ---
  const renderSubcategoryGrid = () => {
    if (!selectedCategory) return null;
    const subcats = selectedCategory.children || [];
    const rows = chunkToRows(subcats, 3); // 3 columns, up to 4 rows
    return (
      <View style={{ flex: 1, padding: 8 }}>
        <TouchableOpacity style={{ marginBottom: 8 }} onPress={() => setView('categoryGrid')}>
          <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 18 }}>{'< Back to Categories'}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>{selectedCategory.name}</Text>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
            {row.map((subcat, colIdx) => {
              if (!subcat) {
                return <View key={colIdx} style={{ width: bubbleSize + bubbleMargin * 2, height: bubbleSize + bubbleMargin * 2 }} />;
              }
              const peekImg = getPeekImage(subcat);
              return (
                <AnimatedBubble
                  key={subcat.uuid}
                  onPress={() => {
                    setSelectedSubcategory(subcat);
                    setView('imageGrid');
                  }}
                  color={String(subcat.color)}
                  label={String(subcat.name)}
                  previewUri={peekImg ?? undefined}
                  bubbleSize={bubbleSize}
                  bubbleMargin={bubbleMargin}
                />
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // --- Image Grid ---
  const renderImageGrid = () => {
    let filteredFiles = files;
    if (selectedCategory) {
      if (selectedCategory.name === 'Uncategorized') {
        filteredFiles = files.filter(
          (f: any) =>
            f.category === 'Uncategorized' ||
            (Array.isArray(f.subcategory) && f.subcategory.includes('Uncategorized'))
        );
      } else if (selectedSubcategory) {
        filteredFiles = files.filter(
          (f: any) =>
            f.subcategory === selectedSubcategory.name ||
            (Array.isArray(f.subcategory) && f.subcategory.includes(selectedSubcategory.name)) ||
            f.category === selectedSubcategory.name ||
            (Array.isArray(f.categories) && f.categories.includes(selectedSubcategory.name))
        );
      } else {
        filteredFiles = files.filter(
          (f: any) =>
            f.category === selectedCategory.name ||
            (Array.isArray(f.categories) && f.categories.includes(selectedCategory.name))
        );
      }
    }
    // Always show images if present for selected category/subcategory
    if (!filteredFiles.length && selectedCategory) {
      filteredFiles = files.filter((f: any) => f.category === selectedCategory.name || (Array.isArray(f.categories) && f.categories.includes(selectedCategory.name)));
    }
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <TouchableOpacity style={{ marginBottom: 12 }} onPress={() => {
          if (selectedSubcategory) {
            setView('subcategoryGrid');
            setSelectedSubcategory(null);
          } else {
            setView('categoryGrid');
            setSelectedCategory(null);
          }
        }}>
          <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 18 }}>{'< Back'}</Text>
        </TouchableOpacity>
  {/* Removed category/subcategory labeling under images as requested */}
        <FileGrid
          files={filteredFiles}
          selectedCategory={selectedCategory ? selectedCategory.name : ''}
          onFilePress={(item: any) => {
            if (item && item.uuid) {
              navigation.navigate('ImageDetail', {
                  uuid: item.uuid,
                  uri: encodeURIComponent(item.uri),
                  analysis: item.analysis ? JSON.stringify(item.analysis) : undefined,
                });
            }
          }}
          onFileLongPress={handleFileLongPress}
        />
      </View>
    );
  };

  // --- Fallback for backend response: assign to Uncategorized if missing ---
  useEffect(() => {
    files.forEach((f: any) => {
      // Only assign 'Uncategorized' if ALL are missing/empty
      const hasCategory = f.category && f.category !== 'Uncategorized';
      const hasCategories = Array.isArray(f.categories) && f.categories.length > 0;
      const hasSubcategory = f.subcategory && (
        (typeof f.subcategory === 'string' && f.subcategory !== 'Uncategorized') ||
        (Array.isArray(f.subcategory) && f.subcategory.length > 0 && !f.subcategory.includes('Uncategorized'))
      );
      if (!hasCategory && !hasCategories && !hasSubcategory) {
        f.category = 'Uncategorized';
      }
    });
  }, [files]);

  // --- Main Render ---
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 32 : 16, paddingBottom: 96, paddingHorizontal: 0 }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1 }}>
          {/* CategoryBar removed as per new design; only FileGrid and navigation remain */}
          {/* Clear All Photos button */}
          <TouchableOpacity
            style={{ backgroundColor: '#FF6B6B', padding: 10, borderRadius: 10, margin: 12, alignSelf: 'center' }}
            onPress={() => {
              Alert.alert('Clear All Photos', 'Are you sure you want to delete ALL photos? This cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete All', style: 'destructive', onPress: async () => { await clearAllFiles(); } },
              ]);
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Clear All Photos</Text>
          </TouchableOpacity>
          {/* --- Category/Subcategory/Image Grid --- */}
          {view === 'categoryGrid' && renderCategoryGrid()}
          {view === 'subcategoryGrid' && renderSubcategoryGrid()}
          {view === 'imageGrid' && renderImageGrid()}
        </View>
        {/* Image Action Modal */}
        <Modal visible={actionModalVisible} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Image Actions</Text>
              <Pressable style={{ padding: 12, borderRadius: 8, backgroundColor: '#4285F4', marginBottom: 10 }} onPress={() => {
                setActionModalVisible(false);
                setMoveModalVisible(true);
                setSelectedMoveCategory('');
                setSelectedMoveSubcategory('');
              }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Move</Text>
              </Pressable>
      {/* Move Modal for category/subcategory selection */}
      <MoveDuplicateModal
        visible={moveModalVisible}
        onConfirm={async () => {
          if (selectedFileForAction?.uri && selectedMoveCategory) {
            const categories = [selectedMoveCategory];
            if (selectedMoveSubcategory) categories.push(selectedMoveSubcategory);
            await moveFile(selectedFileForAction.uri, categories);
            await refreshFiles();
            Alert.alert('Moved', `Image moved to ${selectedMoveCategory}${selectedMoveSubcategory ? ' / ' + selectedMoveSubcategory : ''}.`);
          }
          setMoveModalVisible(false);
          setSelectedFileForAction(null);
        }}
        onCancel={() => setMoveModalVisible(false)}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Select Category</Text>
        <View style={{ width: '100%', marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Category:</Text>
          <View style={{ backgroundColor: '#eee', borderRadius: 8 }}>
            <Picker
              selectedValue={selectedMoveCategory}
              onValueChange={(itemValue: string) => {
                setSelectedMoveCategory(itemValue);
                setSelectedMoveSubcategory('');
              }}
              style={{ width: '100%' }}
            >
              <Picker.Item label="Select category" value="" />
              {TOP_LEVEL_CATEGORIES.map(cat => (
                <Picker.Item key={cat.uuid} label={cat.name} value={cat.name} />
              ))}
            </Picker>
          </View>
        </View>
        {(() => {
          const selectedCat = TOP_LEVEL_CATEGORIES.find(cat => cat.name === selectedMoveCategory);
          return selectedMoveCategory && selectedCat && selectedCat.children && selectedCat.children.length > 0;
        })() && (
          <View style={{ width: '100%', marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Subcategory:</Text>
            <View style={{ backgroundColor: '#eee', borderRadius: 8 }}>
              <Picker
                selectedValue={selectedMoveSubcategory}
                onValueChange={(itemValue: string) => setSelectedMoveSubcategory(itemValue)}
                style={{ width: '100%' }}
              >
                <Picker.Item label="Select subcategory" value="" />
                {TOP_LEVEL_CATEGORIES.find(cat => cat.name === selectedMoveCategory)?.children?.map(subcat => (
                  <Picker.Item key={subcat.uuid} label={subcat.name} value={subcat.name} />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </MoveDuplicateModal>
              <Pressable style={{ padding: 12, borderRadius: 8, backgroundColor: '#ea4335', marginBottom: 10 }} onPress={async () => {
                // Delete logic
                if (selectedFileForAction?.uri) {
                  await deleteFile(selectedFileForAction.uri);
                  Alert.alert('Deleted', 'Image deleted.');
                }
                setActionModalVisible(false);
              }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
              </Pressable>
              <Pressable style={{ padding: 12, borderRadius: 8, backgroundColor: '#34a853', marginBottom: 10 }} onPress={async () => {
                // Copy logic: duplicate file (can prompt for category/subcategory)
                if (selectedFileForAction?.uri) {
                  await duplicateFile(selectedFileForAction.uri, [selectedFileForAction.category || 'Uncategorized']);
                  Alert.alert('Copied', 'Image duplicated.');
                }
                setActionModalVisible(false);
              }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Copy</Text>
              </Pressable>
              <Pressable style={{ marginTop: 8 }} onPress={() => setActionModalVisible(false)}>
                <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}