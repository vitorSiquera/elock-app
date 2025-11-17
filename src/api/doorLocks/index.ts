// src/api/doorLocks/index.ts
import { http } from '../httpClient';
import { DoorLock } from '../types';

export async function getDoorLocks(): Promise<DoorLock[]> {
  const { data } = await http.get<DoorLock[]>('/door-locks');
  return data;
}
