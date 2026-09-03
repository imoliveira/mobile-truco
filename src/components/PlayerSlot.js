import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function PlayerSlot({ player, isTurn, position }) {
  if (!player) {
    return (
      <View style={[styles.container, styles[position]]}>
        <View style={styles.emptySlot}>
          <Text style={styles.emptyText}>Vazio</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles[position]]}>
      <View style={[styles.avatarContainer, isTurn && styles.activeAvatar]}>
        <Image
          source={{ uri: player.avatar || `https://api.dicebear.com/9.x/avataaars/png?seed=${player.username}` }}
          style={styles.avatar}
        />
        {isTurn && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>Sua vez</Text>
          </View>
        )}
      </View>
      <Text style={styles.username} numberOfLines={1}>{player.username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    width: 80,
  },
  // Posicionamento relativo à mesa (verde)
  bottom: { bottom: 10, alignSelf: 'center' },
  top: { top: 10, alignSelf: 'center' },
  left: { left: 10, top: '40%' },
  right: { right: 10, top: '40%' },

  avatarContainer: {
    padding: 3,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeAvatar: {
    backgroundColor: '#38bdf8',
    elevation: 8,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#334155',
  },
  username: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptySlot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  },
  turnIndicator: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#38bdf8',
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  turnText: {
    color: '#0f172a',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
