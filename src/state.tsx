import { createContext, useContext, useMemo, useState } from 'react';
import { decodeToken, getStoredToken, login as loginRequest, setStoredToken } from './api';

interface AuthState {
  token: string | null;
  user: Record<string, unknown> | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const value = useMemo<AuthState>(() => ({
    token,
    user: token ? decodeToken(token) : null,
    async login(username: string, password: string) {
      const nextToken = await loginRequest(username, password);
      setStoredToken(nextToken);
      setToken(nextToken);
    },
    logout() {
      setStoredToken(null);
      setToken(null);
    }
  }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside AuthProvider');
  return auth;
}
