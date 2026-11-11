import React from 'react';
import {
  Landmark,
  Building,
  CreditCard,
  User,
  ShieldCheck,
  Edit3,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { BankVerificationStatusBadge } from './BankVerificationStatusBadge';
import type { SellerBankDetailsResponseDTO } from '../../../types/bank.types';

interface BankDetailsCardProps {
  bankDetails: SellerBankDetailsResponseDTO;
  onEdit: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export const BankDetailsCard: React.FC<BankDetailsCardProps> = ({
  bankDetails: b,
  onEdit,
  onSubmit,
  isSubmitting = false,
}) => {
  const status = b.verificationStatus || 'DRAFT';
  const canEdit = status === 'DRAFT' || status === 'REJECTED';
  const canSubmit = status === 'DRAFT' || status === 'REJECTED';
  const isApproved = status === 'APPROVED';
  const isPendingReview = status === 'SUBMITTED' || status === 'UNDER_REVIEW';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{b.bankName}</h3>
              <BankVerificationStatusBadge status={status} />
            </div>
            <p className="text-xs text-gray-500">
              {b.branchName ? `${b.branchName} · ` : ''}Record #{b.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit} className="text-xs">
              <Edit3 className="h-3.5 w-3.5" /> Edit Details
            </Button>
          )}

          {canSubmit && (
            <Button
              size="sm"
              variant="primary"
              onClick={onSubmit}
              loading={isSubmitting}
              className="text-xs shadow-sm bg-brand-600 hover:bg-brand-700"
            >
              <Send className="h-3.5 w-3.5" /> Submit for Review
            </Button>
          )}
        </div>
      </div>

      {/* Rejection Alert */}
      {status === 'REJECTED' && (
        <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-950">Bank Verification Rejected</p>
              <p className="mt-0.5 text-red-800 leading-relaxed">
                {b.rejectionReason ||
                  'The banking verification team requested updates to your payout details. Please review your account holder name and account number.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Holder Name */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Account Holder Name</span>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{b.accountHolderName}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Must match entity registration</p>
          </div>
        </div>

        {/* Bank & Branch */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Bank & Branch</span>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{b.bankName}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{b.branchName || 'Main Branch'}</p>
          </div>
        </div>

        {/* Masked Account Number */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Bank Account Number</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-sm font-semibold text-gray-900 tracking-wider">
                •••• •••• {b.accountNumberLast4}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Encrypted
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Masked for account security</p>
          </div>
        </div>

        {/* IFSC Code */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">IFSC Code</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-sm font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                {b.ifscCode}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">NEFT / RTGS / IMPS clearing enabled</p>
          </div>
        </div>
      </div>

      {/* Verification Status Banner / Footer */}
      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Verified payout destination. Settlements will disburse to this account.
            </span>
          ) : isPendingReview ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-blue-700">
              <Clock className="h-4 w-4 text-blue-600" />
              Under compliance review. Details are locked until verification finishes.
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
              Draft saved. Submit your details to begin compliance verification.
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-gray-400">
          {b.submittedAt && <span>Submitted: {formatDate(b.submittedAt)}</span>}
          {b.reviewedAt && <span>Reviewed: {formatDate(b.reviewedAt)}</span>}
        </div>
      </div>
    </div>
  );
};
