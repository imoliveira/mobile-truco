import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GameControls({ onTruco, onFold, onHide, canTruco, trucoLevel, isHidingCard }) {
  const trucoLabels = {
    1: 'TRUCO!',
    3: 'RETRUCO!',
    6: 'VALE 9!',
    9: 'VALE 12!',
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, styles.foldBtn]} onPress={onFold}>
        <Text style={styles.btnText}>CORRER</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.trucoBtn, !canTruco && styles.disabled]}
        onPress={onTruco}
        disabled={!canTruco}
      >
        <Text style={styles.trucoText}>{trucoLabels[trucoLevel] || 'TRUCO'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.hideBtn, isHidingCard && styles.hideBtnActive]} onPress={onHide}>
        <Text style={styles.btnText}>{isHidingCard ? 'ESCONDENDO...' : 'ESCONDER'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
    position: 'absolute',
    bottom: 120, // Acima das cartas da mão
    width: '100%',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    elevation: 4,
  },
  foldBtn: { backgroundColor: '#ef4444' },
  trucoBtn: { backgroundColor: '#fbbf24', flex: 1, maxWidth: 150 },
  hideBtn: { backgroundColor: '#64748b' },
  hideBtnActive: { backgroundColor: '#38bdf8', borderWidth: 2, borderColor: '#fff' },
  disabled: { opacity: 0.5 },
  btnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
  trucoText: {
    color: '#422006',
    fontWeight: '900',
    fontSize: 16,
  },
});
