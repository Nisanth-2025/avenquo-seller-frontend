/**
 * Seller Bank Details Types
 * Exactly matching backend SellerBankDetailsRequestDTO, SellerBankDetailsResponseDTO, and SellerBankVerificationStatus
 */

export type SellerBankVerificationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface SellerBankDetailsRequestDTO {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string | null;
}

export interface SellerBankDetailsResponseDTO {
  id: number;
  accountHolderName: string;
  maskedAccountNumber: string;
  accountNumberLast4: string;
  ifscCode: string;
  bankName: string;
  branchName: string | null;
  verificationStatus: SellerBankVerificationStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}
