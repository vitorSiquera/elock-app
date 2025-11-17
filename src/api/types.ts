// src/api/types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  // ajustamos de acordo com schema depois
}

export interface ApiLoginResponse {
  access_token: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export type DoorLockStatus = 'locked' | 'unlocked';

export interface DoorLock {
  id: string;
  name: string;
  location: string;
  status: DoorLockStatus;
}

export interface DoorLockUser {
  id: string;
  userId: string;
  doorLockId: string;
}
