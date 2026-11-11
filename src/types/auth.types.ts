// Strict TypeScript types aligned to Avenquo backend DTOs

export interface SignUpRequestDTO   { email: string }
export interface SignInRequestDTO   { email: string }
export interface VerifyOtpRequestDTO { email: string; otp: string }
export interface RefreshTokenRequestDTO { refreshToken: string }

export interface AuthenticationResponseDTO {
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;
}

export interface ApiErrorResponse {
  message: string;
  status:  boolean;
}

export interface DecodedTokenPayload {
  sub:    string;
  userId?: string | number;
  roles?:  string[] | string;
  iat?:    number;
  exp?:    number;
}

export interface AuthUser {
  email:   string;
  userId?: string | number;
  roles:   string[];
}

export type AuthMode = 'signin' | 'signup';
export type AuthStep = 'email' | 'otp';
