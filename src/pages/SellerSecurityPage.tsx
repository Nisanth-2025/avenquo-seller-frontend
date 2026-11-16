import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { ApiClientError } from '../api/client';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { SellerHeader } from '../components/navigation/SellerHeader';
import { useAuth } from '../features/auth/hooks/useAuth';
import { authService } from '../features/auth/services/authService';
import type { AuthSessionDTO } from '../types/auth.types';

type PasswordAction = 'set' | 'change';

function isStrongPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 72 &&
    /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value) && !/\s/.test(value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const SellerSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [action, setAction] = useState<PasswordAction>('set');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [sessionError, setSessionError] = useState('');

  const sessionsQuery = useQuery({
    queryKey: ['auth-sessions', page],
    queryFn: () => authService.listSessions(page, 10),
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: number) => authService.revokeSession(sessionId),
    onSuccess: async () => {
      setSessionError('');
      await queryClient.invalidateQueries({ queryKey: ['auth-sessions'] });
    },
    onError: (error) => {
      setSessionError(error instanceof ApiClientError ? error.message : 'Could not revoke this session.');
    },
  });

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!isStrongPassword(newPassword)) {
      setPasswordError('Use 8–72 characters with uppercase and lowercase letters, a number, and a special character. Spaces are not allowed.');
      return;
    }
    if (!confirmPassword.trim() || newPassword !== confirmPassword) {
      setPasswordError('The passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const payload = { newPassword, confirmPassword };
      const message = action === 'set'
        ? await authService.setPassword(payload)
        : await authService.changePassword(payload);
      if (action === 'change') {
        logout({ revokeSession: false });
        navigate('/auth', {
          replace: true,
          state: { notice: `${message || 'Password changed successfully'} Sign in again with your new password.` },
        });
        return;
      }
      setPasswordSuccess(message || 'Password set successfully. You can now sign in with your password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof ApiClientError ? error.message : 'Unable to update your password. Please try again.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const sessions = sessionsQuery.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader activeTab="account" />
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-900">Security & sessions</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-brand-700">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Account security</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Password & sessions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage how you sign in and review refresh-token sessions for your account.</p>
        </div>

        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="password-heading">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><KeyRound className="h-5 w-5" /></div>
            <div>
              <h2 id="password-heading" className="text-base font-semibold text-gray-900">Password</h2>
              <p className="mt-1 text-sm text-gray-500">Set a password for faster sign-in, or change your existing one.</p>
            </div>
          </div>

          <div className="mb-5 flex max-w-sm rounded-lg bg-gray-100 p-1" role="group" aria-label="Password action">
            <button type="button" onClick={() => { setAction('set'); setPasswordError(''); setPasswordSuccess(''); }} aria-pressed={action === 'set'} className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${action === 'set' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Set password</button>
            <button type="button" onClick={() => { setAction('change'); setPasswordError(''); setPasswordSuccess(''); }} aria-pressed={action === 'change'} className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${action === 'change' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Change password</button>
          </div>

          {passwordError && <div className="mb-4"><Alert variant="error" message={passwordError} onClose={() => setPasswordError('')} /></div>}
          {passwordSuccess && <div className="mb-4"><Alert variant="success" message={passwordSuccess} onClose={() => setPasswordSuccess('')} /></div>}

          <form onSubmit={submitPassword} className="max-w-md">
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} maxLength={72} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            <p className="mt-1.5 text-xs text-gray-500">8–72 characters, uppercase and lowercase letters, a number, and a special character. No spaces.{action === 'change' ? ' Your new password must differ from your current password.' : ''}</p>
            <label htmlFor="confirm-password" className="mb-1.5 mt-4 block text-sm font-medium text-gray-700">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required maxLength={72} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            <div className="mt-5">
              <Button type="submit" loading={passwordSubmitting}>{action === 'set' ? 'Set password' : 'Change password'}</Button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="sessions-heading">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><MonitorSmartphone className="h-5 w-5" /></div>
            <div>
              <h2 id="sessions-heading" className="text-base font-semibold text-gray-900">Sign-in sessions</h2>
              <p className="mt-1 text-sm text-gray-500">Review session devices and revoke tokens you no longer use. Revocation prevents refresh; an existing access token may remain valid until it expires.</p>
            </div>
          </div>

          {sessionError && <div className="mb-4"><Alert variant="error" message={sessionError} onClose={() => setSessionError('')} /></div>}
          {sessionsQuery.isPending ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading sessions…</p>
          ) : sessionsQuery.isError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{sessionsQuery.error instanceof ApiClientError ? sessionsQuery.error.message : 'Could not load sessions.'}</div>
          ) : sessions?.content.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead><tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500"><th scope="col" className="pb-3 pr-4 font-medium">Device</th><th scope="col" className="pb-3 pr-4 font-medium">Created</th><th scope="col" className="pb-3 pr-4 font-medium">Expires</th><th scope="col" className="pb-3 pr-4 font-medium">Status</th><th scope="col" className="pb-3 text-right font-medium">Action</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">{sessions.content.map((session: AuthSessionDTO) => (
                    <tr key={session.sessionId}>
                      <td className="max-w-[220px] py-4 pr-4 text-gray-700"><span className="block truncate" title={session.deviceInfo || 'Unknown device'}>{session.deviceInfo || 'Unknown device'}</span></td>
                      <td className="whitespace-nowrap py-4 pr-4 text-gray-500">{formatDate(session.createdAt)}</td>
                      <td className="whitespace-nowrap py-4 pr-4 text-gray-500">{formatDate(session.expiresAt)}</td>
                      <td className="py-4 pr-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${session.revokedAt ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>{session.revokedAt ? 'Revoked' : 'Unrevoked'}</span></td>
                      <td className="py-4 text-right">{session.revokedAt ? <span className="text-xs text-gray-400">—</span> : <button type="button" disabled={revokeMutation.isPending} onClick={() => { if (window.confirm('Revoke this session? It will no longer be able to refresh its access token.')) revokeMutation.mutate(session.sessionId); }} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Revoke</button>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500">{sessions.totalElements} session{sessions.totalElements === 1 ? '' : 's'} · Page {sessions.pageNumber + 1} of {Math.max(sessions.totalPages, 1)}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page <= 0 || sessionsQuery.isFetching} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</Button>
                  <Button variant="secondary" size="sm" disabled={sessions.lastPage || sessionsQuery.isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">The API does not identify which session is the current device.</p>
            </>
          ) : (
            <p className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">No session records found.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default SellerSecurityPage;
