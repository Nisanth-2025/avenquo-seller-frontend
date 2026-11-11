import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { SellerTaxRequestDTO, SellerTaxResponseDTO } from '../../../types/tax.types';
import { ApiClientError } from '../../../api/client';
import { ShieldCheck, Check, X, CreditCard, Receipt, Building2 } from 'lucide-react';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const cinRegex = /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

const taxFormSchema = z
  .object({
    pan: z
      .string()
      .trim()
      .toUpperCase()
      .regex(panRegex, 'Must be a valid 10-character Indian PAN (e.g. ABCDE1234F)'),
    gstRegistered: z.boolean(),
    gstin: z.string().trim().toUpperCase(),
    hasCin: z.boolean(),
    cin: z.string().trim().toUpperCase(),
  })
  .superRefine((data, ctx) => {
    if (data.gstRegistered) {
      if (!data.gstin || !gstinRegex.test(data.gstin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['gstin'],
          message: 'Must be a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)',
        });
      }
    }
    if (data.hasCin) {
      if (!data.cin || !cinRegex.test(data.cin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cin'],
          message: 'Must be a valid 21-character CIN (e.g. U12345MH2020PTC123456)',
        });
      }
    }
  });

type TaxFormData = z.infer<typeof taxFormSchema>;

interface TaxDetailsFormProps {
  initialData?: SellerTaxResponseDTO | null;
  onSubmit: (data: SellerTaxRequestDTO) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
  isEditMode?: boolean;
}

export const TaxDetailsForm: React.FC<TaxDetailsFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditMode = false,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const defaultValues: TaxFormData = {
    pan: initialData?.panLast4 ? `ABCDE${initialData.panLast4}` : '',
    gstRegistered: initialData?.gstRegistered ?? false,
    gstin: initialData?.gstin || '',
    hasCin: Boolean(initialData?.cin),
    cin: initialData?.cin || '',
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const watchedGstRegistered = watch('gstRegistered');
  const watchedHasCin = watch('hasCin');

  const onFormSubmit = async (data: TaxFormData) => {
    setApiError(null);
    try {
      const payload: SellerTaxRequestDTO = {
        pan: data.pan.trim().toUpperCase(),
        gstRegistered: data.gstRegistered,
        gstin: data.gstRegistered ? data.gstin.trim().toUpperCase() : '',
        cin: data.hasCin ? data.cin.trim().toUpperCase() : '',
      };
      await onSubmit(payload);
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

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-6"
      noValidate
    >
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      {/* Form Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {isEditMode ? 'Update Tax Identifiers' : 'Register Tax Identifiers'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Indian taxation statutory requirements for merchant payouts and invoicing.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> AEAD Encrypted
        </span>
      </div>

      {/* Field 1: Permanent Account Number (PAN) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Permanent Account Number (PAN) *
          </label>
          <span className="text-xs text-gray-400 font-mono">10 Characters</span>
        </div>
        <div className="relative">
          <input
            type="text"
            maxLength={10}
            placeholder="ABCDE1234F"
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
            Format: 5 alphabets, 4 digits, 1 alphabet. Trimmmed & stored encrypted.
          </p>
        )}
      </div>

      {/* Field 2: GST Registration */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700">
          Goods and Services Tax (GST) *
        </label>

        {/* GST Toggle Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setValue('gstRegistered', true);
            }}
            className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs font-medium transition-all duration-150 ${
              watchedGstRegistered
                ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-1 ring-brand-600'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-brand-600" />
              <div>
                <div className="font-semibold text-gray-900">GST Registered</div>
                <div className="text-[11px] text-gray-500">I have a valid 15-character GSTIN</div>
              </div>
            </div>
            {watchedGstRegistered && <Check className="h-4 w-4 text-brand-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setValue('gstRegistered', false);
              setValue('gstin', '');
            }}
            className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs font-medium transition-all duration-150 ${
              !watchedGstRegistered
                ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-1 ring-brand-600'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900">Not Registered / Exempt</div>
                <div className="text-[11px] text-gray-500">Below annual turnover threshold</div>
              </div>
            </div>
            {!watchedGstRegistered && <Check className="h-4 w-4 text-brand-600" />}
          </button>
        </div>

        {/* GSTIN Input (shown when registered) */}
        {watchedGstRegistered && (
          <div className="space-y-1.5 pt-1">
            <Input
              label="GST Identification Number (GSTIN) *"
              placeholder="27ABCDE1234F1Z5"
              autoComplete="off"
              className="font-mono uppercase tracking-wider"
              error={errors.gstin?.message}
              hint="15-character state-code alphanumeric identification"
              {...register('gstin')}
              onChange={(e) => {
                setValue('gstin', e.target.value.toUpperCase(), { shouldValidate: true });
              }}
            />
          </div>
        )}
      </div>

      {/* Field 3: Corporate Identification Number (CIN) */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700">
          Corporate Identity (CIN)
        </label>

        {/* CIN Toggle Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setValue('hasCin', true);
            }}
            className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs font-medium transition-all duration-150 ${
              watchedHasCin
                ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-1 ring-brand-600'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-600" />
              <div>
                <div className="font-semibold text-gray-900">Incorporated Entity</div>
                <div className="text-[11px] text-gray-500">Pvt Ltd, Public Ltd, or LLP (has CIN)</div>
              </div>
            </div>
            {watchedHasCin && <Check className="h-4 w-4 text-brand-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setValue('hasCin', false);
              setValue('cin', '');
            }}
            className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs font-medium transition-all duration-150 ${
              !watchedHasCin
                ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-1 ring-brand-600'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900">Unincorporated Entity</div>
                <div className="text-[11px] text-gray-500">Sole Proprietorship / Partnership</div>
              </div>
            </div>
            {!watchedHasCin && <Check className="h-4 w-4 text-brand-600" />}
          </button>
        </div>

        {/* CIN Input (shown when corporate) */}
        {watchedHasCin && (
          <div className="space-y-1.5 pt-1">
            <Input
              label="Company Identification Number (CIN) *"
              placeholder="U12345MH2020PTC123456"
              autoComplete="off"
              className="font-mono uppercase tracking-wider"
              error={errors.cin?.message}
              hint="21-character MCA corporate identifier (e.g. U... or L...)"
              {...register('cin')}
              onChange={(e) => {
                setValue('cin', e.target.value.toUpperCase(), { shouldValidate: true });
              }}
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={isLoading}>
          <Check className="h-4 w-4" />
          {isEditMode ? 'Update Tax Records' : 'Save Tax Records'}
        </Button>
      </div>
    </form>
  );
};
