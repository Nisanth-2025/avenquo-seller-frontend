// Centralized API endpoint paths — matching AuthController exactly
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP:            '/api/v1/auth/user/signup',
    VERIFY_SIGNUP_OTP:  '/api/v1/auth/user/verify/signup-otp',
    SIGN_IN:            '/api/v1/auth/user/signin',
    VERIFY_SIGNIN_OTP:  '/api/v1/auth/user/verify/signin-otp',
    REFRESH:            '/api/v1/auth/user/refresh',
  },
} as const;
