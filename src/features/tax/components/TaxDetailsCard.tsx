import React from 'react';
import { SellerTaxResponseDTO } from '../../../types/tax.types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, Edit3, Send, CheckCircle2, Building, Receipt, CreditCard } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
      {/* Top Header */}
      <div className="px-6 py-4.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Tax Identification Summary</h3>
              <Badge variant="green" size="sm" dot>
                Active
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Record #{taxDetails.id} · Encrypted at rest</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button size="sm" variant="primary" loading={isSubmitting} onClick={onSubmit}>
            <Send className="h-3.5 w-3.5" /> Submit for Verification
          </Button>
        </div>
      </div>

      {/* Grid of 3 key Tax Identifiers */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PAN Card */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-gray-400" /> Permanent Account Number (PAN)
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 tracking-wider">
            {taxDetails.maskedPan || `XXXXXX${taxDetails.panLast4}`}
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Ending in {taxDetails.panLast4}
          </p>
        </div>

        {/* GSTIN Card */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-gray-400" /> GST Registration (GSTIN)
            </span>
            <Badge variant={taxDetails.gstRegistered ? 'green' : 'gray'} size="sm">
              {taxDetails.gstRegistered ? 'Registered' : 'Not Registered'}
            </Badge>
          </div>
          <div className="text-base font-bold font-mono text-gray-900 tracking-wide truncate">
            {taxDetails.gstin ? taxDetails.gstin : 'Not Applicable'}
          </div>
          <p className="text-[11px] text-gray-400">
            {taxDetails.gstRegistered ? 'Active GST compliance' : 'Threshold exemption declared'}
          </p>
        </div>

        {/* CIN Card */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-gray-400" /> Corporate ID (CIN)
            </span>
            <Badge variant={taxDetails.cin ? 'blue' : 'gray'} size="sm">
              {taxDetails.cin ? 'Incorporated' : 'Unincorporated'}
            </Badge>
          </div>
          <div className="text-sm font-bold font-mono text-gray-900 tracking-wide truncate">
            {taxDetails.cin ? taxDetails.cin : 'Not Applicable'}
          </div>
          <p className="text-[11px] text-gray-400">
            {taxDetails.cin ? 'MCA registered corporate entity' : 'Proprietorship or partnership'}
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
