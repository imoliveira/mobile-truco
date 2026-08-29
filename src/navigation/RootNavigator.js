import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSocket } from '../context/SocketContext';
import AuthScreen from '../screens/AuthScreen';
import LobbyScreen from '../screens/LobbyScreen';
import TableScreen from '../screens/TableScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { username, sessionChecked } = useSocket();

  if (!sessionChecked) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {username ? (
          // Logado: pilha Lobby -> Mesa. Trocar de árvore ao logar/deslogar
          // (em vez de usar initialRouteName) é o padrão recomendado pelo
          // React Navigation para fluxos de autenticação.
          <>
            <Stack.Screen name="Lobby" component={LobbyScreen} />
            <Stack.Screen name="Table" component={TableScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
