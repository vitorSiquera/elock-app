// src/screens/Locks/LockDetailScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getDoorLock,
  updateDoorLockStatus,
} from '../../api/doorLocks';
import { connectSocket, joinLock, leaveLock, onDoorLockUpdated, offDoorLockUpdated } from '../../api/socket';
import { useAuth } from '../../context/AuthContext';
import type { DoorLock } from '../../api/types';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type LockDetailRouteProp = RouteProp<RootStackParamList, 'LockDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'LockDetail'>;

export const LockDetailScreen: React.FC = () => {
  const route = useRoute<LockDetailRouteProp>();
  const navigation = useNavigation<Nav>();

  const [lock, setLock] = useState<DoorLock | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { id, name, localization, status } = route.params;

  const loadLock = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDoorLock(id);
      setLock(data);
    } catch (error: any) {
      console.log('Erro ao buscar fechadura:', error?.response?.data || error?.message);
      // fallback: usa os dados do param se der erro
      setLock({
        id,
        name,
        localization,
        status,
      });
    } finally {
      setLoading(false);
    }
  }, [id, name, localization, status]);

  const { token } = useAuth();

  useEffect(() => {
    loadLock();
  }, [loadLock]);

  useEffect(() => {
    if (!token) return;
    // ensure socket connected
    try {
      connectSocket(token);
    } catch (err) {
      console.warn('Erro ao conectar socket', err);
    }
  }, [token]);

  useEffect(() => {
    if (!lock) return;

    // join lock room
    joinLock(lock.id);

    const handleUpdate = (payload: any) => {
      if (payload?.id === lock.id) {
        setLock((prev) => ({ ...(prev as DoorLock), status: payload.status }));
      }
    };

    onDoorLockUpdated(handleUpdate);

    return () => {
      offDoorLockUpdated(handleUpdate);
      try {
        leaveLock(lock.id);
      } catch (err) {}
    };
  }, [lock]);

  async function handleToggleLock() {
    if (!lock) return;

    const nextStatus: string =
      lock.status === 'locked' ? 'unlocked' : 'locked';

    try {
      setUpdating(true);
      const updated = await updateDoorLockStatus(lock.id, nextStatus);
      setLock(updated);
    } catch (error: any) {
      console.log('Erro ao atualizar fechadura:', error?.response?.data || error?.message);
      Alert.alert(
        'Erro',
        'Não foi possível alterar o status da fechadura. Verifique suas permissões ou conexão.',
      );
    } finally {
      setUpdating(false);
    }
  }

  const isLocked = lock?.status === 'locked';

  return (
    <LinearGradient colors={['#5B2C98', '#7F39FB']} style={styles.gradient}>
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
            <Text style={styles.headerTitle}>Fechadura</Text>
            <Text style={styles.headerSubtitle}>
              Controle de acesso em tempo quase real
            </Text>
          </View>

          <View style={{ width: 32 }} />
        </View>

        {/* Conteúdo */}
        {loading || !lock ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#F9FAFB" />
            <Text style={styles.loadingText}>Carregando fechadura...</Text>
          </View>
        ) : (
          <>
            {/* Card principal */}
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={isLocked ? 'lock-closed' : 'lock-open'}
                    size={42}
                    color="#F9FAFB"
                  />
                </View>
                <View style={styles.statusPill}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isLocked ? '#F97316' : '#22C55E' },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {isLocked ? 'Trancada' : 'Destrancada'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.lockName}>{lock.name}</Text>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={18}
                    color="#6B7280"
                  />
                  <Text style={styles.infoText}>{lock.localization}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="radio-outline"
                    size={18}
                    color="#6B7280"
                  />
                  <Text style={styles.infoText}>
                    Estado atual: {isLocked ? 'Trancada' : 'Destrancada'}
                  </Text>
                </View>
              </View>

              {/* Controle interativo de bloqueio */}
              <View style={styles.lockSwitchContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleToggleLock}
                  disabled={updating}
                >
                  <View
                    style={[
                      styles.lockSwitchOuter,
                      isLocked ? styles.lockSwitchOuterLocked : styles.lockSwitchOuterUnlocked,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isLocked
                          ? ['#7F39FB', '#5B21B6'] // trancada: roxo mais intenso
                          : ['#22C55E', '#16A34A'] // destrancada: verde
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.lockSwitch,
                        updating && { opacity: 0.7 },
                      ]}
                    >
                      {updating ? (
                        <ActivityIndicator color="#F9FAFB" />
                      ) : (
                        <>
                          <Ionicons
                            name={isLocked ? 'lock-closed' : 'lock-open'}
                            size={40}
                            color="#F9FAFB"
                            style={{ marginBottom: 4 }}
                          />
                          <Text style={styles.lockStateText}>
                            {isLocked ? 'Trancada' : 'Destrancada'}
                          </Text>
                          <Text style={styles.lockHintText}>
                            {isLocked ? 'Toque para destrancar' : 'Toque para trancar'}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card secundário: instruções / status */}
            <View style={styles.secondaryCard}>
              <Text style={styles.secondaryTitle}>Dicas de uso</Text>
              <Text style={styles.secondaryText}>
                • Toque no botão principal para alternar o estado da fechadura.{'\n'}
                • Aguarde a confirmação visual de status antes de sair do ambiente.{'\n'}
                • Em caso de falha repetida, verifique a conexão do dispositivo
                Elock com a internet.
              </Text>
            </View>

            {/* Botão para ver quem tem acesso */}
            <View style={styles.accessWrapper}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.accessButton}
                onPress={() =>
                  navigation.navigate('LockAccess', {
                    doorLockId: lock.id,
                    name: lock.name,
                  })
                }
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#7F39FB"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.accessButtonText}>
                  Ver quem tem acesso
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#E5E7EB',
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7F39FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  cardInfo: {
    marginTop: 16,
  },
  lockName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  lockSwitchContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  lockSwitchOuter: {
    padding: 4,
    borderRadius: 999,
  },
  lockSwitchOuterLocked: {
    borderWidth: 2,
    borderColor: 'rgba(248, 113, 113, 0.5)', // vermelho suave quando trancada
  },
  lockSwitchOuterUnlocked: {
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.5)', // verde suave quando destrancada
  },
  lockSwitch: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  lockStateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  lockHintText: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(249, 250, 251, 0.8)',
    textAlign: 'center',
  },
  actionWrapper: {
    marginTop: 24,
  },
  actionButton: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  actionIcon: {
    marginLeft: 8,
  },
  secondaryCard: {
    marginTop: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.14)',
    borderRadius: 20,
    padding: 16,
  },
  secondaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  secondaryText: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  accessWrapper: {
    marginTop: 12,
  },
  accessButton: {
    height: 48,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(249, 250, 251, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F39FB',
  },
});
