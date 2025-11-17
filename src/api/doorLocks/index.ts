// src/api/doorLocks/index.ts
import { http } from '../httpClient';
import { DoorLock } from '../types';

export async function getDoorLocks(): Promise<DoorLock[]> {
  const { data } = await http.get<DoorLock[]>('/door-locks');
  return data;
}

export async function getDoorLock(id: number): Promise<DoorLock> {
  const { data } = await http.get<DoorLock>(`/door-locks/${id}`);
  return data;
}

export interface CreateDoorLockPayload {
  name: string;
  localization: string;
  status: string; // ex: 'locked'
}

export async function createDoorLock(
  payload: CreateDoorLockPayload,
): Promise<DoorLock> {
  const { data } = await http.post<DoorLock>('/door-locks', payload);
  return data;
}

// opcional: atualizar status futuramente
export async function updateDoorLock(
  id: number,
  payload: Partial<CreateDoorLockPayload>,
): Promise<DoorLock> {
  const { data } = await http.put<DoorLock>(`/door-locks/${id}`, payload);
  return data;
}

export async function updateDoorLockStatus(
  id: number,
  status: string,
): Promise<DoorLock> {
  const { data } = await http.put<DoorLock>(`/door-locks/${id}`, { status });
  return data;
}
