import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSocket } from '../context/SocketContext';
import AvatarModal from '../components/AvatarModal';

const MODES = ['1x1', '2x2', '3x3'];
const MAX_MATCHES_OPTIONS = [1, 3, 5];
const MAX_PLAYERS = { '1x1': 2, '2x2': 4, '3x3': 6 };

export default function LobbyScreen({ navigation }) {
  const { socket, username, logout } = useSocket();

  const [tab, setTab] = useState('mesas'); // 'mesas' | 'chat' | 'ranking'

  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');
  const [newTableMode, setNewTableMode] = useState('2x2');
  const [newTableMaxMatches, setNewTableMaxMatches] = useState(3);

  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  const [userStats, setUserStats] = useState({ vitorias: 0, derrotas: 0, partidas: 0, xp: 0, avatar: '' });
  const [globalRanking, setGlobalRanking] = useState([]);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_lobby', username);

    const onUpdateTables = (updated) => setTables(updated);
    const onReceiveMessage = (msg) => setChatMessages((prev) => [...prev, msg]);
    const onUserStats = (stats) => setUserStats(stats);
    const onGlobalRanking = (ranking) => setGlobalRanking(ranking);

    socket.on('update_tables', onUpdateTables);
    socket.on('receive_message', onReceiveMessage);
    socket.on('user_stats', onUserStats);
    socket.on('global_ranking', onGlobalRanking);

    return () => {
      socket.off('update_tables', onUpdateTables);
      socket.off('receive_message', onReceiveMessage);
      socket.off('user_stats', onUserStats);
      socket.off('global_ranking', onGlobalRanking);
    };
  }, [socket, username]);

  const handleCreateTable = () => {
    if (!newTableName.trim()) return;
    socket.emit('create_table', {
      name: newTableName,
      mode: newTableMode,
      maxMatches: newTableMaxMatches,
    });
    setNewTableName('');
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    socket.emit('send_message', currentMessage);
    setCurrentMessage('');
  };

  const openAvatarModal = () => {
    const options = Array.from({ length: 12 }).map(() => {
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
    });
    setAvatarOptions(options);
    setShowAvatarModal(true);
  };

  const selectAvatar = (url) => {
    socket.emit('change_avatar', url);
    setShowAvatarModal(false);
  };

  const userLevel = Math.floor((userStats.xp || 0) / 100) + 1;
  const xpProgress = (userStats.xp || 0) % 100;
  const avatarUri = userStats.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={openAvatarModal}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.welcome}>Olá, {username}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelBadge}>Lvl {userLevel}</Text>
              <View style={styles.levelBarTrack}>
                <View style={[styles.levelBarFill, { width: `${xpProgress}%` }]} />
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Sair</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>🏆 {userStats.vitorias}</Text>
          <Text style={styles.statText}>💔 {userStats.derrotas}</Text>
          <Text style={styles.statText}>🎮 {userStats.partidas}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TabButton label="Mesas" active={tab === 'mesas'} onPress={() => setTab('mesas')} />
        <TabButton label="Chat" active={tab === 'chat'} onPress={() => setTab('chat')} />
        <TabButton label="Ranking" active={tab === 'ranking'} onPress={() => setTab('ranking')} />
      </View>

      {tab === 'mesas' && (
        <View style={styles.tabContent}>
          <View style={styles.createCard}>
            <TextInput
              style={styles.input}
              placeholder="Nome da mesa..."
              placeholderTextColor="#64748b"
              value={newTableName}
              onChangeText={setNewTableName}
              maxLength={20}
            />
            <View style={styles.pillRow}>
              {MODES.map((m) => (
                <Pill key={m} label={m} active={newTableMode === m} onPress={() => setNewTableMode(m)} />
              ))}
            </View>
            <View style={styles.pillRow}>
              {MAX_MATCHES_OPTIONS.map((n) => (
                <Pill
                  key={n}
                  label={`Melhor de ${n}`}
                  active={newTableMaxMatches === n}
                  onPress={() => setNewTableMaxMatches(n)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateTable}>
              <Text style={styles.createBtnText}>Criar Mesa</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={tables}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma mesa ativa. Crie a primeira!</Text>}
            renderItem={({ item }) => {
              const maxPlayers = MAX_PLAYERS[item.mode] ?? 4;
              const full = item.players.length >= maxPlayers;
              return (
                <View style={styles.tableCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tableName}>{item.name}</Text>
                    <Text style={styles.tableInfo}>
                      {item.mode} (Max {item.maxMatches}) • {item.players.length}/{maxPlayers}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={full}
                    style={[styles.joinBtn, full && styles.joinBtnFull]}
                    onPress={() => navigation.navigate('Table', { tableId: item.id })}
                  >
                    <Text style={styles.joinBtnText}>{full ? 'Cheia' : 'Entrar'}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      )}

      {tab === 'chat' && (
        <KeyboardAvoidingView
          style={styles.tabContent}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            data={chatMessages}
            keyExtractor={(_, idx) => String(idx)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma mensagem ainda.</Text>}
            renderItem={({ item }) => (
              <Text style={styles.chatMessage}>
                <Text style={styles.chatUser}>{item.user}: </Text>
                {item.text}
              </Text>
            )}
          />
          <View style={styles.chatInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#64748b"
              value={currentMessage}
              onChangeText={setCurrentMessage}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
              <Text style={styles.sendBtnText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {tab === 'ranking' && (
        <View style={styles.tabContent}>
          <FlatList
            data={globalRanking}
            keyExtractor={(item) => item.username}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Ainda não há rankings.</Text>}
            renderItem={({ item }) => (
              <View style={styles.rankRow}>
                <Text style={styles.rankPosition}>#{item.rank}</Text>
                <Image source={{ uri: item.avatar }} style={styles.rankAvatar} />
                <Text style={styles.rankName}>{item.username}</Text>
                <Text style={styles.rankXp}>{item.xp} XP</Text>
              </View>
            )}
          />
        </View>
      )}

      <AvatarModal
        visible={showAvatarModal}
        options={avatarOptions}
        onSelect={selectAvatar}
        onClose={() => setShowAvatarModal(false)}
      />
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress}>
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Pill({ label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.pill, active && styles.pillActive]} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    paddingTop: 50,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#334155' },
  headerInfo: { flex: 1 },
  welcome: { color: '#fff', fontWeight: '700', fontSize: 15 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  levelBadge: { color: '#fbbf24', fontSize: 11, fontWeight: '700' },
  levelBarTrack: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  levelBarFill: { height: '100%', backgroundColor: '#38bdf8' },
  logoutBtn: { backgroundColor: '#F43F5E', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  logoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  statText: { color: '#ddd', fontSize: 13 },
  tabBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#38bdf8' },
  tabBtnText: { color: '#94a3b8', fontWeight: '600' },
  tabBtnTextActive: { color: '#38bdf8' },
  tabContent: { flex: 1 },
  listContent: { padding: 16, gap: 10 },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  createCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillActive: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  pillText: { color: '#cbd5e1', fontSize: 12 },
  pillTextActive: { color: '#0f172a', fontWeight: '700' },
  createBtn: { backgroundColor: '#4ADE80', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  createBtnText: { color: '#064E3B', fontWeight: '700' },
  tableCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableName: { color: '#38BDF8', fontSize: 15, fontWeight: '700' },
  tableInfo: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  joinBtn: { backgroundColor: '#38BDF8', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  joinBtnFull: { backgroundColor: '#64748B' },
  joinBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 12 },
  chatMessage: { color: '#e2e8f0', fontSize: 13, marginBottom: 4 },
  chatUser: { color: '#38BDF8', fontWeight: '700' },
  chatInputRow: { flexDirection: 'row', gap: 8, padding: 16, paddingTop: 0 },
  sendBtn: { backgroundColor: '#38BDF8', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, justifyContent: 'center' },
  sendBtnText: { color: '#0F172A', fontWeight: '700' },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 8,
  },
  rankPosition: { color: '#fbbf24', fontWeight: '700', width: 28 },
  rankAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155' },
  rankName: { color: '#fff', flex: 1 },
  rankXp: { color: '#94A3B8', fontSize: 12 },
});
