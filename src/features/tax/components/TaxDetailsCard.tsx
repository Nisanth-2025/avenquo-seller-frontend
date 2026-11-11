import React from 'react';
import { SellerTaxResponseDTO } from '../../../types/tax.types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  ShieldCheck,
  Edit3,
  Send,
  CheckCircle2,
  Building,
  Receipt,
  CreditCard,
  Clock,
  AlertTriangle,
  Lock,
} from 'lucide-react';

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

  const canEdit = status === 'DRAFT' || status === 'REJECTED';
  const canSubmit = status === 'DRAFT' || status === 'REJECTED';

  const renderStatusBadge = () => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge variant="gray" size="sm" dot>
            Draft Saved
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
            Under Review
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Tax Identification Summary</h3>
              {renderStatusBadge()}
            </div>
            <p className="text-xs text-gray-500">Record #{taxDetails.id} · Encrypted at rest</p>
          </div>
        </div>

        {/* Buttons strictly adjusted based on verificationStatus */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit3 className="h-3.5 w-3.5" /> Edit Details
            </Button>
          )}

          {canSubmit && (
            <Button size="sm" variant="primary" loading={isSubmitting} onClick={onSubmit}>
              <Send className="h-3.5 w-3.5" />
              {status === 'REJECTED' ? 'Resubmit for Verification' : 'Submit for Verification'}
            </Button>
          )}

          {!canEdit && !canSubmit && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
              <span>
                {status === 'APPROVED' ? 'Verified (Locked)' : 'Under Review (Locked)'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Context Banner based on status */}
      {status === 'SUBMITTED' && (
        <div className="px-6 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900">
          <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span>Tax identifiers submitted for compliance verification. Modification is temporarily locked.</span>
        </div>
      )}

      {status === 'UNDER_REVIEW' && (
        <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-900">
          <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>Our compliance team is currently reviewing your statutory tax documents.</span>
        </div>
      )}

      {status === 'APPROVED' && (
        <div className="px-6 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Tax details are verified and active for merchant payouts and invoicing.</span>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="px-6 py-3.5 bg-red-50/90 border-b border-red-200 text-xs text-red-950 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span>Tax Compliance Review: Submission Rejected</span>
          </div>
          {taxDetails.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-white/90 p-3 font-mono text-red-900 text-xs leading-relaxed shadow-xs">
              "{taxDetails.rejectionReason}"
            </div>
          )}
          <p className="text-red-800">
            Please click <strong>Edit Details</strong> to adjust the required tax identifiers and resubmit for verification.
          </p>
        </div>
      )}

      {/* Grid of 3 compulsory Tax Identifiers */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PAN Card */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4 space-y-2">
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-gray-400" /> Permanent Account Number (PAN)
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 tracking-wider">
            {taxDetails.maskedPan || `XXXXXX${taxDetails.panLast4}`}
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified ending in {taxDetails.panLast4}
          </p>
        </div>

        {/* GSTIN Card */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-gray-400" /> GST Identification (GSTIN)
            </span>
            <Badge variant={taxDetails.gstRegistered ? 'green' : 'gray'} size="sm">
              {taxDetails.gstRegistered ? 'Registered' : 'Not Registered'}
            </Badge>
          </div>
          <div className="text-base font-bold font-mono text-gray-900 tracking-wide truncate">
            {taxDetails.gstin}
          </div>
          <p className="text-[11px] text-gray-400">
            {taxDetails.gstRegistered ? 'Registered taxpayer' : 'Unregistered / Exempt status'}
          </p>
        </div>

        {/* CIN Card */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4 space-y-2">
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-gray-400" /> Corporate Identity (CIN)
          </div>
          <div className="text-sm font-bold font-mono text-gray-900 tracking-wide truncate">
            {taxDetails.cin}
          </div>
          <p className="text-[11px] text-gray-400">
            MCA 21-character Corporate Registration
          </p>
        </div>
      </div>

      {/* Security Footer */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/20 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> AEAD Encrypted Data Protection
        </span>
        {taxDetails.updatedAt && (
          <span>Last modified: {new Date(taxDetails.updatedAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};
