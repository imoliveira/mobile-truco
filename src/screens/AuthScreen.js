import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSocket } from '../context/SocketContext';

// Fase 2 vai substituir isso pelo formulário completo (login/cadastro,
// máscaras de CPF/celular, captcha, login social) — hoje é só o
// esqueleto de navegação pra validar o fluxo.
export default function AuthScreen() {
  const { connected } = useSocket();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Truco-Play</Text>
      <Text style={styles.subtitle}>
        {connected ? 'Conectado ao servidor' : 'Conectando...'}
      </Text>
      <Text style={styles.placeholder}>Tela de login — Fase 2</Text>
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
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  placeholder: {
    color: '#38bdf8',
    marginTop: 24,
  },
});
