import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthenticationResponseDTO, AuthUser } from '../types/auth.types';
import { tokenStorage } from '../utils/tokenStorage';
import { authService } from '../features/auth/services/authService';

export interface AuthContextType {
  user:            AuthUser | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  loginWithTokens: (tokens: AuthenticationResponseDTO) => void;
  logout:          () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,            setUser]            = useState<AuthUser | null>(null);
  const [accessToken,     setAccessToken]     = useState<string | null>(null);
  const [refreshToken,    setRefreshToken]    = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading,       setIsLoading]       = useState(true);

  const applyTokens = useCallback((tokens: AuthenticationResponseDTO) => {
    tokenStorage.setTokens(tokens);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setIsAuthenticated(true);

    const decoded = tokenStorage.decodeToken(tokens.accessToken);
    if (decoded) {
      const rawRoles = decoded.roles ?? [];
      setUser({
        email:  decoded.sub,
        userId: decoded.userId,
        roles:  Array.isArray(rawRoles) ? rawRoles : [rawRoles],
      });
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null); setAccessToken(null); setRefreshToken(null); setIsAuthenticated(false);
  }, []);

  // Auto-restore session on app boot via refresh token
  useEffect(() => {
    let alive = true;
    (async () => {
      const rt = tokenStorage.getRefreshToken();
      if (rt) {
        try {
          const tokens = await authService.refreshToken({ refreshToken: rt });
          if (alive) applyTokens(tokens);
        } catch { if (alive) logout(); }
      }
      if (alive) setIsLoading(false);
    })();
    return () => { alive = false; };
  }, [applyTokens, logout]);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isAuthenticated, isLoading, loginWithTokens: applyTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
