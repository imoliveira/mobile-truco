import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Animated, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSocket } from '../context/SocketContext';
import Card from '../components/Card';
import PlayerSlot from '../components/PlayerSlot';
import GameControls from '../components/GameControls';

const QUICK_EMOTES = ['🦆', '🦆🦆🦆', '🤡', '🤣', '🤬'];

const FloatingEmote = ({ emote, onComplete }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const randomX = useRef((Math.random() - 0.5) * 150).current; // Deriva aleatória para os lados
  const randomRotate = useRef((Math.random() > 0.5 ? 1 : -1) * 720).current; // Gira 2x para um lado aleatório

  useEffect(() => {
    Animated.timing(anim, { 
      toValue: 1, 
      duration: 2500, 
      useNativeDriver: true 
    }).start(() => onComplete(emote.id));
  }, []);

  return (
    <Animated.Text style={[styles.floatingEmote, {
      opacity: anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
      transform: [
        { scale: anim.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0.1, 1.5, 2] }) },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [100, -350] }) },
        { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, randomX] }) },
        { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${randomRotate}deg`] }) }
      ]
    }]}>
      {emote.emoji}
    </Animated.Text>
  );
};

export default function TableScreen({ route, navigation }) {
  const { tableId } = route.params;
  const { socket, username } = useSocket();

  const [table, setTable] = useState(null);
  const [hand, setHand] = useState([]);
  const [playedCards, setPlayedCards] = useState([]);
  const [myTurn, setMyTurn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isHidingCard, setIsHidingCard] = useState(false);
  const [trucoRequest, setTrucoRequest] = useState(null);

  // Chat & Emote states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeEmotes, setActiveEmotes] = useState([]);
  const scrollViewRef = useRef();

  const handRef = useRef(hand);
  const trucoRequestRef = useRef(trucoRequest);
  const dealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { handRef.current = hand; }, [hand]);
  useEffect(() => { trucoRequestRef.current = trucoRequest; }, [trucoRequest]);

  // Timer jogada
  useEffect(() => {
    let interval;
    if (myTurn && !trucoRequest) {
      setTimeLeft(15);
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            const currentHand = handRef.current;
            if (currentHand.length > 0) {
              const randomIndex = Math.floor(Math.random() * currentHand.length);
              handlePlayCard(currentHand[randomIndex], randomIndex);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(15);
    }
    return () => clearInterval(interval);
  }, [myTurn, trucoRequest]);

  // Timer truco
  useEffect(() => {
    let interval;
    if (trucoRequest) {
      interval = setInterval(() => {
        setTrucoRequest((prev) => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            clearInterval(interval);
            socket.emit('respond_truco', { tableId, accepted: false });
            return null;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trucoRequest, socket, tableId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_table', tableId);

    socket.on('table_update', (updatedTable) => {
      setTable(updatedTable);
      if (updatedTable.currentTrickCards && updatedTable.currentTrickCards.length === 0) {
        setPlayedCards([]);
      }
      setMyTurn(updatedTable.currentTurn === username);
      if (updatedTable.status !== 'waiting_truco') {
        setTrucoRequest(null);
      }
    });

    socket.on(`deal_cards_${username}`, (cards) => {
      setHand(cards);
      setPlayedCards([]);
      setIsHidingCard(false);
      setTrucoRequest(null);
      
      dealAnim.setValue(0);
      Animated.spring(dealAnim, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });

    socket.on('card_played', ({ player, card }) => {
      setPlayedCards(prev => [...prev, { player, card }]);
    });

    socket.on('truco_requested', ({ from, value }) => {
      if (from !== username) {
        setTrucoRequest({ from, value, timeLeft: 15 });
      }
    });

    // Chat events
    socket.on('receive_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.on('receive_emote', (data) => {
      const newEmote = { id: Date.now().toString() + Math.random(), emoji: data.emoji, user: data.user };
      setActiveEmotes(prev => [...prev, newEmote]);
    });

    return () => {
      socket.emit('leave_table', tableId);
      socket.off('table_update');
      socket.off(`deal_cards_${username}`);
      socket.off('card_played');
      socket.off('truco_requested');
      socket.off('receive_message');
      socket.off('receive_emote');
    };
  }, [socket, tableId, username, dealAnim]);

  const handlePlayCard = (card, index) => {
    if (!myTurn || trucoRequest) return;
    const cardToPlay = { ...card, hidden: isHidingCard };
    socket.emit('play_card', { tableId, card: cardToPlay });
    setHand(prev => prev.filter((_, i) => i !== index));
    setMyTurn(false);
    setIsHidingCard(false);
  };

  const handleRequestTruco = (newValue) => {
    socket.emit('request_truco', { tableId, value: newValue || 3 });
  };

  const handleRespondTruco = (accepted) => {
    socket.emit('respond_truco', { tableId, accepted });
    setTrucoRequest(null);
  };

  const handleFold = () => {
    Alert.alert('Correr?', 'Deseja realmente abandonar esta mão?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim, Correr', onPress: () => socket.emit('fold_hand', tableId), style: 'destructive' },
    ]);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      socket.emit('send_message', { tableId, text: inputText.trim() });
      setInputText('');
    }
  };

  const handleSendEmote = (emoji) => {
    socket.emit('send_emote', { tableId, emoji });
    setIsChatOpen(false); // Optionally close chat when sending emote
  };

  const removeEmote = (id) => {
    setActiveEmotes(prev => prev.filter(e => e.id !== id));
  };

  if (!table) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Conectando à mesa...</Text>
      </View>
    );
  }

  const otherPlayer = table.players.find(p => p.username !== username);
  const myTeam = (table.players.findIndex(p => p.username === username) % 2 === 0) ? 'team1' : 'team2';
  const canTruco = table.lastTrucoTeam !== myTeam && table.currentValue < 12;

  const translateY = dealAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, 0] });
  const rotate = dealAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Sair</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          {table.maxMatches > 1 && (
            <View style={[styles.scoreBoard, { backgroundColor: '#334155', marginBottom: 4 }]}>
              <Text style={[styles.scoreText, { color: '#cbd5e1' }]}>
                JOGOS: {table.matchScore?.[myTeam] || 0} x {table.matchScore?.[myTeam === 'team1' ? 'team2' : 'team1'] || 0}
              </Text>
            </View>
          )}
          <View style={styles.scoreBoard}>
            <Text style={styles.scoreText}>NÓS: {table.score?.[myTeam] || 0}</Text>
            <Text style={styles.scoreDivider}>|</Text>
            <Text style={styles.scoreText}>ELES: {table.score?.[myTeam === 'team1' ? 'team2' : 'team1'] || 0}</Text>
          </View>
        </View>
        <Text style={styles.tableValue}>VALE: {table.currentValue || 1}</Text>
      </View>

      <View style={styles.felt}>
        <PlayerSlot
          player={otherPlayer}
          position="top"
          isTurn={table.currentTurn === otherPlayer?.username}
        />

        {/* Emotes Animados */}
        {activeEmotes.map(emote => (
          <FloatingEmote key={emote.id} emote={emote} onComplete={removeEmote} />
        ))}

        <View style={styles.tableCenter}>
          <View style={styles.cardsRow}>
            {playedCards.map((p, i) => (
              <View key={i} style={styles.playedCardWrapper}>
                <Card card={p.card} disabled hidden={p.card.hidden} />
                <Text style={styles.playedBy}>{p.player}</Text>
              </View>
            ))}
          </View>
          
          {table.vira && (
            <View style={styles.viraContainer}>
               <Text style={styles.viraLabel}>VIRA</Text>
               <View style={styles.deckStack}>
                 <View style={[styles.stackedCard, { left: -10, top: 4 }]}><Card card={{}} hidden disabled /></View>
                 <View style={[styles.stackedCard, { left: -5, top: 2 }]}><Card card={{}} hidden disabled /></View>
                 <View style={styles.stackedCard}><Card card={{}} hidden disabled /></View>
               </View>
               <View style={styles.viraCardWrapper}>
                  <Card card={table.vira} disabled />
               </View>
            </View>
          )}
        </View>

        <View style={styles.bottomPlayerWrapper}>
          {myTurn && !trucoRequest && (
            <View style={styles.timerContainer}>
              <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextDanger]}>
                ⏳ {timeLeft}s
              </Text>
            </View>
          )}
          <PlayerSlot
            player={{ username, avatar: table.players.find(p => p.username === username)?.avatar }}
            position="bottom"
            isTurn={myTurn}
          />
        </View>

        {myTurn && !trucoRequest && (
          <GameControls
            trucoLevel={table.currentValue === 1 ? 1 : table.currentValue}
            canTruco={canTruco}
            onTruco={() => handleRequestTruco(table.currentValue === 1 ? 3 : table.currentValue === 3 ? 6 : table.currentValue === 6 ? 9 : 12)}
            onFold={handleFold}
            onHide={() => setIsHidingCard(!isHidingCard)}
            isHidingCard={isHidingCard}
          />
        )}

        <View style={styles.myHand}>
          {hand.map((card, index) => (
            <Animated.View key={index} style={{ transform: [{ translateY }, { rotate }] }}>
              <Card card={card} onPress={() => handlePlayCard(card, index)} disabled={!myTurn || trucoRequest} />
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Botão de Chat flutuante */}
      <TouchableOpacity style={styles.chatButton} onPress={() => setIsChatOpen(true)}>
        <Text style={styles.chatButtonText}>💬</Text>
      </TouchableOpacity>

      {/* Overlay de Chat */}
      {isChatOpen && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatOverlay}>
          <TouchableOpacity style={styles.chatCloseOverlay} onPress={() => setIsChatOpen(false)} />
          
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Resenha 🗣️</Text>
              <TouchableOpacity onPress={() => setIsChatOpen(false)}>
                <Text style={styles.chatCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.chatMessages} 
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {chatMessages.map((msg, i) => (
                <View key={i} style={[styles.msgBubble, msg.user === username ? styles.msgBubbleSelf : styles.msgBubbleOther]}>
                  <Text style={styles.msgUser}>{msg.user}</Text>
                  <Text style={styles.msgText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.quickEmotesContainer}>
              {QUICK_EMOTES.map((emoji, i) => (
                <TouchableOpacity key={i} style={styles.quickEmoteBtn} onPress={() => handleSendEmote(emoji)}>
                  <Text style={styles.quickEmoteText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Manda a letra..."
                placeholderTextColor="#64748b"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
                <Text style={styles.chatSendBtnText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Overlay de Truco */}
      {trucoRequest && table.status !== 'match_finished' && (
        <View style={styles.trucoOverlay}>
          <View style={styles.trucoModal}>
            <Text style={styles.trucoModalTitle}>TRUCO!</Text>
            <Text style={styles.trucoModalText}>{trucoRequest.from} pediu Truco (Vale {trucoRequest.value})</Text>
            <View style={styles.trucoTimerContainer}>
              <Text style={styles.trucoTimerText}>⏳ {trucoRequest.timeLeft}s</Text>
            </View>
            <View style={styles.trucoBtns}>
              <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleRespondTruco(false)}>
                <Text style={styles.btnText}>CORRER</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => handleRespondTruco(true)}>
                <Text style={styles.btnText}>ACEITAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Overlay de Fim de Partida */}
      {table.status === 'match_finished' && (
        <View style={styles.trucoOverlay}>
          <View style={[styles.trucoModal, { borderColor: table.matchWinner === myTeam ? '#10b981' : '#ef4444' }]}>
            <Text style={[styles.trucoModalTitle, { color: table.matchWinner === myTeam ? '#10b981' : '#ef4444' }]}>
              {table.matchWinner === myTeam ? 'VITÓRIA!' : 'DERROTA!'}
            </Text>
            <Text style={styles.trucoModalText}>
              A partida terminou.
            </Text>
            <View style={styles.trucoBtns}>
              <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => navigation.goBack()}>
                <Text style={styles.btnText}>VOLTAR AO LOBBY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#064e3b' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingText: { color: '#38bdf8', fontWeight: '700' },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { color: '#fff', fontWeight: '700' },
  scoreBoard: { flexDirection: 'row', backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, gap: 8 },
  scoreText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  scoreDivider: { color: '#334155' },
  tableValue: { color: '#fbbf24', fontWeight: '900', fontSize: 12 },
  felt: { flex: 1, margin: 10, borderRadius: 150, borderWidth: 8, borderColor: '#065f46', backgroundColor: '#14532d', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  tableCenter: { flexDirection: 'row', alignItems: 'center', gap: 40 },
  cardsRow: { flexDirection: 'row', gap: -30 },
  playedCardWrapper: { alignItems: 'center' },
  playedBy: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 },
  viraContainer: { alignItems: 'center', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 30, position: 'relative', height: 140, justifyContent: 'flex-end' },
  viraLabel: { color: '#fbbf24', fontSize: 10, fontWeight: '900', marginBottom: 4, position: 'absolute', top: -15 },
  deckStack: { position: 'absolute', top: 20, right: 20, zIndex: 2, transform: [{ rotate: '15deg' }] },
  stackedCard: { position: 'absolute' },
  viraCardWrapper: { zIndex: 1, transform: [{ rotate: '-10deg' }] },
  myHand: { position: 'absolute', bottom: 20, flexDirection: 'row', gap: 10 },
  bottomPlayerWrapper: { alignItems: 'center', position: 'absolute', bottom: 120 },
  timerContainer: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  timerText: { color: '#34d399', fontWeight: '900', fontSize: 14 },
  timerTextDanger: { color: '#ef4444' },
  
  // Floating Emote
  floatingEmote: { position: 'absolute', fontSize: 80, zIndex: 1000, top: '40%', alignSelf: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 },
  
  // Chat Button
  chatButton: { position: 'absolute', top: 80, right: 20, backgroundColor: '#0f172a', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#38bdf8', elevation: 5 },
  chatButtonText: { fontSize: 24 },
  
  // Chat Overlay
  chatOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 90, justifyContent: 'flex-end' },
  chatCloseOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  chatContainer: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, height: '60%' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chatTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatCloseText: { color: '#ef4444', fontSize: 20, fontWeight: 'bold' },
  chatMessages: { flex: 1, marginBottom: 12 },
  msgBubble: { padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '80%' },
  msgBubbleSelf: { backgroundColor: '#047857', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  msgBubbleOther: { backgroundColor: '#334155', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  msgUser: { color: '#94a3b8', fontSize: 10, marginBottom: 2, fontWeight: 'bold' },
  msgText: { color: '#fff', fontSize: 14 },
  
  quickEmotesContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  quickEmoteBtn: { padding: 8, backgroundColor: '#0f172a', borderRadius: 20 },
  quickEmoteText: { fontSize: 24 },
  
  chatInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  chatInput: { flex: 1, backgroundColor: '#0f172a', color: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  chatSendBtn: { backgroundColor: '#38bdf8', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chatSendBtnText: { color: '#0f172a', fontSize: 18, fontWeight: 'bold', marginLeft: 2 },

  // Truco Modal
  trucoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  trucoModal: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, alignItems: 'center', width: '85%', borderWidth: 2, borderColor: '#fbbf24' },
  trucoModalTitle: { color: '#fbbf24', fontSize: 32, fontWeight: '900', marginBottom: 8 },
  trucoModalText: { color: '#fff', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  trucoTimerContainer: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8, marginBottom: 20 },
  trucoTimerText: { color: '#ef4444', fontSize: 20, fontWeight: '900' },
  trucoBtns: { flexDirection: 'row', gap: 12 },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flex: 1 },
  btnDanger: { backgroundColor: '#ef4444' },
  btnSuccess: { backgroundColor: '#10b981' },
  btnWarning: { backgroundColor: '#f59e0b' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
});
