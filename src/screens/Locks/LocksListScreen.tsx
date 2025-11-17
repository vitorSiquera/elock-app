// src/screens/Locks/LocksListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getDoorLocks } from '../../api/doorLocks';
import { DoorLock } from '../../api/types';
import { useAuth } from '../../context/AuthContext';

export const LocksListScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [locks, setLocks] = useState<DoorLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLocks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDoorLocks();
      setLocks(data);
    } catch (error: any) {
      console.log('Erro ao carregar fechaduras:', error?.response?.data || error?.message);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as fechaduras. Verifique sua conexão ou sua permissão.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLocks = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getDoorLocks();
      setLocks(data);
    } catch (error: any) {
      console.log('Erro ao atualizar fechaduras:', error?.response?.data || error?.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLocks();
  }, [loadLocks]);

  function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }

  function renderLockItem({ item }: { item: DoorLock }) {
    const isLocked = item.status === 'locked';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardContainer}
        // futuramente: navegar para detalhe da fechadura
        onPress={() => {
          Alert.alert(
            item.name,
            `Local: ${item.location}\nStatus: ${isLocked ? 'Trancada' : 'Destrancada'}`,
          );
        }}
      >
        <LinearGradient
          colors={isLocked ? ['#1F2937', '#4B5563'] : ['#22C55E', '#16A34A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={isLocked ? 'lock-closed-outline' : 'lock-open-outline'}
                size={24}
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

          <View style={styles.cardBody}>
            <Text style={styles.lockName}>{item.name}</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={18}
                color="#E5E7EB"
              />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient
      colors={['#5B2C98', '#7F39FB']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Olá, {user?.name ?? 'usuário'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Suas fechaduras conectadas
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#F9FAFB" />
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>Minhas fechaduras</Text>
            <TouchableOpacity onPress={refreshLocks}>
              <Ionicons
                name="refresh-outline"
                size={20}
                color="#6B21A8"
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Carregando fechaduras...</Text>
            </View>
          ) : locks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={40}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>Nenhuma fechadura encontrada</Text>
              <Text style={styles.emptySubtitle}>
                Verifique se seu usuário possui permissões no sistema Elock API.
              </Text>
            </View>
          ) : (
            <FlatList
              data={locks}
              keyExtractor={(item) => item.id}
              renderItem={renderLockItem}
              contentContainerStyle={{ paddingVertical: 8 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshLocks}
                  tintColor="#7F39FB"
                />
              }
            />
          )}
        </View>
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
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E5E7EB',
    marginTop: 2,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(249, 250, 251, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.24)',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
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
    color: '#F9FAFB',
  },
  cardBody: {
    marginTop: 12,
  },
  lockName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#E5E7EB',
  },
});
