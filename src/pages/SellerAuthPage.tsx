import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight, LockKeyhole, Store } from 'lucide-react';

import { AuthLeftPanel } from '../features/auth/components/AuthLeftPanel';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { OtpInput } from '../components/ui/OtpInput';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useOtpCountdown } from '../features/auth/hooks/useOtpCountdown';
import { authService } from '../features/auth/services/authService';
import { ApiClientError } from '../api/client';
import type { AuthMode, AuthStep } from '../types/auth.types';

// ── Zod schemas ──────────────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email must not exceed 254 characters'),
});
type EmailForm = z.infer<typeof emailSchema>;

// ── Main page ────────────────────────────────────────────────────────────────
const SellerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithTokens } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState(() => {
    const state = location.state as { notice?: string } | null;
    return state?.notice ?? '';
  });
  const [submitting, setSubmitting] = useState(false);

  const countdown = useOtpCountdown();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
  });

  // ── Step 1: request OTP or login with password ─────────────────────────────
  const onEmailSubmit = async (data: EmailForm) => {
    setApiError('');
    setPasswordError('');
    if (mode === 'signin' && loginMethod === 'password' && !password) {
      setPasswordError('Password is required');
      return;
    }
    try {
      if (mode === 'signup') {
        await authService.signUp({ email: data.email });
      } else if (loginMethod === 'password') {
        const tokens = await authService.passwordLogin({ email: data.email, password });
        loginWithTokens(tokens);
        navigate('/dashboard', { replace: true });
        return;
      } else {
        await authService.signIn({ email: data.email });
      }
      setEmail(data.email.trim().toLowerCase());
      setStep('otp');
      countdown.reset();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors?.email) setError('email', { message: err.fieldErrors.email });
        else if (err.fieldErrors?.password) setPasswordError(err.fieldErrors.password);
        else setApiError(err.message);
      } else {
        setApiError('Unable to process request. Check your connection.');
      }
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Enter all 6 digits');
      return;
    }
    setOtpError('');
    setApiError('');
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await authService.verifySignUpOtp({ email, otp });
        // Per spec: account created, NOT signed in — transition to sign-in
        setSuccessMsg('Account created successfully! Sign in to access your seller dashboard.');
        setMode('signin');
        setStep('email');
        setOtp('');
      } else {
        const tokens = await authService.verifySignInOtp({ email, otp });
        loginWithTokens(tokens);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors?.otp) setOtpError(err.fieldErrors.otp);
        else setApiError(err.message);
      } else {
        setApiError('Verification failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const onResend = async () => {
    if (!countdown.canResend) return;
    setApiError('');
    setSuccessMsg('');
    try {
      if (mode === 'signup') await authService.signUp({ email });
      else await authService.signIn({ email });
      countdown.reset();
      setOtp('');
      setOtpError('');
      setSuccessMsg('A new code has been sent to your email.');
    } catch (err) {
      if (err instanceof ApiClientError) setApiError(err.message);
      else setApiError('Could not resend. Please try again.');
    }
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setStep('email');
    setApiError('');
    setSuccessMsg('');
    setOtp('');
    setOtpError('');
    setPassword('');
    setPasswordError('');
    clearErrors('email');
    if (m === 'signup') setLoginMethod('otp');
  };

  const switchLoginMethod = (method: 'otp' | 'password') => {
    setLoginMethod(method);
    clearErrors('email');
    setApiError('');
    setPassword('');
    setPasswordError('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left brand panel (lg+) ── */}
      <div className="w-[48%] xl:w-[45%] flex-shrink-0">
        <AuthLeftPanel />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col min-h-screen bg-white">
        {/* Mobile Header Logo */}
        <div className="flex items-center gap-2 px-6 py-5 lg:hidden border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 block leading-tight">Avenquo</span>
            <span className="text-[11px] font-medium text-gray-500 block">Seller Portal</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-sm">

            {step === 'email' ? (
              <>
                {/* ── Main Auth Mode Tabs (Sign In / Create Account) ── */}
                <div className="mb-6 flex rounded-xl bg-[#f6f7f9] p-1 text-xs font-medium text-gray-600">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all ${
                      mode === 'signin'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all ${
                      mode === 'signup'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* ── Sign-in Method Switcher (Email Code vs Password) ── */}
                {mode === 'signin' && (
                  <div
                    className="mb-6 flex rounded-xl bg-[#f6f7f9] p-1 text-xs font-medium text-gray-600"
                    role="group"
                    aria-label="Sign-in method"
                  >
                    <button
                      type="button"
                      onClick={() => switchLoginMethod('otp')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                        loginMethod === 'otp'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      aria-pressed={loginMethod === 'otp'}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email Code
                    </button>
                    <button
                      type="button"
                      onClick={() => switchLoginMethod('password')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                        loginMethod === 'password'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      aria-pressed={loginMethod === 'password'}
                    >
                      <LockKeyhole className="h-3.5 w-3.5" />
                      Password
                    </button>
                  </div>
                )}

                {/* ── Heading ── */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    {mode === 'signin' ? 'Welcome back' : 'Start selling on Avenquo'}
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-500">
                    {mode === 'signin'
                      ? loginMethod === 'password'
                        ? 'Sign in using your password linked to your seller account.'
                        : 'Enter your registered email to receive a one-time sign-in code.'
                      : 'Enter your business email to register your seller account.'}
                  </p>
                </div>

                {successMsg && (
                  <div className="mb-5">
                    <Alert variant="success" message={successMsg} onClose={() => setSuccessMsg('')} />
                  </div>
                )}
                {apiError && (
                  <div className="mb-5">
                    <Alert variant="error" message={apiError} onClose={() => setApiError('')} />
                  </div>
                )}

                {/* ── Form ── */}
                <form onSubmit={handleSubmit(onEmailSubmit)} noValidate className="space-y-4">
                  <Input
                    label="Business Email Address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="seller@company.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  {mode === 'signin' && loginMethod === 'password' && (
                    <div className="space-y-1.5">
                      <Input
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setPasswordError('');
                        }}
                        error={passwordError}
                      />
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => switchLoginMethod('otp')}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          Forgot password? Sign in with email code
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                      {isSubmitting ? (
                        ''
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {mode === 'signin'
                            ? loginMethod === 'password'
                              ? 'Sign In to Dashboard'
                              : 'Send Sign-in Code'
                            : 'Send Verification Code'}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>

                {mode === 'signup' && (
                  <p className="mt-5 text-xs text-gray-400 leading-relaxed text-center">
                    By registering an account you agree to Avenquo's{' '}
                    <a href="#" className="text-gray-600 font-medium underline underline-offset-2">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-gray-600 font-medium underline underline-offset-2">
                      Seller Privacy Policy
                    </a>.
                  </p>
                )}
              </>
            ) : (
              <>
                {/* ── OTP Step ── */}
                <div className="mb-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">Check your email</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold text-gray-800">{email}</span>.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                        setOtpError('');
                        setApiError('');
                      }}
                      className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      Change email
                    </button>
                  </p>
                </div>

                {apiError && (
                  <div className="mb-5">
                    <Alert variant="error" message={apiError} onClose={() => setApiError('')} />
                  </div>
                )}
                {successMsg && (
                  <div className="mb-5">
                    <Alert variant="success" message={successMsg} onClose={() => setSuccessMsg('')} />
                  </div>
                )}
                {countdown.isExpired && !apiError && (
                  <div className="mb-5">
                    <Alert variant="info" message="Your code has expired. Request a new one below." />
                  </div>
                )}

                <div className="space-y-5">
                  <OtpInput
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      if (otpError) setOtpError('');
                    }}
                    error={otpError}
                    disabled={submitting}
                  />

                  {/* Expiry indicator */}
                  {!countdown.isExpired && (
                    <p className="text-center text-xs text-gray-400">
                      Code expires in{' '}
                      <span className="font-semibold text-gray-700 tabular-nums">
                        {countdown.expiryLabel}
                      </span>
                    </p>
                  )}

                  <Button
                    fullWidth
                    size="lg"
                    onClick={onVerifyOtp}
                    loading={submitting}
                    disabled={otp.length !== 6 || countdown.isExpired}
                  >
                    {submitting ? (
                      ''
                    ) : mode === 'signup' ? (
                      'Verify & Create Account'
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  {/* Resend */}
                  <p className="text-center text-sm text-gray-500">
                    Didn't receive it?{' '}
                    {countdown.canResend ? (
                      <button
                        type="button"
                        onClick={onResend}
                        className="font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                      >
                        Resend code
                      </button>
                    ) : (
                      <span className="text-gray-400">
                        Resend in{' '}
                        <span className="tabular-nums font-semibold text-gray-600">
                          {countdown.cooldownSec}s
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-center text-xs text-gray-400">
            Need help?{' '}
            <a
              href="mailto:support@avenquo.com"
              className="font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors"
            >
              Contact Seller Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerAuthPage;
