// src/screens/Locks/NewLockScreen.tsx
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createDoorLock } from '../../api/doorLocks';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NewLock'>;

export const NewLockScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [name, setName] = useState('');
  const [localization, setLocalization] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateLock() {
    if (!name || !localization) {
      Alert.alert('Atenção', 'Informe nome e localização da fechadura.');
      return;
    }

    try {
      setSubmitting(true);

      await createDoorLock({
        name: name.trim(),
        localization: localization.trim(),
        status: 'locked', // padrão: criada já trancada
      });

      Alert.alert('Sucesso', 'Fechadura cadastrada com sucesso.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(), // volta pra lista
        },
      ]);
    } catch (error: any) {
      console.log('Erro ao criar fechadura:', error?.response?.data || error?.message);
      Alert.alert(
        'Erro',
        error?.response?.data?.message ??
          'Não foi possível criar a fechadura. Verifique os dados e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LinearGradient colors={['#5B2C98', '#7F39FB']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#F9FAFB" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.iconCircle}>
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.title}>Nova fechadura</Text>
              <Text style={styles.subtitle}>
                Cadastre uma fechadura IoT e vincule ao seu usuário.
              </Text>
            </View>

            <View style={{ width: 32 }} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Nome */}
            <Text style={styles.label}>Nome da fechadura</Text>
            <View className="input-wrapper" style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Porta principal do escritório"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            {/* Localização */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              Localização
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                value={localization}
                onChangeText={setLocalization}
                placeholder="Ex: Sala 101, Bloco A"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            {/* Status inicial - fixo locked por enquanto */}
            <View style={styles.statusInfo}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#6B7280"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.statusInfoText}>
                A fechadura será criada inicialmente como{' '}
                <Text style={{ fontWeight: '600' }}>trancada</Text> e vinculada
                ao seu usuário como <Text style={{ fontWeight: '600' }}>owner</Text>.
              </Text>
            </View>

            {/* Botão de salvar */}
            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.9}
              onPress={handleCreateLock}
              disabled={submitting}
            >
              <LinearGradient
                colors={['#7F39FB', '#B779FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.button,
                  submitting && { opacity: 0.7 },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Cadastrar fechadura</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 250, 251, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  card: {
    marginTop: 8,
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
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  statusInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  buttonWrapper: {
    marginTop: 24,
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
    fontSize: 15,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
