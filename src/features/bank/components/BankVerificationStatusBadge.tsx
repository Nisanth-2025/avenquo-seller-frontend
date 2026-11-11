import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import type { SellerBankVerificationStatus } from '../../../types/bank.types';

interface BankVerificationStatusBadgeProps {
  status?: SellerBankVerificationStatus;
  size?: 'sm' | 'md';
}

export const BankVerificationStatusBadge: React.FC<BankVerificationStatusBadgeProps> = ({
  status = 'DRAFT',
  size = 'sm',
}) => {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge variant="green" size={size} dot>
          Verified & Active
        </Badge>
      );
    case 'SUBMITTED':
      return (
        <Badge variant="blue" size={size} dot>
          Submitted
        </Badge>
      );
    case 'UNDER_REVIEW':
      return (
        <Badge variant="amber" size={size} dot>
          Under Review
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="red" size={size} dot>
          Action Required
        </Badge>
      );
    case 'DRAFT':
    default:
      return (
        <Badge variant="gray" size={size} dot>
          Draft Saved
        </Badge>
      );
  }
};
