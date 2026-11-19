import React from 'react';
import { Edit3, MapPin, Phone, User } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { SellerAddressResponseDTO } from '../../../types/address.types';

interface SellerAddressCardProps {
  address: SellerAddressResponseDTO;
  onEdit: () => void;
}

export const SellerAddressCard: React.FC<SellerAddressCardProps> = ({ address: a, onEdit }) => {
  const street = [a.addressLine1, a.addressLine2].filter(Boolean).join(', ');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="secondary" onClick={onEdit}>
          <Edit3 className="h-3.5 w-3.5" /> Edit
        </Button>
      </div>

      <div className="rounded-2xl bg-[#f6f7f9] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{street}</p>
            {a.landmark && <p className="mt-1 text-sm text-gray-500">{a.landmark}</p>}
            <p className="mt-2 text-sm text-gray-700">
              {a.city}, {a.district}
            </p>
            <p className="text-sm text-gray-700">
              {a.state} {a.postalCode}
            </p>
            <p className="text-sm text-gray-500">{a.country || 'India'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <User className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Contact</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{a.contactPersonName}</p>
        </div>
        <div className="rounded-2xl bg-[#f6f7f9] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <Phone className="h-4 w-4" />
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">Phone</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{a.contactPhone}</p>
        </div>
      </div>
    </div>
  );
};
