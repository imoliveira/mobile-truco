import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useSocket, BACKEND_URL } from '../context/SocketContext';
import RulesModal from '../components/RulesModal';
import { cpfMask, celularMask, validateCPF, validateEmail, randomCaptcha } from '../utils/validation';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export default function AuthScreen() {
  const { login } = useSocket();
  console.log('Google Client ID carregado:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [captcha, setCaptcha] = useState(randomCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
    nome: '',
    email: '',
    cpf: '',
    celular: '',
  });

  const setField = (field, value) => {
    if (field === 'cpf') value = cpfMask(value);
    if (field === 'celular') value = celularMask(value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLogin = async () => {
    setError('');
    console.log('--- DEBUG GOOGLE AUTH ---');
    console.log('Iniciando login com GoogleSignin Nativo...');
    
    if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
      setError('Login com Google ainda não configurado neste app (falta o Client ID).');
      return;
    }
    
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      
      // Compatibilidade com v16+ (.data) e versões antigas
      const payload = userInfo.data ? userInfo.data : userInfo;
      const { idToken, user } = payload;

      if (!idToken) {
        throw new Error('Sem idToken retornado do Google.');
      }

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
      setError('Falha ao autenticar com o Google. Tente novamente.');
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
          photoURL: `https://api.dicebear.com/9.x/avataaars/svg?seed=Guest${guestNumber}`,
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

  const handleSubmit = async () => {
    setError('');

    if (!form.username || !form.password) {
      setError('Por favor, preencha usuário e senha.');
      return;
    }

    if (parseInt(captchaInput, 10) !== captcha.num1 + captcha.num2) {
      setError('Captcha incorreto. Tente novamente.');
      setCaptcha(randomCaptcha());
      setCaptchaInput('');
      return;
    }

    if (!isLogin) {
      if (!form.nome || !form.email) {
        setError('Por favor, preencha os campos obrigatórios (Nome, E-mail).');
        return;
      }
      if (!validateEmail(form.email)) {
        setError('E-mail inválido.');
        return;
      }
      if (form.cpf && !validateCPF(form.cpf)) {
        setError('CPF inválido.');
        return;
      }
      if (form.password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        await login(form.username);
      } else {
        setError(data.message || 'Erro na operação.');
      }
    } catch (err) {
      setError('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setCaptcha(randomCaptcha());
    setCaptchaInput('');
    setForm({ username: '', password: '', nome: '', email: '', cpf: '', celular: '' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Truco-Play</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Bem-vindo de volta! Entre na sua conta.' : 'Crie sua conta para jogar.'}
        </Text>

        <TouchableOpacity style={styles.rulesBtn} onPress={() => setShowRules(true)}>
          <Text style={styles.rulesBtnText}>📖 Como Jogar</Text>
        </TouchableOpacity>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!isLogin && (
          <>
            <Field label="Nome Completo" value={form.nome} onChangeText={(v) => setField('nome', v)} />
            <Field
              label="E-mail"
              value={form.email}
              onChangeText={(v) => setField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="CPF (Opcional)"
              value={form.cpf}
              onChangeText={(v) => setField('cpf', v)}
              placeholder="000.000.000-00"
              keyboardType="numeric"
            />
            <Field
              label="Celular (Opcional)"
              value={form.celular}
              onChangeText={(v) => setField('celular', v)}
              placeholder="(00) 00000-0000"
              keyboardType="numeric"
            />
          </>
        )}

        <Field label="Usuário (Jogo)" value={form.username} onChangeText={(v) => setField('username', v)} />
        <Field
          label="Senha"
          value={form.password}
          onChangeText={(v) => setField('password', v)}
          secureTextEntry
        />
        <Field
          label={`Resolva: ${captcha.num1} + ${captcha.num2}`}
          value={captchaInput}
          onChangeText={(v) => setCaptchaInput(v.replace(/\D/g, ''))}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>{isLogin ? 'Entrar no Jogo' : 'Cadastrar'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleSocialLogin}
          disabled={loading}
        >
          <Text style={styles.googleBtnText}>Entrar com Google</Text>
        </TouchableOpacity>

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

        <TouchableOpacity onPress={toggleMode} style={styles.toggle}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Ainda não tem conta? ' : 'Já possui uma conta? '}
            <Text style={styles.toggleLink}>{isLogin ? 'Cadastre-se' : 'Fazer Login'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <RulesModal visible={showRules} onClose={() => setShowRules(false)} />
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#64748b"
        autoCorrect={false}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 24, paddingBottom: 48 },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 6 },
  rulesBtn: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  rulesBtnText: { color: '#38bdf8', fontWeight: '700', fontSize: 13 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center' },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { color: '#cbd5e1', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  googleBtn: {
    backgroundColor: '#DB4437',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  googleBtnText: { color: '#fff', fontWeight: '700' },
  devContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  guestBtn: { flex: 1, backgroundColor: '#10b981', marginHorizontal: 4, marginTop: 0 },
  toggle: { marginTop: 22, alignItems: 'center' },
  toggleText: { color: '#94a3b8', fontSize: 13 },
  toggleLink: { color: '#818cf8', fontWeight: '700' },
});
