import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import type { DocumentStatus } from '../../../types/document.types';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md';
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge variant="green" size={size} dot>
          Approved
        </Badge>
      );
    case 'SUBMITTED':
      return (
        <Badge variant="blue" size={size} dot>
          Submitted
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="red" size={size} dot>
          Rejected
        </Badge>
      );
    case 'DRAFT':
    default:
      return (
        <Badge variant="gray" size={size} dot>
          Draft
        </Badge>
      );
  }
};
