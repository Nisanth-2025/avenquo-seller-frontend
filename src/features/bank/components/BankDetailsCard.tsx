import React from 'react';
import { Building, CreditCard, Edit3, Landmark, Send, User } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { BankVerificationStatusBadge } from './BankVerificationStatusBadge';
import type { SellerBankDetailsResponseDTO } from '../../../types/bank.types';

interface BankDetailsCardProps {
  bankDetails: SellerBankDetailsResponseDTO;
  onEdit: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{b.bankName}</h3>
          <BankVerificationStatusBadge status={status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {canSubmit && (
            <Button size="sm" variant="primary" onClick={onSubmit} loading={isSubmitting}>
              <Send className="h-3.5 w-3.5" /> Submit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <User className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Account holder</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{b.accountHolderName}</p>
        </div>

        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <Building className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Branch</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{b.branchName || '—'}</p>
        </div>

        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <CreditCard className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Account number</p>
          <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-gray-900">
            •••• {b.accountNumberLast4}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <Landmark className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">IFSC</p>
          <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-gray-900">{b.ifscCode}</p>
        </div>
      </div>
    </div>
  );
};
