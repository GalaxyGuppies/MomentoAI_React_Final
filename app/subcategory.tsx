import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useFiles } from '../context/FileContext';

  type RootStackParamList = {
    Subcategory: { parentUuid?: string; parentName?: string };
  };
  const route = useRoute<RouteProp<RootStackParamList, 'Subcategory'>>();
  const { parentUuid, parentName } = route.params || {};
  const { files } = useFiles();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<any>(null);

  // Debug: log all files and their category/subcategory fields

  // Find parent category and its children
  const subcategories = Array.from(
    new Set(
      files
        .filter(f => f.category === parentName && typeof f.subcategory === 'string' && f.subcategory)
        .map(f => f.subcategory as string)
    )
  );


  export default function SubcategoryScreen() {
    type RootStackParamList = {
      Subcategory: { parentUuid?: string; parentName?: string };
    };
    const route = useRoute<RouteProp<RootStackParamList, 'Subcategory'>>();
    const navigation = useNavigation<any>();
    const { parentUuid, parentName } = route.params || {};
    const { files } = useFiles();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<any>(null);

    // Find parent category and its children
    const subcategories = Array.from(
      new Set(
        files
          .filter(f => f.category === parentName && typeof f.subcategory === 'string' && f.subcategory)
          .map(f => f.subcategory as string)
      )
    );

    // Find files for a selected subcategory
    const [activeSubcat, setActiveSubcat] = React.useState<string | null>(null);
    const subcatFiles = activeSubcat
      ? files.filter(f => f.subcategory === activeSubcat)
      : [];

    // Peek image for each subcategory
    const getPeekImage = (subcat: string) => {
      const file = files.find(f => f.subcategory === subcat);
      return file ? (file.processed || file.edge || file.segment || file.uri) : undefined;
    };

    // Render subcategory bubbles
    const renderSubBubble = ({ item }: { item: string }) => (
      <TouchableOpacity
        style={styles.fileBubble}
        onPress={() => setActiveSubcat(item)}
      >
        {getPeekImage(item) ? (
          <Image source={{ uri: getPeekImage(item) }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>\n          <Text style={{ color: '#888' }}>No Preview</Text>\n        </View>
        )}
        <Text style={styles.fileName} numberOfLines={1}>{item}</Text>
      </TouchableOpacity>
    );

    // Render files in overlay modal
    const renderFile = ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.fileBubble}
        onPress={() => {
          setSelectedFile(item);
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: item.processed || item.edge || item.segment || item.uri }} style={styles.image} />
        <Text style={styles.fileName} numberOfLines={1}>{item.analysis?.labels?.[0] || item.subcategory || 'File'}</Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.container}>
        <Text style={styles.header}>{parentName}</Text>
        {/* Subcategory bubbles */}
        <FlatList
          data={subcategories}
          renderItem={renderSubBubble}
          keyExtractor={item => item}
          numColumns={2}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
          ListEmptyComponent={<Text style={{ color: '#888', marginTop: 32 }}>No subcategories found.</Text>}
        />
        {/* Overlay modal for files in subcategory */}
        {activeSubcat && (
          <Modal visible={true} transparent animationType="slide" onRequestClose={() => setActiveSubcat(null)}>
            <View style={styles.overlay}>
              <View style={styles.modalContent}>
                <Text style={styles.header}>{activeSubcat}</Text>
                <FlatList
                  data={subcatFiles}
                  renderItem={renderFile}
                  keyExtractor={item => item.uri}
                  numColumns={2}
                  contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
                  ListEmptyComponent={<Text style={{ color: '#888', marginTop: 32 }}>No files in this subcategory.</Text>}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setActiveSubcat(null)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        {/* Overlay modal for file preview */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              {selectedFile && (
                <>
                  <Image source={{ uri: selectedFile.processed || selectedFile.edge || selectedFile.segment || selectedFile.uri }} style={styles.modalImage} />
                  <Text style={styles.fileName}>{selectedFile.analysis?.labels?.join(', ') || selectedFile.subcategory || 'File'}</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 32,
    paddingHorizontal: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    color: '#007aff',
  },
  fileBubble: {
    backgroundColor: '#eee',
    borderRadius: 18,
    margin: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#ccc',
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    width: 320,
  },
  modalImage: {
    width: 260,
    height: 260,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#ccc',
  },
  closeButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
});
