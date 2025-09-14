import React, { useState } from 'react';
import { FlatList, Pressable, View, Image, Text } from 'react-native';
import MoveDuplicateModal from './MoveDuplicateModal';

interface FileGridProps {
  files: any[];
  selectedCategory: string | null;
  onFilePress: (file: any) => void;
  onFileLongPress: (file: any) => void;
  ListEmptyComponent?: React.ReactNode;
  selectionMode?: boolean;
  selectedFiles?: string[];
  onSelectFile?: (file: any) => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedCategory,
  onFilePress,
  onFileLongPress,
  ListEmptyComponent,
  selectionMode = false,
  selectedFiles = [],
  onSelectFile,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalFile, setModalFile] = useState<any>(null);

  const handleLongPress = (item: any) => {
    setModalFile(item);
    setModalVisible(true);
  };

  const handleMove = () => {
    // TODO: Implement move logic here
    setModalVisible(false);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic here
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const renderFileItem = ({ item }: { item: any }) => {
    let imgUri = item.image_url || item.processedImageUrl || item.segmentedImageUrl || item.originalImageUrl || item.processed || item.segment || item.edge || item.uri;
    if (!imgUri || (Array.isArray(imgUri) && !imgUri[0])) {
      return (
        <View style={{ margin: 8, alignItems: 'center', width: 100, maxWidth: 100, backgroundColor: '#fff', borderRadius: 18, elevation: 8, padding: 10 }}>
          <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>Image URI missing or invalid!</Text>
        </View>
      );
    }
    return (
      <Pressable
        onPress={() => selectionMode ? onSelectFile && onSelectFile(item) : onFilePress(item)}
        onLongPress={() => selectionMode ? undefined : handleLongPress(item)}
        style={{
          margin: 12,
          alignItems: 'center',
          width: 120,
          maxWidth: 120,
          backgroundColor: '#fff',
          borderRadius: 18,
          elevation: 8,
          shadowColor: '#007aff',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 18,
          padding: 16,
          position: 'relative',
          borderWidth: selectionMode && selectedFiles.includes(item.uuid) ? 2 : 0,
          borderColor: selectionMode && selectedFiles.includes(item.uuid) ? '#007aff' : 'transparent',
          transform: [{ scale: selectionMode && selectedFiles.includes(item.uuid) ? 0.97 : 1 }],
        }}
        accessibilityLabel={'Image'}
      >
        <View style={{ width: 100, height: 100, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={{ uri: Array.isArray(imgUri) ? imgUri[0] : imgUri }}
            style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#f5f5f5', resizeMode: 'cover', opacity: selectionMode && selectedFiles.includes(item.uri) ? 0.7 : 1 }}
          />
        </View>
        {selectionMode && (
          <View style={{ position: 'absolute', top: 14, right: 14, backgroundColor: selectedFiles.includes(item.uri) ? '#007aff' : '#fff', borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#007aff', elevation: 4 }}>
            {selectedFiles.includes(item.uri) ? (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>✔</Text>
            ) : (
              <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 18 }}>○</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <>
      <FlatList
        data={files}
        keyExtractor={f => f.uuid || f.uri}
        numColumns={2}
        contentContainerStyle={{
          paddingVertical: 24,
          paddingHorizontal: 12,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
        renderItem={renderFileItem}
        ListEmptyComponent={typeof ListEmptyComponent === 'function' || React.isValidElement(ListEmptyComponent) ? ListEmptyComponent : null}
        windowSize={7}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        removeClippedSubviews={true}
      />
      <MoveDuplicateModal
        visible={modalVisible}
        onConfirm={handleMove}
        onCancel={handleCancel}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Move or Delete File?</Text>
        <Text style={{ marginBottom: 16 }}>{modalFile?.uuid || modalFile?.uri}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
          <Pressable
            style={{ backgroundColor: '#007aff', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' }}
            onPress={handleMove}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Move</Text>
          </Pressable>
          <Pressable
            style={{ backgroundColor: '#ff3b30', padding: 12, borderRadius: 8, marginLeft: 8, alignItems: 'center' }}
            onPress={handleDelete}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
          </Pressable>
        </View>
      </MoveDuplicateModal>
    </>
  );
};

export default FileGrid;