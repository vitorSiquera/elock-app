// src/screens/Locks/ShareAccessScreen.tsx
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createDoorLockUser } from '../../api/doorLockUser';
import { getUsers } from '../../api/users';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type ShareAccessRouteProp = RouteProp<RootStackParamList, 'ShareAccess'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ShareAccess'>;

export const ShareAccessScreen: React.FC = () => {
  const route = useRoute<ShareAccessRouteProp>();
  const navigation = useNavigation<Nav>();

  const { doorLockId, name } = route.params;

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleShare() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert('Atenção', 'Informe o e-mail do usuário.');
      return;
    }

    try {
      setSubmitting(true);

      // 1) Busca todos os usuários
      const users = await getUsers();

      // 2) Encontra pelo e-mail (case-insensitive)
      const targetUser = users.find(
        (u) => u.email.trim().toLowerCase() === trimmedEmail,
      );

      if (!targetUser) {
        Alert.alert(
          'Usuário não encontrado',
          'Não existe nenhum usuário cadastrado com esse e-mail.',
        );
        return;
      }

      // 3) Cria o vínculo como guest/active
      await createDoorLockUser({
        userId: targetUser.id,
        doorLockId,
        paper: 'guest',
        status: 'active',
      });

      Alert.alert(
        'Sucesso',
        `Acesso compartilhado com ${targetUser.name || targetUser.email}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(), // volta para LockAccess
          },
        ],
      );
    } catch (error: any) {
      console.log('Erro ao compartilhar acesso:', error?.response?.data || error?.message);
      Alert.alert(
        'Erro',
        error?.response?.data?.message ??
          'Não foi possível compartilhar o acesso. Verifique o e-mail e tente novamente.',
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
              <Text style={styles.headerTitle}>Compartilhar acesso</Text>
              <Text style={styles.headerSubtitle}>{name}</Text>
            </View>

            <View style={{ width: 32 }} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View className="card-header" style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="people-outline"
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.cardTitle}>Convidar usuário</Text>
                <Text style={styles.cardSubtitle}>
                  Conceda acesso como convidado (guest) a esta fechadura
                  informando o e-mail.
                </Text>
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>
              E-mail do usuário
            </Text>
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
                placeholder="usuario@dominio.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Papel & status fixos (explicação) */}
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#6B7280"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.infoText}>
                O usuário receberá papel{' '}
                <Text style={{ fontWeight: '600' }}>guest</Text> com status{' '}
                <Text style={{ fontWeight: '600' }}>active</Text>. Você poderá
                revogar esse acesso pela lista de usuários com acesso.
              </Text>
            </View>

            {/* Botão de compartilhar */}
            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.9}
              onPress={handleShare}
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
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Compartilhar acesso</Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={18}
                      color="#FFFFFF"
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E5E7EB',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7F39FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  infoText: {
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
