import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  AuthenticationResponseDTO,
  RefreshTokenRequestDTO,
  SignInRequestDTO,
  SignUpRequestDTO,
  VerifyOtpRequestDTO,
} from '../../../types/auth.types';

export const authService = {
  async signUp(dto: SignUpRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(
        API_ENDPOINTS.AUTH.SIGN_UP,
        { email: dto.email.trim().toLowerCase() }
      );
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async verifySignUpOtp(dto: VerifyOtpRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(
        API_ENDPOINTS.AUTH.VERIFY_SIGNUP_OTP,
        { email: dto.email.trim().toLowerCase(), otp: dto.otp.trim() }
      );
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async signIn(dto: SignInRequestDTO): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(
        API_ENDPOINTS.AUTH.SIGN_IN,
        { email: dto.email.trim().toLowerCase() }
      );
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async verifySignInOtp(dto: VerifyOtpRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const { data } = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.VERIFY_SIGNIN_OTP,
        { email: dto.email.trim().toLowerCase(), otp: dto.otp.trim() }
      );
      return data;
    } catch (err) { throw extractApiError(err); }
  },

  async refreshToken(dto: RefreshTokenRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const { data } = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken: dto.refreshToken.trim() }
      );
      return data;
    } catch (err) { throw extractApiError(err); }
  },
};
