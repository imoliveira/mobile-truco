import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SocketProvider } from './src/context/SocketContext';
import RootNavigator from './src/navigation/RootNavigator';


export default function App() {
  return (
    <SocketProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SocketProvider>
  );
}
