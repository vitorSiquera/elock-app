// src/api/types.ts

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ApiLoginResponse {
  access_token: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface DoorLock {
  id: number;
  name: string;
  localization: string;
  status: string;
}

export interface DoorLockUser {
  id: number;
  userId: number;
  doorLockId: number;
  paper: string;
  status: string;
  sharedBy?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;

  // se a API incluir relações no retorno (include: [User, DoorLock])
  user?: User;
  doorLock?: DoorLock;
}
