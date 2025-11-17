// src/api/httpClient.ts
import axios from 'axios';

let authToken: string | null = null;

export function setAuthToken(token?: string) {
  authToken = token ?? null;
}

export const http = axios.create({
  baseURL: 'http://192.168.12.5:8000', 
});

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${authToken}`,
    };
  }

  return config;
});
