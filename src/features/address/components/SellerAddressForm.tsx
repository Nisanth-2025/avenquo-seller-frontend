import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  MapPin,
  Building,
  User,
  Compass,
  Save,
} from 'lucide-react';
import { useLocationCatalog } from '../hooks/useSellerAddress';
import { ApiClientError } from '../../../api/client';
import type {
  SellerAddressRequestDTO,
  SellerAddressResponseDTO,
} from '../../../types/address.types';

const nameRegex = /^[a-zA-Z][a-zA-Z\s.'\-/&,()]*$/;
const phone10Regex = /^[1-9][0-9]{9}$/;
const pinRegex = /^[1-9][0-9]{5}$/;

const addressSchema = z.object({
  contactPersonName: z
    .string()
    .trim()
    .min(1, 'Contact person name is required')
    .max(100, 'Contact person name cannot exceed 100 characters')
    .regex(nameRegex, 'Must start with a letter and contain valid name characters'),
  contactPhone10: z
    .string()
    .trim()
    .regex(phone10Regex, 'Enter a valid 10-digit Indian phone number (without +91)'),
  addressLine1: z
    .string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 cannot exceed 255 characters'),
  addressLine2: z
    .string()
    .trim()
    .max(255, 'Address line 2 cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  landmark: z
    .string()
    .trim()
    .max(100, 'Landmark cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(25, 'City cannot exceed 25 characters'),
  postalCode: z
    .string()
    .trim()
    .regex(pinRegex, 'Enter a valid 6-digit Indian PIN code (e.g. 400001)'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface SellerAddressFormProps {
  initialData?: SellerAddressResponseDTO | null;
  onSave: (
    dto: SellerAddressRequestDTO,
    countryId: number,
    stateId: number,
    districtId: number
  ) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export const SellerAddressForm: React.FC<SellerAddressFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isLoading,
}) => {
  const isEditing = Boolean(initialData);
  const [apiError, setApiError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  const {
    countries,
    states,
    districts,
    isLoadingCountries,
    isLoadingStates,
    isLoadingDistricts,
  } = useLocationCatalog(selectedCountryId, selectedStateId);

  // Extract initial 10-digit phone
  const getInitialPhone10 = (phone?: string) => {
    if (!phone) return '';
    return phone.startsWith('+91') ? phone.slice(3) : phone;
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      contactPersonName: initialData?.contactPersonName || '',
      contactPhone10: getInitialPhone10(initialData?.contactPhone),
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      landmark: initialData?.landmark || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
    },
  });

  // Pre-fill or default Country to India
  useEffect(() => {
    if (countries.length > 0 && selectedCountryId === null) {
      if (initialData?.country) {
        const found = countries.find(
          (c) => c.name.toLowerCase() === initialData.country.toLowerCase()
        );
        if (found) {
          setSelectedCountryId(found.countryId);
          return;
        }
      }
      // Default to India
      const india = countries.find(
        (c) => c.name.toLowerCase() === 'india' || c.iso2Code === 'IN'
      );
      if (india) {
        setSelectedCountryId(india.countryId);
      } else {
        setSelectedCountryId(countries[0].countryId);
      }
    }
  }, [countries, initialData, selectedCountryId]);

  // Match State from initialData
  useEffect(() => {
    if (states.length > 0 && initialData?.state && selectedStateId === null) {
      const found = states.find(
        (s) => s.name.toLowerCase() === initialData.state.toLowerCase()
      );
      if (found) {
        setSelectedStateId(found.stateId);
      }
    }
  }, [states, initialData, selectedStateId]);

  // Match District from initialData
  useEffect(() => {
    if (districts.length > 0 && initialData?.district && selectedDistrictId === null) {
      const found = districts.find(
        (d) => d.name.toLowerCase() === initialData.district.toLowerCase()
      );
      if (found) {
        setSelectedDistrictId(found.districtId);
      }
    }
  }, [districts, initialData, selectedDistrictId]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedCountryId(val || null);
    setSelectedStateId(null);
    setSelectedDistrictId(null);
    setLocationError(null);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedStateId(val || null);
    setSelectedDistrictId(null);
    setLocationError(null);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedDistrictId(val || null);
    setLocationError(null);
  };

  const onSubmitForm = async (formData: AddressFormData) => {
    setApiError(null);
    setLocationError(null);

    if (!selectedCountryId) {
      setLocationError('Please select a country.');
      return;
    }
    if (!selectedStateId) {
      setLocationError('Please select a state.');
      return;
    }
    if (!selectedDistrictId) {
      setLocationError('Please select a district.');
      return;
    }

    const currentCountry = countries.find((c) => c.countryId === selectedCountryId);
    const currentState = states.find((s) => s.stateId === selectedStateId);
    const currentDistrict = districts.find((d) => d.districtId === selectedDistrictId);

    if (!currentState || !currentDistrict) {
      setLocationError('Invalid state or district selection.');
      return;
    }

    const requestDTO: SellerAddressRequestDTO = {
      contactPersonName: formData.contactPersonName.trim(),
      contactPhone: `+91${formData.contactPhone10.trim()}`,
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2?.trim() ? formData.addressLine2.trim() : null,
      landmark: formData.landmark?.trim() ? formData.landmark.trim() : null,
      city: formData.city.trim(),
      district: currentDistrict.name,
      state: currentState.name,
      postalCode: formData.postalCode.trim(),
      country: currentCountry?.name || 'India',
    };

    try {
      await onSave(
        requestDTO,
        selectedCountryId,
        selectedStateId,
        selectedDistrictId
      );
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            if (
              field === 'contactPersonName' ||
              field === 'addressLine1' ||
              field === 'addressLine2' ||
              field === 'landmark' ||
              field === 'city' ||
              field === 'postalCode'
            ) {
              setError(field as keyof AddressFormData, {
                type: 'server',
                message: msg,
              });
            } else if (field === 'contactPhone') {
              setError('contactPhone10', {
                type: 'server',
                message: msg,
              });
            } else if (field === 'state' || field === 'district') {
              setLocationError(msg);
            }
          });
        }
        setApiError(err.message || 'Validation failed. Please check the address fields.');
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred while saving address.');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {isEditing ? 'Update Business Address' : 'Register Principal Business Address'}
            </h3>
            <p className="text-xs text-gray-500">
              Official address used for GST compliance, tax invoicing, and logistics pickup.
            </p>
          </div>
        </div>

        {onCancel && (
          <Button size="sm" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
        {/* Error Alert */}
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
        )}
        {locationError && (
          <Alert variant="error" message={locationError} onClose={() => setLocationError(null)} />
        )}

        {/* Section 1: Contact Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-gray-500" /> Primary Contact Representative
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact Person Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('contactPersonName')}
                placeholder="e.g. Asha Kumar"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                  errors.contactPersonName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              {errors.contactPersonName && (
                <p className="mt-1 text-xs text-red-600">{errors.contactPersonName.message}</p>
              )}
            </div>

            {/* Contact Phone (+91 fixed) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm font-semibold text-gray-600 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  {...register('contactPhone10')}
                  placeholder="9876543210"
                  className={`w-full rounded-r-lg border px-3.5 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:ring-1 ${
                    errors.contactPhone10
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                  }`}
                />
              </div>
              {errors.contactPhone10 && (
                <p className="mt-1 text-xs text-red-600">{errors.contactPhone10.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Street Address */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building className="h-3.5 w-3.5 text-gray-500" /> Premises & Street Address
          </h4>

          <div className="space-y-4">
            {/* Address Line 1 */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('addressLine1')}
                placeholder="Building Name, Shop/Flat No., Street / Road Name"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                  errors.addressLine1
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-xs text-red-600">{errors.addressLine1.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Address Line 2 */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Address Line 2 <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  {...register('addressLine2')}
                  placeholder="Suite, Floor, Industrial Area"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                    errors.addressLine2
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                  }`}
                />
                {errors.addressLine2 && (
                  <p className="mt-1 text-xs text-red-600">{errors.addressLine2.message}</p>
                )}
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Landmark <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  {...register('landmark')}
                  placeholder="e.g. Near Central Metro Station"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                    errors.landmark
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                  }`}
                />
                {errors.landmark && (
                  <p className="mt-1 text-xs text-red-600">{errors.landmark.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Geographic Location & Postal Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-gray-500" /> Jurisdiction & Postal Location
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* Country Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCountryId || ''}
                onChange={handleCountryChange}
                disabled={isLoadingCountries || countries.length === 0}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                {countries.map((c) => (
                  <option key={c.countryId} value={c.countryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                State / UT <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStateId || ''}
                onChange={handleStateChange}
                disabled={!selectedCountryId || isLoadingStates}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-gray-100"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.stateId} value={s.stateId}>
                    {s.name}
                  </option>
                ))}
              </select>
              {isLoadingStates && (
                <p className="mt-1 text-[11px] text-gray-400">Loading states…</p>
              )}
            </div>

            {/* District Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDistrictId || ''}
                onChange={handleDistrictChange}
                disabled={!selectedStateId || isLoadingDistricts}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-gray-100"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.districtId} value={d.districtId}>
                    {d.name}
                  </option>
                ))}
              </select>
              {isLoadingDistricts && (
                <p className="mt-1 text-[11px] text-gray-400">Loading districts…</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={25}
                {...register('city')}
                placeholder="e.g. Mumbai (max 25)"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                  errors.city
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                {...register('postalCode')}
                placeholder="e.g. 400001"
                className={`w-full font-mono rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 tracking-wider focus:outline-none focus:ring-1 ${
                  errors.postalCode
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isLoading}
            disabled={isLoading || !selectedCountryId || !selectedStateId || !selectedDistrictId}
            className="text-xs shadow-sm bg-brand-600 hover:bg-brand-700"
          >
            <Save className="h-3.5 w-3.5" /> {isEditing ? 'Update Business Address' : 'Save Business Address'}
          </Button>
        </div>
      </form>
    </div>
  );
};
