import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SUIT_SYMBOLS } from '../game/deck';

export default function Card({ card, onPress, disabled, selected, hidden }) {
  // Se a carta estiver virada (verso)
  if (hidden) {
    return (
      <View style={[styles.card, styles.cardBack]}>
        <View style={styles.cardBackInner} />
      </View>
    );
  }

  const isRed = card.suit === 'copas' || card.suit === 'ouro';
  const color = isRed ? '#ef4444' : '#1e293b';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled
      ]}
    >
      <View style={styles.topInfo}>
        <Text style={[styles.value, { color }]}>{card.value}</Text>
        <Text style={[styles.suitTiny, { color }]}>{SUIT_SYMBOLS[card.suit]}</Text>
      </View>

      <Text style={[styles.suitMain, { color }]}>{SUIT_SYMBOLS[card.suit]}</Text>

      <View style={styles.bottomInfo}>
        <Text style={[styles.value, { color }]}>{card.value}</Text>
        <Text style={[styles.suitTiny, { color }]}>{SUIT_SYMBOLS[card.suit]}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 70,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardSelected: {
    borderColor: '#38bdf8',
    borderWidth: 3,
    transform: [{ translateY: -10 }],
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardBack: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  cardBackInner: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  topInfo: {
    position: 'absolute',
    top: 4,
    left: 4,
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
  suitTiny: {
    fontSize: 10,
  },
  suitMain: {
    fontSize: 32,
  },
});
