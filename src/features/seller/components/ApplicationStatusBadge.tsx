import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { ApplicationStatus } from '../../../types/seller.types';
import { Clock, CheckCircle2, AlertTriangle, XCircle, FileEdit, Eye } from 'lucide-react';

interface ApplicationStatusBadgeProps {
  status?: ApplicationStatus;
  size?: 'sm' | 'md';
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status = 'DRAFT',
  size = 'md',
}) => {
  switch (status) {
    case 'DRAFT':
      return (
        <Badge variant="gray" size={size} dot>
          <FileEdit className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Draft
        </Badge>
      );
    case 'SUBMITTED':
      return (
        <Badge variant="blue" size={size} dot>
          <Clock className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Submitted
        </Badge>
      );
    case 'UNDER_REVIEW':
      return (
        <Badge variant="amber" size={size} dot>
          <Eye className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Under Review
        </Badge>
      );
    case 'CHANGES_REQUIRED':
      return (
        <Badge variant="amber" size={size} dot>
          <AlertTriangle className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Changes Required
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge variant="green" size={size} dot>
          <CheckCircle2 className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="red" size={size} dot>
          <XCircle className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="gray" size={size}>
          {status}
        </Badge>
      );
  }
};
