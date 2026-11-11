/**
 * Seller Tax Details Types
 * Exactly matching backend SellerTaxRequestDTO, SellerTaxResponseDTO, and SellerTaxUpdateRequestDTO
 */

export type SellerTaxVerificationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface SellerTaxRequestDTO {
  pan: string;
  gstRegistered: boolean;
  gstin: string; // 15-character GSTIN
  cin: string;   // 21-character CIN
}

export interface SellerTaxUpdateRequestDTO {
  pan?: string;
  gstRegistered?: boolean;
  gstin?: string;
  cin?: string;
}

export interface SellerTaxResponseDTO {
  id: number | string;
  maskedPan: string;
  panLast4: string;
  gstin: string;
  gstRegistered: boolean;
  rejectionReason?: string | null;
  cin: string;
  verificationStatus?: SellerTaxVerificationStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
