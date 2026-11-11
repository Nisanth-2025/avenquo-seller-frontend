import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { SellerTaxRequestDTO, SellerTaxResponseDTO, SellerTaxUpdateRequestDTO } from '../../../types/tax.types';
import { ApiClientError } from '../../../api/client';
import { ShieldCheck, Check, CreditCard, Receipt, Building2, Send, Save, AlertTriangle } from 'lucide-react';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const cinRegex = /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

const makeTaxSchema = (isEditing: boolean) =>
  z.object({
    pan: z
      .string()
      .trim()
      .toUpperCase()
      .superRefine((val, ctx) => {
        if (!isEditing && (!val || !panRegex.test(val))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be a valid 10-character Indian PAN (e.g. ABCDE1234F)',
          });
        }
        if (isEditing && val && !panRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be a valid 10-character Indian PAN (e.g. ABCDE1234F)',
          });
        }
      }),
    gstRegistered: z.boolean(),
    gstin: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, 'GSTIN is compulsory')
      .regex(gstinRegex, 'Must be a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)'),
    cin: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, 'CIN is compulsory')
      .regex(cinRegex, 'Must be a valid 21-character CIN (e.g. U12345MH2020PTC123456)'),
  });

type TaxFormData = {
  pan: string;
  gstRegistered: boolean;
  gstin: string;
  cin: string;
};

interface TaxDetailsFormProps {
  initialData?: SellerTaxResponseDTO | null;
  onSaveDraft: (data: SellerTaxRequestDTO | SellerTaxUpdateRequestDTO) => Promise<void>;
  onSubmitVerification?: (data: SellerTaxRequestDTO | SellerTaxUpdateRequestDTO) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
  isSubmitting?: boolean;
}

export const TaxDetailsForm: React.FC<TaxDetailsFormProps> = ({
  initialData,
  onSaveDraft,
  onSubmitVerification,
  onCancel,
  isLoading,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(makeTaxSchema(isEditing)),
    defaultValues: {
      pan: '',
      gstRegistered: initialData?.gstRegistered ?? true,
      gstin: initialData?.gstin || '',
      cin: initialData?.cin || '',
    },
    mode: 'onTouched',
  });

  // Fetch and populate exact data from database when initialData loads or changes
  useEffect(() => {
    if (initialData) {
      reset({
        pan: '', // Keep blank so placeholder instructs user: leave blank to retain existing
        gstRegistered: initialData.gstRegistered ?? true,
        gstin: initialData.gstin || '',
        cin: initialData.cin || '',
      });
    }
  }, [initialData, reset]);

  const watchedGstRegistered = watch('gstRegistered');

  const preparePayload = (data: TaxFormData) => {
    if (isEditing) {
      const updatePayload: SellerTaxUpdateRequestDTO = {
        gstRegistered: data.gstRegistered,
        gstin: data.gstin.trim().toUpperCase(),
        cin: data.cin.trim().toUpperCase(),
      };
      if (data.pan && data.pan.trim().length > 0) {
        updatePayload.pan = data.pan.trim().toUpperCase();
      }
      return updatePayload;
    } else {
      const createPayload: SellerTaxRequestDTO = {
        pan: data.pan.trim().toUpperCase(),
        gstRegistered: data.gstRegistered,
        gstin: data.gstin.trim().toUpperCase(),
        cin: data.cin.trim().toUpperCase(),
      };
      return createPayload;
    }
  };

  const handleDraftSubmit = async (data: TaxFormData) => {
    setApiError(null);
    try {
      const payload = preparePayload(data);
      await onSaveDraft(payload);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            setError(field as keyof TaxFormData, { message: msg });
          });
        }
        setApiError(err.message);
      } else {
        setApiError('Failed to save tax details. Please try again.');
      }
    }
  };

  const handleFinalSubmit = async (data: TaxFormData) => {
    if (!onSubmitVerification) return;
    setApiError(null);
    try {
      const payload = preparePayload(data);
      await onSubmitVerification(payload);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            setError(field as keyof TaxFormData, { message: msg });
          });
        }
        setApiError(err.message);
      } else {
        setApiError('Failed to submit tax details.');
      }
    }
  };

  return (
    <form className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-6" noValidate>
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      {initialData?.verificationStatus === 'REJECTED' && initialData.rejectionReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-950 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span>Reason for Previous Rejection:</span>
          </div>
          <div className="rounded-lg border border-red-200 bg-white/90 p-2.5 font-mono text-red-900 leading-relaxed shadow-xs">
            "{initialData.rejectionReason}"
          </div>
          <p className="text-red-800">
            Please update the affected identifiers below and click <strong>Save & Resubmit</strong>.
          </p>
        </div>
      )}

      {/* Form Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {isEditing ? 'Edit Tax Compliance Records' : 'Register Tax Identifiers'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            All 3 statutory identifiers (PAN, GSTIN, and CIN) are compulsory.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> AEAD Encrypted
        </span>
      </div>

      {/* Field 1: Permanent Account Number (PAN) - Compulsory */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Permanent Account Number (PAN) *
          </label>
          {isEditing && initialData?.panLast4 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
              Saved in DB: {initialData.maskedPan || `XXXXXX${initialData.panLast4}`}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            maxLength={10}
            placeholder={
              isEditing && initialData?.panLast4
                ? `Leave empty to keep saved PAN (${initialData.maskedPan || `XXXXXX${initialData.panLast4}`})`
                : 'ABCDE1234F'
            }
            autoComplete="off"
            className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider text-gray-900 placeholder-gray-400 shadow-input transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 ${
              errors.pan ? 'border-red-400' : 'border-gray-300'
            }`}
            {...register('pan')}
            onChange={(e) => {
              setValue('pan', e.target.value.toUpperCase(), { shouldValidate: true });
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        {errors.pan && (
          <p className="text-xs text-red-600 font-medium">{errors.pan.message}</p>
        )}
        {!errors.pan && (
          <p className="text-xs text-gray-400">
            {isEditing
              ? 'Leave blank to preserve existing encrypted PAN, or type 10 characters to update.'
              : 'Compulsory 10-character Indian PAN (5 letters, 4 digits, 1 letter).'}
          </p>
        )}
      </div>

      {/* Field 2: GST Identification Number (GSTIN) - Compulsory + GST status button */}
      <div className="space-y-1.5 pt-2 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="block text-sm font-medium text-gray-700">
            GST Identification Number (GSTIN) *
          </label>

          {/* Clean toggle button right near GST label */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">GST Status:</span>
            <button
              type="button"
              onClick={() => setValue('gstRegistered', !watchedGstRegistered, { shouldValidate: true })}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                watchedGstRegistered
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Check className={`h-3 w-3 ${watchedGstRegistered ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span>{watchedGstRegistered ? 'Registered' : 'Not Registered'}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            maxLength={15}
            placeholder="27ABCDE1234F1Z5"
            autoComplete="off"
            className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider text-gray-900 placeholder-gray-400 shadow-input transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 ${
              errors.gstin ? 'border-red-400' : 'border-gray-300'
            }`}
            {...register('gstin')}
            onChange={(e) => {
              setValue('gstin', e.target.value.toUpperCase(), { shouldValidate: true });
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        {errors.gstin && (
          <p className="text-xs text-red-600 font-medium">{errors.gstin.message}</p>
        )}
        {!errors.gstin && (
          <p className="text-xs text-gray-400">
            Compulsory 15-character GST identification number.
          </p>
        )}
      </div>

      {/* Field 3: Company Identification Number (CIN) - Compulsory */}
      <div className="space-y-1.5 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Corporate Identification Number (CIN) *
          </label>
          <span className="text-xs text-gray-400 font-mono">21 Characters</span>
        </div>
        <div className="relative">
          <input
            type="text"
            maxLength={21}
            placeholder="U12345MH2020PTC123456"
            autoComplete="off"
            className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider text-gray-900 placeholder-gray-400 shadow-input transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 ${
              errors.cin ? 'border-red-400' : 'border-gray-300'
            }`}
            {...register('cin')}
            onChange={(e) => {
              setValue('cin', e.target.value.toUpperCase(), { shouldValidate: true });
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        {errors.cin && (
          <p className="text-xs text-red-600 font-medium">{errors.cin.message}</p>
        )}
        {!errors.cin && (
          <p className="text-xs text-gray-400">
            Compulsory 21-character MCA corporate identifier.
          </p>
        )}
      </div>

      {/* Action Footer with buttons adjusted according to status */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={isLoading}
          disabled={isSubmitting}
          onClick={handleSubmit(handleDraftSubmit)}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          {isEditing ? 'Save Changes' : 'Save Draft'}
        </Button>

        {onSubmitVerification && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            disabled={isLoading}
            onClick={handleSubmit(handleFinalSubmit)}
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4" />
            {initialData?.verificationStatus === 'REJECTED'
              ? 'Save & Resubmit'
              : 'Save & Submit for Verification'}
          </Button>
        )}
      </div>
    </form>
  );
};
