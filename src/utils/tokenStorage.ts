import type { AuthenticationResponseDTO, DecodedTokenPayload } from '../types/auth.types';

const ACCESS_KEY  = 'avq_access';
const REFRESH_KEY = 'avq_refresh';

type TokenListener = (tokens: AuthenticationResponseDTO) => void;
type SessionExpiredListener = () => void;

const tokenListeners = new Set<TokenListener>();
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens(tokens: AuthenticationResponseDTO): void {
    if (tokens.accessToken) {
      localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    }
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  /**
   * Safely decodes JWT payload with base64 padding and UTF-8 decoding
   */
  decodeToken(token: string | null): DecodedTokenPayload | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json) as DecodedTokenPayload;
    } catch {
      return null;
    }
  },

  /**
   * Checks if token is expired or will expire within `bufferSeconds`
   * Backend JWT tokens contain `exp` as unix timestamp in seconds.
   */
  isTokenExpired(token: string | null, bufferSeconds = 30): boolean {
    if (!token) return true;
    const decoded = this.decodeToken(token);
    if (!decoded || typeof decoded.exp !== 'number') return true;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return decoded.exp <= (nowInSeconds + bufferSeconds);
  },

  /**
   * Event listeners for background token lifecycle changes
   */
  onTokensUpdated(listener: TokenListener): () => void {
    tokenListeners.add(listener);
    return () => {
      tokenListeners.delete(listener);
    };
  },

  onSessionExpired(listener: SessionExpiredListener): () => void {
    sessionExpiredListeners.add(listener);
    return () => {
      sessionExpiredListeners.delete(listener);
    };
  },

  emitTokensUpdated(tokens: AuthenticationResponseDTO): void {
    tokenListeners.forEach((fn) => {
      try {
        fn(tokens);
      } catch (err) {
        console.error('Error in token update listener', err);
      }
    });
  },

  emitSessionExpired(): void {
    sessionExpiredListeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in session expired listener', err);
      }
    });
  },
};
