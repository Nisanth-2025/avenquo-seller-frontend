import React from 'react';
import {
  MapPin,
  Building,
  User,
  Phone,
  Edit3,
  CheckCircle2,
  Navigation,
  Compass,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { SellerAddressResponseDTO } from '../../../types/address.types';

interface SellerAddressCardProps {
  address: SellerAddressResponseDTO;
  onEdit: () => void;
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

export const SellerAddressCard: React.FC<SellerAddressCardProps> = ({ address: a, onEdit }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">Registered Business Address</h3>
              <Badge variant="green" size="sm" dot>
                Verified Location
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Record #{a.id} · Official Principal Place of Business</p>
          </div>
        </div>

        <Button size="sm" variant="secondary" onClick={onEdit} className="text-xs">
          <Edit3 className="h-3.5 w-3.5" /> Edit Address
        </Button>
      </div>

      {/* Main Details Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Person & Phone */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Primary Contact Person</span>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{a.contactPersonName}</p>
            <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{a.contactPhone}</span>
            </p>
          </div>
        </div>

        {/* City & PIN */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">City & Postal Code</span>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {a.city}, PIN: {a.postalCode}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              District: <span className="font-medium text-gray-900">{a.district}</span>
            </p>
          </div>
        </div>

        {/* Street Address */}
        <div className="flex items-start gap-3.5 md:col-span-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <Building className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">Street & Premises Address</span>
            <p className="text-sm font-medium text-gray-900 leading-relaxed">
              {a.addressLine1}
              {a.addressLine2 ? `, ${a.addressLine2}` : ''}
            </p>
            {a.landmark && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Compass className="h-3 w-3 text-gray-400" />
                <span>Landmark: {a.landmark}</span>
              </p>
            )}
          </div>
        </div>

        {/* State & Country */}
        <div className="flex items-start gap-3.5 md:col-span-2 border-t border-gray-100 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Jurisdiction & Country</span>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {a.state}, {a.country || 'India'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Registered operational base for courier dispatch and delivery manifests
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Default address for tax invoices, fulfillment pickups, and return routing.
        </span>

        <div className="flex items-center gap-4 text-[11px] text-gray-400">
          {a.createdAt && <span>Created: {formatDate(a.createdAt)}</span>}
          {a.updatedAt && <span>Updated: {formatDate(a.updatedAt)}</span>}
        </div>
      </div>
    </div>
  );
};
