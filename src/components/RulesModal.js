import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function RulesModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>📜 Como Jogar Truco Paulista</Text>

          <ScrollView style={styles.scroll}>
            <Text style={styles.h3}>Objetivo</Text>
            <Text style={styles.p}>
              Ser a primeira equipe a alcançar 12 pontos. Cada rodada vale 1 ponto, mas pode
              subir para 3, 6, 9 e 12 através do pedido de "Truco".
            </Text>

            <Text style={styles.h3}>Força das Cartas</Text>
            <Text style={styles.p}>3, 2, A, K, J, Q, 7, 6, 5, 4 (da maior pra menor)</Text>

            <Text style={styles.h3}>O Vira e as Manilhas</Text>
            <Text style={styles.p}>
              A carta virada define as Manilhas — sempre a carta imediatamente acima do Vira.
              Entre as Manilhas, a força é: Paus (Zap) &gt; Copas &gt; Espadas &gt; Ouros.
            </Text>

            <Text style={styles.h3}>Mecânica do Truco</Text>
            <Text style={styles.p}>
              A qualquer momento você pode pedir Truco (sobe pra 3). O adversário pode aceitar,
              fugir (você ganha o ponto atual) ou pedir Seis (e assim por diante até 12).
            </Text>

            <Text style={styles.h3}>Mão de 11</Text>
            <Text style={styles.p}>
              Ao atingir 11 pontos, a equipe pode ver as cartas antes de decidir se joga (vale 3
              pontos) ou foge (dá 1 ponto ao adversário).
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: '85%',
    padding: 20,
  },
  closeBtn: { position: 'absolute', top: 10, right: 15, zIndex: 1 },
  closeBtnText: { color: '#94a3b8', fontSize: 28 },
  title: { color: '#38bdf8', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  scroll: { marginTop: 8 },
  h3: { color: '#fbbf24', fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  p: { color: '#e2e8f0', fontSize: 14, lineHeight: 20 },
});
