// src/api/doorLockUser/index.ts
import { http } from '../httpClient';
import { DoorLockUser } from '../types';

export async function getDoorLockUsersByDoorLock(
  doorLockId: number,
): Promise<DoorLockUser[]> {
  const { data } = await http.get<DoorLockUser[]>('/door-lock-user', {
    params: { doorLockId },
  });

  return data;
}

export interface CreateDoorLockUserPayload {
  userId: number;
  doorLockId: number;
  paper: string;  // ex: 'guest'
  status: string; // ex: 'active'
}

export async function createDoorLockUser(
  payload: CreateDoorLockUserPayload,
): Promise<DoorLockUser> {
  const { data } = await http.post<DoorLockUser>('/door-lock-user', payload);
  return data;
}

export async function deleteDoorLockUser(id: number): Promise<void> {
  await http.delete(`/door-lock-user/${id}`);
}
