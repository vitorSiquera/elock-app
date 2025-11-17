// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import { User, LoginResponse } from '../api/types';
import { login as loginRequest } from '../api/auth';
import { setAuthToken } from '../api/httpClient';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<LoginResponse>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    try {
      setLoading(true);

      const response = await loginRequest({ email, password });

      setUser(response.user);
      setToken(response.token);
      setAuthToken(response.token); // injeta no axios

      return response;
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setUser(null);
    setToken(null);
    setAuthToken(); // limpa token no axios
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
