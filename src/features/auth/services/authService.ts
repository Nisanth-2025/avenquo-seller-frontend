import axios from 'axios';
import { apiAxios, extractApiError, rotateRefreshToken } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  AuthSessionsPageDTO,
  AuthenticationResponseDTO,
  LogoutRequestDTO,
  PasswordLoginRequestDTO,
  PasswordRequestDTO,
  RefreshTokenRequestDTO,
  SignInRequestDTO,
  SignUpRequestDTO,
  VerifyOtpRequestDTO,
} from '../../../types/auth.types';

export const authService = {
  async signUp(dto: SignUpRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SIGN_UP, {
        email: dto.email.trim().toLowerCase(),
      });
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async verifySignUpOtp(dto: VerifyOtpRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(API_ENDPOINTS.AUTH.VERIFY_SIGNUP_OTP, {
        email: dto.email.trim().toLowerCase(), otp: dto.otp.trim(),
      });
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async signIn(dto: SignInRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SIGN_IN, {
        email: dto.email.trim().toLowerCase(),
      });
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async verifySignInOtp(dto: VerifyOtpRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const { data } = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.VERIFY_SIGNIN_OTP,
        { email: dto.email.trim().toLowerCase(), otp: dto.otp.trim() },
      );
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async passwordLogin(dto: PasswordLoginRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const { data } = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.PASSWORD_LOGIN,
        { email: dto.email.trim().toLowerCase(), password: dto.password },
      );
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async setPassword(dto: PasswordRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SET_PASSWORD, dto);
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async changePassword(dto: PasswordRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.put<string>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, dto);
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async logout(dto: LogoutRequestDTO, accessToken: string): Promise<string> {
    try {
      const baseUrl = apiAxios.defaults.baseURL || '';
      const { data } = await axios.post<string>(API_ENDPOINTS.AUTH.LOGOUT, dto, {
        baseURL: baseUrl,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        timeout: 20000,
      });
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async listSessions(page = 0, size = 10): Promise<AuthSessionsPageDTO> {
    try {
      const { data } = await apiAxios.get<AuthSessionsPageDTO>(API_ENDPOINTS.AUTH.SESSIONS, {
        params: { page, size },
      });
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async revokeSession(sessionId: number): Promise<string> {
    try {
      const { data } = await apiAxios.delete<string>(API_ENDPOINTS.AUTH.SESSION_BY_ID(sessionId));
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async refreshToken(dto: RefreshTokenRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      return await rotateRefreshToken(dto.refreshToken);
    } catch (err) { throw extractApiError(err); }
  },
};
