import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import { API_ENDPOINTS } from './endpoints';
import type { AuthenticationResponseDTO } from '../types/auth.types';

export interface ApiErrorBody {
  message?: string;
  status?: boolean;
  [key: string]: string | boolean | undefined;
}

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const apiAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Mutex / singleton promise to guarantee only one refresh call is in flight
let activeRefreshPromise: Promise<string | null> | null = null;

/**
 * Ensures an active, unexpired JWT access token is available.
 * If expired, automatically rotates the single-use refresh token in the background.
 */
export async function getOrRefreshToken(): Promise<string | null> {
  const currentAccess = tokenStorage.getAccessToken();
  const currentRefresh = tokenStorage.getRefreshToken();

  // If no tokens exist at all, user is not logged in
  if (!currentAccess && !currentRefresh) {
    return null;
  }

  // If accessToken is present and not expired (with 30-second buffer), use it directly
  if (currentAccess && !tokenStorage.isTokenExpired(currentAccess, 30)) {
    return currentAccess;
  }

  // Access token is missing or expired, but we have a refresh token
  if (!currentRefresh) {
    tokenStorage.clearTokens();
    tokenStorage.emitSessionExpired();
    return null;
  }

  // If another request already started refreshing, wait for that same promise
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      // Use raw unintercepted axios to avoid interceptor loop
      const response = await axios.post<AuthenticationResponseDTO>(
        `${baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken: currentRefresh.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newTokens = response.data;
      if (newTokens && newTokens.accessToken) {
        tokenStorage.setTokens(newTokens);
        tokenStorage.emitTokensUpdated(newTokens);
        return newTokens.accessToken;
      }
      throw new Error('Invalid token response from refresh endpoint');
    } catch (err: unknown) {
      // Refresh token has expired or been revoked by server
      tokenStorage.clearTokens();
      tokenStorage.emitSessionExpired();
      throw err;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

// Request Interceptor: Decodes JWT on each request and auto-refreshes if expired
apiAxios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const isAuthEndpoint =
    config.url?.includes('/api/v1/auth/user/signin') ||
    config.url?.includes('/api/v1/auth/user/signup') ||
    config.url?.includes('/api/v1/auth/user/refresh') ||
    config.url?.includes('/api/v1/auth/user/verify');

  if (!isAuthEndpoint) {
    try {
      const validToken = await getOrRefreshToken();
      if (validToken) {
        config.headers.set('Authorization', `Bearer ${validToken}`);
      }
    } catch {
      // If refresh failed (e.g. refresh token expired), continue and let backend 401 handle redirection
    }
  } else {
    // For verify endpoints or other auth routes, attach token if present and not set
    const existingToken = tokenStorage.getAccessToken();
    if (existingToken && !config.headers.get('Authorization')) {
      config.headers.set('Authorization', `Bearer ${existingToken}`);
    }
  }

  // Let browser generate boundary for multipart FormData
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  return config;
});

// Response Interceptor: Handles 401 fallback retry if clock drift caused early expiration
apiAxios.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
      const isRefreshRequest = originalRequest?.url?.includes('/api/v1/auth/user/refresh');

      if (originalRequest && !originalRequest._retry && !isRefreshRequest) {
        originalRequest._retry = true;
        try {
          const freshAccessToken = await getOrRefreshToken();
          if (freshAccessToken) {
            originalRequest.headers.set('Authorization', `Bearer ${freshAccessToken}`);
            return apiAxios(originalRequest);
          }
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

/** Normalize both APIException and Bean-validation error responses */
export function extractApiError(err: unknown): ApiClientError {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorBody | undefined;
    const status = err.response?.status ?? 0;

    if (data) {
      // Bean validation field map: { email: "...", storeSlug: "..." }
      const hasMessage = typeof data.message === 'string';
      if (!hasMessage) {
        const fieldErrors: Record<string, string> = {};
        let first = '';
        for (const [k, v] of Object.entries(data)) {
          if (typeof v === 'string') {
            fieldErrors[k] = v;
            if (!first) first = v;
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          return new ApiClientError(first || 'Validation error', status, fieldErrors);
        }
      }
      // APIException / ResourceNotFound: { message: "...", status: false }
      if (hasMessage && typeof data.message === 'string') {
        return new ApiClientError(data.message, status);
      }
    }
    if (err.code === 'ECONNABORTED') {
      return new ApiClientError('Request timed out. Please try again.', 0);
    }
    return new ApiClientError(err.message || 'Network error', status);
  }
  if (err instanceof Error) return new ApiClientError(err.message, 0);
  return new ApiClientError('An unexpected error occurred', 0);
}
