/**
 * Seller Tax Details Types
 * Exactly matching backend SellerTaxRequestDTO, SellerTaxResponseDTO, and SellerTaxUpdateRequestDTO
 */

export interface SellerTaxRequestDTO {
  pan: string;
  gstRegistered: boolean;
  gstin: string; // 15-character GSTIN or "" if exempt/unregistered
  cin: string;   // 21-character CIN or "" if not incorporated
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
  cin: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
