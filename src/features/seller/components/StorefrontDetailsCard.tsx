import React from 'react';
import {
  Store,
  Building2,
  Mail,
  Globe,
  User,
  Edit3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import type { SellerProfileResponseDTO } from '../../../types/seller.types';

interface StorefrontDetailsCardProps {
  application: SellerProfileResponseDTO;
  onEdit?: () => void;
  isEditable?: boolean;
}

export const StorefrontDetailsCard: React.FC<StorefrontDetailsCardProps> = ({
  application: a,
  onEdit,
  isEditable = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{a.storeName}</h3>
          <ApplicationStatusBadge status={a.status} size="sm" />
          {a.status === 'APPROVED' && (
            <span title="Verified Merchant">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditable && onEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit3 className="h-3.5 w-3.5" /> Edit details
            </Button>
          )}
        </div>
      </div>

      {/* Grid of detail cards matching Tax, Bank and Address */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Storefront Identity */}
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <Store className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Storefront handle</p>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-semibold tracking-wide text-gray-900">
            <span>avenquo.com/store/{a.storeSlug}</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </div>
        </div>

        {/* Legal Registered Entity */}
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <Building2 className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Legal entity</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {a.legalName}{' '}
            <span className="text-xs font-normal text-gray-500">({a.businessType})</span>
          </p>
        </div>

        {/* Customer Support Contact */}
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <Mail className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Support email & phone</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{a.supportEmail}</p>
          <p className="mt-0.5 text-xs text-gray-500 font-mono">{a.supportPhone}</p>
        </div>

        {/* Authorized Representative */}
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <User className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Representative</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{a.contactPersonName}</p>
          <p className="mt-0.5 text-xs text-gray-500 font-mono">{a.contactPersonPhone}</p>
        </div>
      </div>

      {/* Website & Description if provided */}
      {(a.website || a.description) && (
        <div className="rounded-2xl bg-[#f6f7f9] p-4 space-y-2">
          {a.website && (
            <div className="flex items-center gap-2 text-xs text-brand-600">
              <Globe className="h-3.5 w-3.5 text-gray-400" />
              <a
                href={a.website}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <span>{a.website}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          {a.description && (
            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              {a.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
