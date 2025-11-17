// src/api/users/index.ts
import { http } from '../httpClient';
import { User } from '../types';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await http.post<User>('/users', payload);
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await http.get<User[]>('/users');
  return data;
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await http.get<User>(`/users/${id}`);
  return data;
}
