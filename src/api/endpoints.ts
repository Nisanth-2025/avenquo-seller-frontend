// Centralized API endpoint paths — matching backend controllers exactly
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP:            '/api/v1/auth/user/signup',
    VERIFY_SIGNUP_OTP:  '/api/v1/auth/user/verify/signup-otp',
    SIGN_IN:            '/api/v1/auth/user/signin',
    VERIFY_SIGNIN_OTP:  '/api/v1/auth/user/verify/signin-otp',
    REFRESH:            '/api/v1/auth/user/refresh',
  },
  LOCATIONS: {
    COUNTRIES:          '/api/v1/locations/countries',
    STATES_BY_COUNTRY:  (countryId: number | string) => `/api/v1/locations/countries/${countryId}/states`,
    DISTRICTS_BY_STATE: (stateId: number | string) => `/api/v1/locations/states/${stateId}/districts`,
  },
  SELLERS: {
    APPLICATION:        '/api/v1/sellers/application',
    APPLICATION_SUBMIT: '/api/v1/sellers/application/submit',
    PROFILE:            '/api/v1/sellers/profile',
    PROFILE_LOGO:       '/api/v1/sellers/profile/logo',
    PROFILE_BANNER:     '/api/v1/sellers/profile/banner',
    TAX:                '/api/v1/sellers/tax',
    TAX_SUBMIT:         '/api/v1/sellers/tax/submit',
    DOCUMENTS:          '/api/v1/sellers/documents',
    DOCUMENTS_SUBMIT:   '/api/v1/sellers/documents/submit',
    BANK:               '/api/v1/sellers/bank-details',
    BANK_SUBMIT:        '/api/v1/sellers/bank-details/submit',
    ADDRESS:            '/api/v1/sellers/address',
  },
} as const;
