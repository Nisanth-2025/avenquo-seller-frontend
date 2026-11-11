import axios, { AxiosError } from 'axios';

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
  timeout: 15000,
});

/** Normalize both APIException and Bean-validation error responses */
export function extractApiError(err: unknown): ApiClientError {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorBody | undefined;
    const status = err.response?.status ?? 0;

    if (data) {
      // Bean validation field map: { email: "...", otp: "..." }
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
      // APIException: { message: "...", status: false }
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
