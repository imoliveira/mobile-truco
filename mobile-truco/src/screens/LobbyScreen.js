import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useSocket } from '../context/SocketContext';

// Fase 3 vai substituir isso pela lista de mesas, chat global e ranking.
export default function LobbyScreen({ navigation }) {
  const { username, logout } = useSocket();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      <Text style={styles.subtitle}>Bem-vindo, {username}</Text>
      <Text style={styles.placeholder}>Lista de mesas / chat / ranking — Fase 3</Text>
      <Button
        title="Entrar em mesa (teste)"
        onPress={() => navigation.navigate('Table', { tableId: 'mesa-teste' })}
      />
      <Button title="Sair" color="#f43f5e" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  title: { color: '#38bdf8', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#fff', fontSize: 16 },
  placeholder: { color: '#94a3b8', marginBottom: 16, textAlign: 'center' },
});
