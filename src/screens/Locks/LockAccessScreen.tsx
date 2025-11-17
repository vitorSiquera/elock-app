// src/screens/Locks/LockAccessScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getDoorLockUsersByDoorLock,
  deleteDoorLockUser,
} from '../../api/doorLockUser';
import type { DoorLockUser } from '../../api/types';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type LockAccessRouteProp = RouteProp<RootStackParamList, 'LockAccess'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'LockAccess'>;

export const LockAccessScreen: React.FC = () => {
  const route = useRoute<LockAccessRouteProp>();
  const navigation = useNavigation<Nav>();

  const { doorLockId, name } = route.params;

  const [accessList, setAccessList] = useState<DoorLockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccess = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDoorLockUsersByDoorLock(doorLockId);
      setAccessList(data);
    } catch (error: any) {
      console.log('Erro ao buscar acessos:', error?.response?.data || error?.message);
    } finally {
      setLoading(false);
    }
  }, [doorLockId]);

  const refreshAccess = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getDoorLockUsersByDoorLock(doorLockId);
      setAccessList(data);
    } catch (error: any) {
      console.log('Erro ao atualizar acessos:', error?.response?.data || error?.message);
    } finally {
      setRefreshing(false);
    }
  }, [doorLockId]);

  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  async function handleRevoke(item: DoorLockUser) {
    Alert.alert(
      'Revogar acesso',
      `Remover acesso de ${item.user?.name ?? 'este usuário'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoorLockUser(item.id);
              setAccessList((prev) =>
                prev.filter((access) => access.id !== item.id),
              );
            } catch (error: any) {
              console.log(
                'Erro ao revogar acesso:',
                error?.response?.data || error?.message,
              );
              Alert.alert(
                'Erro',
                error?.response?.data?.message ??
                  'Não foi possível revogar o acesso.',
              );
            }
          },
        },
      ],
    );
  }

  function renderItem({ item }: { item: DoorLockUser }) {
    const userName = item.user?.name ?? `Usuário #${item.userId}`;
    const userEmail = item.user?.email ?? '';
    const paper = item.paper ?? 'guest';
    const status = item.status ?? 'active';

    const isOwner = paper.toLowerCase() === 'owner';
    const isActive = status.toLowerCase() === 'active';

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#4B5563"
            />
          </View>
          <View>
            <Text style={styles.itemName}>{userName}</Text>
            {userEmail ? (
              <Text style={styles.itemEmail}>{userEmail}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.itemRight}>
          <View
            style={[
              styles.tag,
              isOwner ? styles.tagOwner : styles.tagGuest,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                isOwner ? styles.tagTextOwner : styles.tagTextGuest,
              ]}
            >
              {isOwner ? 'Owner' : paper}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isActive ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <View style={styles.statusDot} />
            <Text
              style={[
                styles.statusText,
                isActive ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {isActive ? 'Ativo' : status}
            </Text>
          </View>

          {/* Botão de remover (não mostra para owner) */}
          {!isOwner && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRevoke(item)}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color="#DC2626"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Acesso à fechadura</Text>
            <Text style={styles.headerSubtitle}>{name}</Text>
          </View>

          <View style={{ width: 32 }} />
        </View>

        {/* Card principal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={22}
                color="#111827"
              />
              <Text style={styles.cardTitle}>Usuários com acesso</Text>
            </View>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() =>
                navigation.navigate('ShareAccess', {
                  doorLockId,
                  name,
                })
              }
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color="#7F39FB"
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>
                Carregando lista de acessos...
              </Text>
            </View>
          ) : accessList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={36}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>Nenhum acesso encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Apenas o owner atual tem acesso padrão à fechadura. Em breve,
                você poderá compartilhar com outros usuários aqui.
              </Text>
            </View>
          ) : (
            <FlatList
              data={accessList}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 4 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshAccess}
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 4,
  },
  tagOwner: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  tagGuest: {
    backgroundColor: 'rgba(17, 24, 39, 0.06)',
  },
  tagText: {
    fontSize: 11,
  },
  tagTextOwner: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  tagTextGuest: {
    color: '#374151',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  statusInactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.16)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
  },
  statusTextActive: {
    color: '#15803D',
    fontWeight: '600',
  },
  statusTextInactive: {
    color: '#6B7280',
  },
  removeButton: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
});
