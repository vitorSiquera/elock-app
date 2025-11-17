// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { createUser } from '../../api/users';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signIn, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLoading = submitting || authLoading;

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não conferem.');
      return;
    }

    try {
      setSubmitting(true);

      await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // após criar, já faz login automático
      await signIn(email.trim(), password);
      // RootNavigator troca de stack automaticamente
    } catch (error: any) {
      console.log('Erro ao criar usuário:', error?.response?.data || error?.message);

      Alert.alert(
        'Erro ao criar conta',
        error?.response?.data?.message ??
          'Não foi possível criar o usuário. Verifique os dados e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function goToLogin() {
    navigation.navigate('Login');
  }

  return (
    <LinearGradient colors={['#5B2C98', '#7F39FB']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header / Branding */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={goToLogin}
            >
              <Ionicons name="arrow-back" size={20} color="#F9FAFB" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Image
                source={require('../../../assets/elock mono 1.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>
                Registre-se para controlar suas fechaduras inteligentes.
              </Text>
            </View>
          </View>

          {/* Card de cadastro */}
          <View style={styles.card}>
            {/* Nome */}
            <Text style={styles.label}>Nome</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome completo"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            {/* Email */}
            <Text style={[styles.label, { marginTop: 16 }]}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Senha */}
            <Text style={[styles.label, { marginTop: 16 }]}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar senha */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              Confirmar senha
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repita a senha"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
            </View>

            {/* Botão Criar conta */}
            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.9}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#7F39FB', '#B779FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, isLoading && { opacity: 0.7 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Criar conta</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={18}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Link para login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.loginLinkText}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Elock API • Cadastro</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 250, 251, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerCenter: {
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 6,
  },
  passwordToggle: {
    marginLeft: 8,
  },
  buttonWrapper: {
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loginRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#6B7280',
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F39FB',
    marginLeft: 4,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#E5E7EB',
  },
});
