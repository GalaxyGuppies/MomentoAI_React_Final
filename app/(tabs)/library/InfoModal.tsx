import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 300, alignItems: 'center' }}>
        <Text style={{ fontSize: 17, color: '#333', marginBottom: 12, textAlign: 'center' }}>
          This will attempt to automatically assign categories to your uncategorized files using filename and label analysis.
        </Text>
        <Pressable style={{ marginTop: 16, backgroundColor: '#007aff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }} onPress={onClose}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

export default InfoModal;
