import type { AuthenticationResponseDTO, DecodedTokenPayload } from '../types/auth.types';

const ACCESS_KEY  = 'avq_access';
const REFRESH_KEY = 'avq_refresh';

export const tokenStorage = {
  getAccessToken():  string | null { return localStorage.getItem(ACCESS_KEY);  },
  getRefreshToken(): string | null { return localStorage.getItem(REFRESH_KEY); },

  setTokens(tokens: AuthenticationResponseDTO): void {
    localStorage.setItem(ACCESS_KEY,  tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  decodeToken(token: string): DecodedTokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;
      const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(
        json.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      )) as DecodedTokenPayload;
    } catch { return null; }
  },
};
