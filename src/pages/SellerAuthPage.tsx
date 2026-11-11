import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight } from 'lucide-react';

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
  const { loginWithTokens } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const countdown = useOtpCountdown();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
  });

  // ── Step 1: request OTP ───────────────────────────────────────────────────
  const onEmailSubmit = async (data: EmailForm) => {
    setApiError('');
    try {
      if (mode === 'signup') {
        await authService.signUp({ email: data.email });
      } else {
        await authService.signIn({ email: data.email });
      }
      setEmail(data.email.trim().toLowerCase());
      setStep('otp');
      countdown.reset();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors?.email) setError('email', { message: err.fieldErrors.email });
        else setApiError(err.message);
      } else {
        setApiError('Unable to send code. Check your connection.');
      }
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const onVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter all 6 digits'); return; }
    setOtpError('');
    setApiError('');
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await authService.verifySignUpOtp({ email, otp });
        // Per spec: account created, NOT signed in — transition to sign-in
        setSuccessMsg('Account created! Sign in to access your dashboard.');
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
    setMode(m); setStep('email'); setApiError(''); setSuccessMsg(''); setOtp(''); setOtpError('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel (lg+) ── */}
      <div className="w-[48%] xl:w-[45%] flex-shrink-0">
        <AuthLeftPanel />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col min-h-screen bg-white">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 px-6 py-5 lg:hidden border-b border-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-gray-900">Avenquo Seller</span>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-sm">

            {step === 'email' ? (
              <>
                {/* ── Tabs ── */}
                <div className="mb-8">
                  <div className="flex border-b border-gray-200 gap-6">
                    {(['signin', 'signup'] as AuthMode[]).map(m => (
                      <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={[
                          'relative pb-3 text-sm font-medium transition-colors duration-150',
                          mode === m
                            ? 'text-brand-600 tab-active'
                            : 'text-gray-500 hover:text-gray-700',
                        ].join(' ')}
                      >
                        {m === 'signin' ? 'Sign in' : 'Create account'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Heading ── */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {mode === 'signin' ? 'Welcome back' : 'Start selling'}
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-500">
                    {mode === 'signin'
                      ? 'Enter your email and we\'ll send a one-time sign-in code.'
                      : 'Enter your email to create your seller account.'}
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

                {/* ── Email form ── */}
                <form onSubmit={handleSubmit(onEmailSubmit)} noValidate className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@company.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                    {isSubmitting ? '' : (
                      <>{mode === 'signin' ? 'Send sign-in code' : 'Send verification code'} <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </form>

                {mode === 'signup' && (
                  <p className="mt-5 text-xs text-gray-400 leading-relaxed">
                    By creating an account you agree to Avenquo's{' '}
                    <a href="#" className="text-gray-600 underline underline-offset-2">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-gray-600 underline underline-offset-2">Privacy Policy</a>.
                  </p>
                )}
              </>
            ) : (
              <>
                {/* ── OTP Step ── */}
                <div className="mb-7">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                    <Mail className="h-5 w-5 text-brand-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Check your email</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-gray-700">{email}</span>.{' '}
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setOtp(''); setOtpError(''); setApiError(''); }}
                      className="text-brand-600 hover:underline"
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
                    onChange={v => { setOtp(v); if (otpError) setOtpError(''); }}
                    error={otpError}
                    disabled={submitting}
                  />

                  {/* Expiry */}
                  {!countdown.isExpired && (
                    <p className="text-center text-xs text-gray-400">
                      Code expires in{' '}
                      <span className="font-semibold text-gray-700 tabular-nums">{countdown.expiryLabel}</span>
                    </p>
                  )}

                  <Button
                    fullWidth
                    size="lg"
                    onClick={onVerifyOtp}
                    loading={submitting}
                    disabled={otp.length !== 6 || countdown.isExpired}
                  >
                    {submitting ? '' : (mode === 'signup' ? 'Verify & create account' : 'Verify & sign in')}
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
                        Resend in <span className="tabular-nums font-medium text-gray-600">{countdown.cooldownSec}s</span>
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
            <a href="mailto:support@avenquo.com" className="text-gray-600 hover:underline">
              Contact Seller Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerAuthPage;
