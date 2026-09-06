import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, SAFE_PLAY } from '../constants/LegalTexts';

export default function LegalModal({ visible, onClose, type }) {
  let data;
  switch (type) {
    case 'terms':
      data = TERMS_OF_SERVICE;
      break;
    case 'privacy':
      data = PRIVACY_POLICY;
      break;
    case 'safeplay':
      data = SAFE_PLAY;
      break;
    default:
      data = TERMS_OF_SERVICE;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{data.title}</Text>

          <ScrollView style={styles.scroll}>
            {data.content.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.h3}>{section.heading}</Text>
                <Text style={styles.p}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: '85%',
    padding: 24,
  },
  closeBtn: { 
    position: 'absolute', 
    top: 12, 
    right: 18, 
    zIndex: 1,
    padding: 5
  },
  closeBtnText: { color: '#94a3b8', fontSize: 32, fontWeight: '300' },
  title: { 
    color: '#38bdf8', 
    fontSize: 22, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 20,
    marginTop: 8
  },
  scroll: { marginTop: 8 },
  section: { marginBottom: 20 },
  h3: { color: '#fbbf24', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  p: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
});
