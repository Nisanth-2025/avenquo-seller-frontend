// Centralized API endpoint paths — matching backend controllers exactly
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP:            '/api/v1/auth/user/signup',
    VERIFY_SIGNUP_OTP:  '/api/v1/auth/user/verify/signup-otp',
    SIGN_IN:            '/api/v1/auth/user/signin',
    VERIFY_SIGNIN_OTP:  '/api/v1/auth/user/verify/signin-otp',
    REFRESH:            '/api/v1/auth/user/refresh',
  },
  SELLERS: {
    APPLICATION:        '/api/v1/sellers/application',
    APPLICATION_SUBMIT: '/api/v1/sellers/application/submit',
    PROFILE:            '/api/v1/sellers/profile',
    PROFILE_LOGO:       '/api/v1/sellers/profile/logo',
    PROFILE_BANNER:     '/api/v1/sellers/profile/banner',
    TAX:                '/api/v1/sellers/tax',
    TAX_SUBMIT:         '/api/v1/sellers/tax/submit',
  },
} as const;
