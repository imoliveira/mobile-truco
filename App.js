import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SocketProvider } from './src/context/SocketContext';
import RootNavigator from './src/navigation/RootNavigator';

// Interceptador global de requests para gerar logs
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  console.log(`[FRONTEND FETCH] ${options?.method || 'GET'} ${url}`);
  if (options?.body) {
    console.log(`[FRONTEND FETCH BODY]`, options.body);
  }
  
  const startTime = Date.now();
  try {
    const response = await originalFetch(url, options);
    console.log(`[FRONTEND FETCH RESP] ${options?.method || 'GET'} ${url} - Status: ${response.status} (${Date.now() - startTime}ms)`);
    return response;
  } catch (error) {
    console.error(`[FRONTEND FETCH ERROR] ${options?.method || 'GET'} ${url} - ${error.message}`);
    throw error;
  }
};
export default function App() {
  return (
    <SocketProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SocketProvider>
  );
}
