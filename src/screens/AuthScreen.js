import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useSocket, BACKEND_URL } from '../context/SocketContext';
import RulesModal from '../components/RulesModal';
import LegalModal from '../components/LegalModal';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export default function AuthScreen() {
  const { login } = useSocket();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [legalVisible, setLegalVisible] = useState(false);
  const [legalType, setLegalType] = useState('terms');

  const openLegal = (type) => {
    setLegalType(type);
    setLegalVisible(true);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const initGSI = () => {
        if (!window.google) {
          setTimeout(initGSI, 100);
          return;
        }
        window.google.accounts.id.initialize({
          client_id: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              setLoading(true);
              const idToken = response.credential;
              const base64Url = idToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const user = JSON.parse(jsonPayload);
              
              const res = await fetch(`${BACKEND_URL}/api/auth/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  idToken: idToken,
                  uid: user.sub,
                  email: user.email,
                  displayName: user.name,
                  photoURL: user.picture,
                }),
              });
              
              const data = await res.json();
              if (res.ok && data.success) {
                await login(data.username);
              } else {
                setError(data.message || 'Erro na autenticação social.');
              }
            } catch (e) {
              console.error('Web GSI erro:', e);
              setError('Erro ao processar login do Google.');
            } finally {
              setLoading(false);
            }
          }
        });
        
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'rectangular', width: 250 }
          );
        }
      };
      initGSI();
    }
  }, []);

  const handleSocialLogin = async () => {
    setError('');
    
    if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
      setError('Login com Google ainda não configurado neste app (falta o Client ID).');
      return;
    }
    
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      
      const payload = userInfo.data ? userInfo.data : userInfo;
      const { idToken, user } = payload;

      if (!idToken) throw new Error('Sem idToken retornado do Google.');

      const res = await fetch(`${BACKEND_URL}/api/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: idToken,
          uid: user.id,
          email: user.email,
          displayName: user.name,
          photoURL: user.photo,
        }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        await login(data.username);
      } else {
        setError(data.message || 'Erro na autenticação social no servidor.');
      }
    } catch (err) {
      console.log('Erro no Google Signin:', err);
      setError(`Falha ao autenticar: ${err.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (guestNumber) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: 'dummy-token',
          uid: `guest-uid-${guestNumber}`,
          email: `convidado${guestNumber}@truco.com`,
          displayName: `Convidado ${guestNumber}`,
          photoURL: `https://api.dicebear.com/9.x/avataaars/png?seed=Guest${guestNumber}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await login(data.username);
      } else {
        setError(data.message || 'Erro no login de convidado.');
      }
    } catch (err) {
      setError('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleContainer}>
          <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
          <Text style={styles.title}>Truco-Play</Text>
        </View>
        <Text style={styles.subtitle}>
          Bem-vindo! Entre com o Google para jogar.
        </Text>

        <TouchableOpacity style={styles.rulesBtn} onPress={() => setShowRules(true)}>
          <Text style={styles.rulesBtnText}>📖 Como Jogar</Text>
        </TouchableOpacity>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.loginCard}>
          {loading ? (
            <ActivityIndicator color="#38bdf8" size="large" />
          ) : (
            <>
              {Platform.OS === 'web' ? (
                <View nativeID="google-btn-container" style={{ alignItems: 'center', height: 44, width: '100%', marginBottom: 12 }} />
              ) : (
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleSocialLogin}
                  disabled={loading}
                >
                  <Text style={styles.googleBtnText}>Entrar com Google</Text>
                </TouchableOpacity>
              )}

              {__DEV__ && (
                <View style={styles.devContainer}>
                  <TouchableOpacity 
                    style={[styles.googleBtn, styles.guestBtn]} 
                    onPress={() => handleGuestLogin(1)}
                    disabled={loading}
                  >
                    <Text style={styles.googleBtnText}>Convidado 1 (Dev)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.googleBtn, styles.guestBtn]} 
                    onPress={() => handleGuestLogin(2)}
                    disabled={loading}
                  >
                    <Text style={styles.googleBtnText}>Convidado 2 (Dev)</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={styles.legalLink} onPress={() => openLegal('terms')}>Termos de Uso</Text> e{' '}
            <Text style={styles.legalLink} onPress={() => openLegal('privacy')}>Política de Privacidade</Text>.
            Veja também nossa política de{' '}
            <Text style={styles.legalLink} onPress={() => openLegal('safeplay')}>Jogo Leve Curtição Sem Stress</Text>.
          </Text>
          <Text style={styles.supportText}>
            Suporte: <Text style={styles.supportEmail}>ivan.oliveira.it@gmail.com</Text>
          </Text>
        </View>
      </ScrollView>

      <RulesModal visible={showRules} onClose={() => setShowRules(false)} />
      <LegalModal visible={legalVisible} type={legalType} onClose={() => setLegalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 24, paddingBottom: 48, flexGrow: 1, justifyContent: 'center' },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  rulesBtn: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  rulesBtnText: { color: '#38bdf8', fontWeight: '700', fontSize: 14 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center' },
  loginCard: {
    backgroundColor: 'rgba(30,41,59,0.5)',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
  },
  googleBtnText: { color: '#333', fontWeight: '800', fontSize: 16 },
  devContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10, width: '100%' },
  guestBtn: { flex: 1, backgroundColor: '#10b981', paddingVertical: 10 },
  legalFooter: { marginTop: 40, paddingHorizontal: 10, paddingBottom: 20 },
  legalText: { color: '#64748b', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  legalLink: { color: '#94a3b8', textDecorationLine: 'underline', fontWeight: 'bold' },
  supportText: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 15 },
  supportEmail: { color: '#38bdf8', fontWeight: 'bold' },
});
