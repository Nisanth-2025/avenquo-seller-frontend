/**
 * Seller Application and Storefront Profile Types
 * Exactly matching seller-application-profile-api.md
 */

export type BusinessType =
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'PRIVATE_LIMITED'
  | 'PUBLIC_LIMITED'
  | 'LLP'
  | 'OTHER';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export interface CreateSellerApplicationDTO {
  storeName: string;
  storeSlug: string;
  legalName: string;
  businessType: BusinessType;
  description?: string;
  supportEmail: string;
  supportPhone: string;
  website?: string;
  contactPersonName: string;
  contactPersonPhone: string;
}

export type UpdateSellerApplicationDTO = CreateSellerApplicationDTO;

export interface PatchSellerProfileDTO {
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
  website?: string;
}

export interface SellerProfileResponseDTO {
  id: number | string;
  storeName: string;
  storeSlug: string;
  legalName: string;
  businessType: BusinessType;
  description?: string | null;
  supportEmail: string;
  supportPhone: string;
  website?: string | null;
  contactPersonName: string;
  contactPersonPhone: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  status: ApplicationStatus;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string; desc: string }[] = [
  {
    value: 'SOLE_PROPRIETORSHIP',
    label: 'Sole Proprietorship',
    desc: 'Individual owner carrying out business in their personal capacity',
  },
  {
    value: 'PARTNERSHIP',
    label: 'Partnership Firm',
    desc: 'Two or more individuals operating under a partnership deed',
  },
  {
    value: 'PRIVATE_LIMITED',
    label: 'Private Limited (Pvt Ltd)',
    desc: 'Privately held legal corporate entity with limited liability',
  },
  {
    value: 'PUBLIC_LIMITED',
    label: 'Public Limited Company',
    desc: 'Corporation that sells shares to the public',
  },
  {
    value: 'LLP',
    label: 'Limited Liability Partnership (LLP)',
    desc: 'Partnership with separate legal status and limited partner liability',
  },
  {
    value: 'OTHER',
    label: 'Other Business Entity',
    desc: 'Trust, Society, Non-Profit, or other government recognized structure',
  },
];
