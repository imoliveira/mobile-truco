import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function AvatarModal({ visible, options, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.content}>
          <Text style={styles.title}>Escolha seu novo Avatar</Text>
          <View style={styles.grid}>
            {options.map((url) => (
              <TouchableOpacity key={url} onPress={() => onSelect(url)} style={styles.optionWrapper}>
                <Image source={{ uri: url }} style={styles.option} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 380,
  },
  title: { color: '#fbbf24', fontSize: 17, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  optionWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  option: { width: '100%', height: '100%', borderRadius: 28 },
  closeBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeBtnText: { color: '#fff' },
});
