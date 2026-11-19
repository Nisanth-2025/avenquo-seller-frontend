import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { KeyRound, MonitorSmartphone } from 'lucide-react';
import { ApiClientError } from '../api/client';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { AccountWorkspace } from '../features/account/components/AccountWorkspace';
import { useAuth } from '../features/auth/hooks/useAuth';
import { authService } from '../features/auth/services/authService';
import type { AuthSessionDTO } from '../types/auth.types';

type PasswordAction = 'set' | 'change';

function isStrongPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    value.length <= 72 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value) &&
    !/\s/.test(value)
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export const SellerSecurityPage: React.FC = () => {
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
      setSessionError(
        error instanceof ApiClientError ? error.message : 'Could not revoke this session.'
      );
    },
  });

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!isStrongPassword(newPassword)) {
      setPasswordError(
        'Use 8–72 characters with uppercase and lowercase letters, a number, and a special character. Spaces are not allowed.'
      );
      return;
    }
    if (!confirmPassword.trim() || newPassword !== confirmPassword) {
      setPasswordError('The passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const payload = { newPassword, confirmPassword };
      const message =
        action === 'set'
          ? await authService.setPassword(payload)
          : await authService.changePassword(payload);
      if (action === 'change') {
        logout({ revokeSession: false });
        navigate('/auth', {
          replace: true,
          state: {
            notice: `${
              message || 'Password changed successfully'
            } Sign in again with your new password.`,
          },
        });
        return;
      }
      setPasswordSuccess(
        message || 'Password set successfully. You can now sign in with your password.'
      );
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to update your password. Please try again.'
      );
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const sessions = sessionsQuery.data;

  return (
    <AccountWorkspace title="Security & sessions">
      {/* Password Management Card */}
      <section className="space-y-5 rounded-2xl bg-[#f6f7f9] p-5 sm:p-6" aria-labelledby="password-heading">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 id="password-heading" className="text-sm font-semibold text-gray-900">
                Password authentication
              </h2>
              <p className="text-xs text-gray-500">
                Set a password for direct sign-in, or update your existing password.
              </p>
            </div>
          </div>
        </div>

        {/* Action Toggle Pills */}
        <div className="flex w-fit gap-1 rounded-xl bg-white p-1 text-xs font-medium text-gray-600 shadow-xs" role="group" aria-label="Password action">
          <button
            type="button"
            onClick={() => {
              setAction('set');
              setPasswordError('');
              setPasswordSuccess('');
            }}
            aria-pressed={action === 'set'}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              action === 'set' ? 'bg-[#f6f7f9] font-semibold text-gray-900' : 'hover:text-gray-900'
            }`}
          >
            Set password
          </button>
          <button
            type="button"
            onClick={() => {
              setAction('change');
              setPasswordError('');
              setPasswordSuccess('');
            }}
            aria-pressed={action === 'change'}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              action === 'change' ? 'bg-[#f6f7f9] font-semibold text-gray-900' : 'hover:text-gray-900'
            }`}
          >
            Change password
          </button>
        </div>

        {passwordError && (
          <Alert variant="error" message={passwordError} onClose={() => setPasswordError('')} />
        )}
        {passwordSuccess && (
          <Alert variant="success" message={passwordSuccess} onClose={() => setPasswordSuccess('')} />
        )}

        <form onSubmit={submitPassword} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
              maxLength={72}
              placeholder="••••••••••••"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-input transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
            <p className="text-xs text-gray-400">
              8–72 characters, uppercase and lowercase letters, a number, and a special character. No spaces.
              {action === 'change' ? ' Your new password must differ from your current password.' : ''}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              maxLength={72}
              placeholder="••••••••••••"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-input transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
          </div>

          <div className="pt-2">
            <Button size="sm" type="submit" loading={passwordSubmitting}>
              {action === 'set' ? 'Set password' : 'Change password'}
            </Button>
          </div>
        </form>
      </section>

      {/* Sessions Management Card */}
      <section className="space-y-5 rounded-2xl bg-[#f6f7f9] p-5 sm:p-6" aria-labelledby="sessions-heading">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <MonitorSmartphone className="h-4 w-4" />
            </div>
            <div>
              <h2 id="sessions-heading" className="text-sm font-semibold text-gray-900">
                Active sign-in sessions
              </h2>
              <p className="text-xs text-gray-500">
                Review logged-in devices and revoke refresh-token sessions you no longer recognize.
              </p>
            </div>
          </div>
        </div>

        {sessionError && (
          <Alert variant="error" message={sessionError} onClose={() => setSessionError('')} />
        )}

        {sessionsQuery.isPending ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading sessions…</p>
        ) : sessionsQuery.isError ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {sessionsQuery.error instanceof ApiClientError
              ? sessionsQuery.error.message
              : 'Could not load sessions.'}
          </div>
        ) : sessions?.content.length ? (
          <>
            <div className="overflow-x-auto rounded-xl bg-white border border-gray-100 shadow-xs">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                    <th scope="col" className="py-3 px-4">Device</th>
                    <th scope="col" className="py-3 px-4">Created</th>
                    <th scope="col" className="py-3 px-4">Expires</th>
                    <th scope="col" className="py-3 px-4">Status</th>
                    <th scope="col" className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {sessions.content.map((session: AuthSessionDTO) => (
                    <tr key={session.sessionId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="max-w-[220px] py-3.5 px-4 font-medium text-gray-900">
                        <span className="block truncate" title={session.deviceInfo || 'Unknown device'}>
                          {session.deviceInfo || 'Unknown device'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3.5 px-4 text-xs text-gray-500">
                        {formatDate(session.createdAt)}
                      </td>
                      <td className="whitespace-nowrap py-3.5 px-4 text-xs text-gray-500">
                        {formatDate(session.expiresAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            session.revokedAt
                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              session.revokedAt ? 'bg-gray-400' : 'bg-emerald-500'
                            }`}
                          />
                          {session.revokedAt ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {session.revokedAt ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <button
                            type="button"
                            disabled={revokeMutation.isPending}
                            onClick={() => {
                              if (
                                window.confirm(
                                  'Revoke this session? It will no longer be able to refresh its access token.'
                                )
                              )
                                revokeMutation.mutate(session.sessionId);
                            }}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                {sessions.totalElements} session{sessions.totalElements === 1 ? '' : 's'} · Page{' '}
                {sessions.pageNumber + 1} of {Math.max(sessions.totalPages, 1)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 0 || sessionsQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={sessions.lastPage || sessionsQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
            No session records found.
          </p>
        )}
      </section>
    </AccountWorkspace>
  );
};

export default SellerSecurityPage;
