// src/api/auth/index.ts
import { http, setAuthToken } from '../httpClient';
import { LoginResponse, ApiLoginResponse, User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // 1. Fazer login e pegar o token
  const { data } = await http.post<ApiLoginResponse>('/auth/login', payload);
  const token = data.access_token;
  
  // 2. Setar o token no http client
  setAuthToken(token);
  
  // 3. Buscar dados do usuário usando o token
  const { data: user } = await http.get<User>('/auth/profile');
  
  return {
    user,
    token,
  };
}
