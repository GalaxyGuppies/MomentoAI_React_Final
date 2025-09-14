import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface SetPasswordModalProps {
  visible: boolean;
  password: string;
  onPasswordChange: (pw: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const SetPasswordModal: React.FC<SetPasswordModalProps> = ({ visible, password, onPasswordChange, onConfirm, onCancel }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 300, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Set Folder Password</Text>
        <TextInput
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Enter new password"
          secureTextEntry
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, width: '100%', marginBottom: 18, fontSize: 16 }}
          autoFocus
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#007aff', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' }}
            onPress={onConfirm}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Set</Text>
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

export default SetPasswordModal;
