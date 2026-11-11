import React from 'react';
import { ProductStatus } from '../../../types/product.types';
import { Badge } from '../../../components/ui/Badge';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  size?: 'sm' | 'md';
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  if (status === 'ACTIVE') {
    return (
      <Badge variant="green" size={size} dot>
        ACTIVE
      </Badge>
    );
  }

  return (
    <Badge variant="gray" size={size} dot>
      INACTIVE
    </Badge>
  );
};
