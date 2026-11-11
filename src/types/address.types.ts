/**
 * Location and Seller Address Types
 * Exactly matching backend LocationController and SellerAddressController DTOs
 */

export interface CountryResponseDTO {
  countryId: number;
  name: string;
  iso2Code: string;
  iso3Code: string;
  phoneCode: string;
}

export interface StateResponseDTO {
  stateId: number;
  name: string;
  lgdCode: string;
  stateOrUt: string;
  countryId: number;
}

export interface DistrictResponseDTO {
  districtId: number;
  name: string;
  lgdCode: string;
  stateId: number;
}

export interface SellerAddressRequestDTO {
  contactPersonName: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country?: string | null;
}

export interface SellerAddressResponseDTO {
  id: number;
  contactPersonName: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string | null;
}
