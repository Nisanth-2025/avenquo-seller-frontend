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
  refreshSession:  () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronously initialize state from existing tokens in localStorage
  const [accessToken, setAccessToken] = useState<string | null>(() => tokenStorage.getAccessToken());
  const [refreshToken, setRefreshToken] = useState<string | null>(() => tokenStorage.getRefreshToken());

  const [user, setUser] = useState<AuthUser | null>(() => {
    const at = tokenStorage.getAccessToken();
    if (at) {
      const decoded = tokenStorage.decodeToken(at);
      if (decoded && !tokenStorage.isTokenExpired(at, 0)) {
        const rawRoles = decoded.roles ?? [];
        return {
          email:  decoded.sub,
          userId: decoded.userId,
          roles:  Array.isArray(rawRoles) ? rawRoles : [rawRoles],
        };
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const at = tokenStorage.getAccessToken();
    // If valid unexpired access token exists, authenticate immediately without waiting
    return Boolean(at && !tokenStorage.isTokenExpired(at, 0));
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const at = tokenStorage.getAccessToken();
    const rt = tokenStorage.getRefreshToken();
    // If we have a valid access token, no loading spinner is needed on page refresh
    if (at && !tokenStorage.isTokenExpired(at, 0)) {
      return false;
    }
    // If access token is expired or absent, but we have a refresh token, we must wait for refresh
    if (rt) {
      return true;
    }
    // No credentials at all
    return false;
  });

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
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const rt = tokenStorage.getRefreshToken();
    if (!rt) {
      logout();
      return false;
    }
    try {
      const newTokens = await authService.refreshToken({ refreshToken: rt });
      applyTokens(newTokens);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [applyTokens, logout]);

  // Subscribe to background token rotation and session expiration events from Axios interceptor
  useEffect(() => {
    const unsubTokens = tokenStorage.onTokensUpdated((tokens) => {
      applyTokens(tokens);
    });

    const unsubExpired = tokenStorage.onSessionExpired(() => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    });

    return () => {
      unsubTokens();
      unsubExpired();
    };
  }, [applyTokens]);

  // Handle initial boot if access token was already expired but refresh token exists
  useEffect(() => {
    let alive = true;
    const at = tokenStorage.getAccessToken();
    const rt = tokenStorage.getRefreshToken();

    // If access token is already valid, do not burn the single-use refresh token on page load!
    if (at && !tokenStorage.isTokenExpired(at, 0)) {
      setIsLoading(false);
      return;
    }

    // Access token expired, but refresh token exists: attempt background refresh
    if (rt) {
      (async () => {
        try {
          const tokens = await authService.refreshToken({ refreshToken: rt });
          if (alive) {
            applyTokens(tokens);
            setIsLoading(false);
          }
        } catch {
          if (alive) {
            // Only if the refresh token is expired or rejected do we clear tokens and redirect to sign in
            logout();
            setIsLoading(false);
          }
        }
      })();
    } else {
      setIsLoading(false);
    }

    return () => {
      alive = false;
    };
  }, [applyTokens, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isLoading,
        loginWithTokens: applyTokens,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
