export type DocumentType =
  | 'PAN'
  | 'GST_CERTIFICATE'
  | 'CIN_CERTIFICATE'
  | 'BUSINESS_REGISTRATION'
  | 'ADDRESS_PROOF'
  | 'OTHER';

export type DocumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

export interface SellerDocumentResponseDTO {
  id: number;
  documentType: DocumentType;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  status: DocumentStatus;
  rejectionReason: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
}

export interface SellerDocumentViewResponseDTO extends SellerDocumentResponseDTO {
  signedUrl: string;
  expiresAt: string;
}

export interface DocumentTypeMeta {
  type: DocumentType;
  label: string;
  shortDescription: string;
  badge: 'Required' | 'Recommended' | 'Optional';
  acceptedFormats: string;
}

export const DOCUMENT_TYPE_METAS: Record<DocumentType, DocumentTypeMeta> = {
  PAN: {
    type: 'PAN',
    label: 'PAN Card',
    shortDescription: 'Permanent Account Number of business or primary proprietor',
    badge: 'Required',
    acceptedFormats: 'PDF, JPG, PNG',
  },
  GST_CERTIFICATE: {
    type: 'GST_CERTIFICATE',
    label: 'GST Certificate',
    shortDescription: 'Form GST REG-06 registration document with seal',
    badge: 'Required',
    acceptedFormats: 'PDF, JPG, PNG',
  },
  CIN_CERTIFICATE: {
    type: 'CIN_CERTIFICATE',
    label: 'Certificate of Incorporation',
    shortDescription: 'MCA corporate incorporation certificate for Pvt Ltd / LLP',
    badge: 'Optional',
    acceptedFormats: 'PDF, JPG, PNG',
  },
  BUSINESS_REGISTRATION: {
    type: 'BUSINESS_REGISTRATION',
    label: 'Business Registration Proof',
    shortDescription: 'MSME/Udyam registration, Shop & Establishment, or trade license',
    badge: 'Recommended',
    acceptedFormats: 'PDF, JPG, PNG',
  },
  ADDRESS_PROOF: {
    type: 'ADDRESS_PROOF',
    label: 'Registered Business Address Proof',
    shortDescription: 'Recent utility bill (under 3 mos), lease agreement, or property tax bill',
    badge: 'Required',
    acceptedFormats: 'PDF, JPG, PNG',
  },
  OTHER: {
    type: 'OTHER',
    label: 'Additional Statutory Document',
    shortDescription: 'Power of attorney, authorization letter, or other compliance files',
    badge: 'Optional',
    acceptedFormats: 'PDF, JPG, PNG',
  },
};
