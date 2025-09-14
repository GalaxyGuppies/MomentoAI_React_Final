import React from 'react';
import { Modal, View, TouchableOpacity, Text } from 'react-native';

interface MoveDuplicateModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  // Add more props as needed for category input, etc.
}

const MoveDuplicateModal: React.FC<MoveDuplicateModalProps> = ({ visible, onConfirm, onCancel, children }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 300, alignItems: 'center' }}>
        {children}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#007aff', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' }}
            onPress={onConfirm}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#eee', padding: 12, borderRadius: 8, marginLeft: 8, alignItems: 'center' }}
            onPress={onCancel}
          >
            <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default MoveDuplicateModal;
