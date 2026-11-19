import React from 'react';
import { SellerTaxResponseDTO } from '../../../types/tax.types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { AlertTriangle, Building, CreditCard, Edit3, Lock, Receipt, Send } from 'lucide-react';

interface TaxDetailsCardProps {
  taxDetails: SellerTaxResponseDTO;
  onEdit: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export const TaxDetailsCard: React.FC<TaxDetailsCardProps> = ({
  taxDetails,
  onEdit,
  onSubmit,
  isSubmitting,
}) => {
  const status = taxDetails.verificationStatus || 'DRAFT';
  const canEdit = status === 'DRAFT';
  const canSubmit = status === 'DRAFT' || status === 'REJECTED';

  const renderStatusBadge = () => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge variant="gray" size="sm" dot>
            Draft
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="blue" size="sm" dot>
            Submitted
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="amber" size="sm" dot>
            Under review
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="green" size="sm" dot>
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="red" size="sm" dot>
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="gray" size="sm">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">{renderStatusBadge()}</div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {canSubmit && (
            <Button size="sm" variant="primary" loading={isSubmitting} onClick={onSubmit}>
              <Send className="h-3.5 w-3.5" />
              {status === 'REJECTED' ? 'Resubmit' : 'Submit'}
            </Button>
          )}
          {!canEdit && !canSubmit && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
              <Lock className="h-3.5 w-3.5" />
              {status === 'APPROVED' ? 'Verified' : 'Locked'}
            </span>
          )}
        </div>
      </div>

      {status === 'REJECTED' && taxDetails.rejectionReason && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{taxDetails.rejectionReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <CreditCard className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">PAN</p>
          <p className="mt-1 font-mono text-base font-semibold tracking-wide text-gray-900">
            {taxDetails.maskedPan || `XXXXXX${taxDetails.panLast4}`}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <Receipt className="h-4 w-4" />
            </div>
            <Badge variant={taxDetails.gstRegistered ? 'green' : 'gray'} size="sm">
              {taxDetails.gstRegistered ? 'Registered' : 'Not registered'}
            </Badge>
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">GSTIN</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold tracking-wide text-gray-900">
            {taxDetails.gstin}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <Building className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">CIN</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold tracking-wide text-gray-900">
            {taxDetails.cin}
          </p>
        </div>
      </div>
    </div>
  );
};
