import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Fase 4 vai substituir isso pela mesa de feltro, cartas, truco, sinais etc.
export default function TableScreen({ route, navigation }) {
  const { tableId } = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesa: {tableId}</Text>
      <Text style={styles.placeholder}>Mesa de jogo (cartas, truco, sinais) — Fase 4</Text>
      <Button title="Voltar ao lobby" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  placeholder: { color: '#e2e8f0', marginBottom: 16, textAlign: 'center' },
});
