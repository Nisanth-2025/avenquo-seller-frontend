import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  Landmark,
  Building,
  CreditCard,
  User,
  ShieldCheck,
  Send,
  Save,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ApiClientError } from '../../../api/client';
import type {
  SellerBankDetailsRequestDTO,
  SellerBankDetailsResponseDTO,
} from '../../../types/bank.types';

const ifscRegex = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const nameRegex = /^[a-zA-Z][a-zA-Z\s.'\-/&,()]*$/;
const bankNameRegex = /^[a-zA-Z][a-zA-Z0-9\s.'\-/&,()]*$/;

const bankSchema = z
  .object({
    accountHolderName: z
      .string()
      .trim()
      .min(1, 'Account holder name is required')
      .max(100, 'Account holder name cannot exceed 100 characters')
      .regex(nameRegex, 'Must start with a letter and contain valid name characters'),
    bankName: z
      .string()
      .trim()
      .min(1, 'Bank name is required')
      .max(150, 'Bank name cannot exceed 150 characters')
      .regex(bankNameRegex, 'Must start with a letter and contain valid bank characters'),
    branchName: z
      .string()
      .trim()
      .max(150, 'Branch name cannot exceed 150 characters')
      .optional()
      .or(z.literal('')),
    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, 'IFSC code is required')
      .regex(
        ifscRegex,
        'Must be a valid 11-character Indian IFSC code (e.g. HDFC0001234)'
      ),
    accountNumber: z
      .string()
      .trim()
      .min(1, 'Account number is required')
      .max(30, 'Account number is too long')
      .regex(
        /^[0-9][0-9\s-]{7,24}[0-9]$/,
        'Account number must contain 9 to 18 digits (spaces and hyphens allowed)'
      )
      .refine((val) => {
        const digits = val.replace(/[\s-]/g, '');
        return digits.length >= 9 && digits.length <= 18;
      }, 'Account number must contain between 9 and 18 digits'),
    confirmAccountNumber: z
      .string()
      .trim()
      .min(1, 'Please confirm your account number'),
  })
  .refine(
    (data) => {
      const acc = data.accountNumber.replace(/[\s-]/g, '');
      const confirmAcc = data.confirmAccountNumber.replace(/[\s-]/g, '');
      return acc === confirmAcc;
    },
    {
      message: 'Account numbers do not match',
      path: ['confirmAccountNumber'],
    }
  );

type BankFormData = z.infer<typeof bankSchema>;

interface BankDetailsFormProps {
  initialData?: SellerBankDetailsResponseDTO | null;
  onSaveDraft: (data: SellerBankDetailsRequestDTO) => Promise<void>;
  onSubmitVerification?: (data: SellerBankDetailsRequestDTO) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
  isSubmitting?: boolean;
}

export const BankDetailsForm: React.FC<BankDetailsFormProps> = ({
  initialData,
  onSaveDraft,
  onSubmitVerification,
  onCancel,
  isLoading,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountHolderName: initialData?.accountHolderName || '',
      bankName: initialData?.bankName || '',
      branchName: initialData?.branchName || '',
      ifscCode: initialData?.ifscCode || '',
      accountNumber: '',
      confirmAccountNumber: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue('accountHolderName', initialData.accountHolderName);
      setValue('bankName', initialData.bankName);
      setValue('branchName', initialData.branchName || '');
      setValue('ifscCode', initialData.ifscCode);
    }
  }, [initialData, setValue]);

  const mapApiErrors = (err: unknown) => {
    if (err instanceof ApiClientError) {
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([field, msg]) => {
          if (
            field === 'accountHolderName' ||
            field === 'accountNumber' ||
            field === 'ifscCode' ||
            field === 'bankName' ||
            field === 'branchName'
          ) {
            setError(field as keyof BankFormData, {
              type: 'server',
              message: msg,
            });
          }
        });
      }
      setApiError(err.message || 'Validation failed. Please verify the bank fields.');
    } else if (err instanceof Error) {
      setApiError(err.message);
    } else {
      setApiError('An unexpected error occurred while saving bank details.');
    }
  };

  const toRequestDTO = (data: BankFormData): SellerBankDetailsRequestDTO => {
    return {
      accountHolderName: data.accountHolderName.trim(),
      bankName: data.bankName.trim(),
      branchName: data.branchName?.trim() ? data.branchName.trim() : null,
      ifscCode: data.ifscCode.trim().toUpperCase(),
      accountNumber: data.accountNumber.trim(),
    };
  };

  const handleDraftSubmit = async (formData: BankFormData) => {
    setApiError(null);
    try {
      await onSaveDraft(toRequestDTO(formData));
    } catch (err) {
      mapApiErrors(err);
    }
  };

  const handleFullSubmit = async (formData: BankFormData) => {
    if (!onSubmitVerification) return;
    setApiError(null);
    try {
      await onSubmitVerification(toRequestDTO(formData));
    } catch (err) {
      mapApiErrors(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {isEditing ? 'Update Bank Account Details' : 'Register Payout Bank Account'}
            </h3>
            <p className="text-xs text-gray-500">
              Direct settlement destination for order payouts and marketplace remittances.
            </p>
          </div>
        </div>

        {onCancel && (
          <Button size="sm" variant="secondary" onClick={onCancel} disabled={isLoading || isSubmitting}>
            Cancel
          </Button>
        )}
      </div>

      <form className="p-6 space-y-6">
        {/* Error Alert */}
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {/* Rejection Reason Notice if Editing Rejected Record */}
        {initialData?.verificationStatus === 'REJECTED' && initialData.rejectionReason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-950">Reviewer Feedback on Previous Submission</p>
              <p className="mt-0.5 text-red-800 leading-relaxed">{initialData.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Existing Account Notice when editing */}
        {isEditing && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-950">
                Currently Registered Account: {initialData?.maskedAccountNumber} ({initialData?.bankName})
              </p>
              <p className="mt-0.5 text-blue-800 leading-relaxed">
                For security, bank account numbers are encrypted at rest with AEAD 256-bit encryption. Please re-enter and confirm your account number to update your payout records.
              </p>
            </div>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Account Holder Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('accountHolderName')}
                placeholder="e.g. Acme Retail Private Limited / John Doe"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                  errors.accountHolderName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              <User className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.accountHolderName && (
              <p className="mt-1 text-xs text-red-600">{errors.accountHolderName.message}</p>
            )}
            <p className="mt-1 text-[11px] text-gray-500">
              Must exactly match the name registered on your entity bank records.
            </p>
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('bankName')}
                placeholder="e.g. HDFC Bank / ICICI Bank"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                  errors.bankName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              <Landmark className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.bankName && (
              <p className="mt-1 text-xs text-red-600">{errors.bankName.message}</p>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Branch Name <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('branchName')}
                placeholder="e.g. Nariman Point Branch"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                  errors.branchName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              <Building className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.branchName && (
              <p className="mt-1 text-xs text-red-600">{errors.branchName.message}</p>
            )}
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('ifscCode')}
                maxLength={11}
                placeholder="e.g. HDFC0001234"
                onChange={(e) => setValue('ifscCode', e.target.value.toUpperCase())}
                className={`w-full font-mono uppercase rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 tracking-wider focus:outline-none focus:ring-1 ${
                  errors.ifscCode
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              <ShieldCheck className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.ifscCode && (
              <p className="mt-1 text-xs text-red-600">{errors.ifscCode.message}</p>
            )}
            <p className="mt-1 text-[11px] text-gray-500">
              11-character Indian Financial System Code (4 letters, 0, 6 alphanumeric).
            </p>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Account Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showAccountNumber ? 'text' : 'password'}
                {...register('accountNumber')}
                placeholder="9 to 18 digit account number"
                className={`w-full font-mono rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 tracking-wider focus:outline-none focus:ring-1 ${
                  errors.accountNumber
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowAccountNumber(!showAccountNumber)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.accountNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.accountNumber.message}</p>
            )}
            <p className="mt-1 text-[11px] text-gray-500">
              Only numbers, spaces, or hyphens accepted.
            </p>
          </div>

          {/* Confirm Account Number */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Confirm Account Number <span className="text-red-500">*</span>
            </label>
            <div className="relative max-w-md">
              <input
                type="text"
                {...register('confirmAccountNumber')}
                placeholder="Re-enter bank account number"
                className={`w-full font-mono rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 tracking-wider focus:outline-none focus:ring-1 ${
                  errors.confirmAccountNumber
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-brand-600 focus:ring-brand-600'
                }`}
              />
              <CreditCard className="h-4 w-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.confirmAccountNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmAccountNumber.message}</p>
            )}
            <p className="mt-1 text-[11px] text-gray-500">
              Re-type account number to prevent disbursement routing failures.
            </p>
          </div>
        </div>

        {/* Security Assurance Box */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-start gap-3 text-xs text-gray-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-gray-900">Encrypted Payout Record:</span> Raw account numbers are encrypted at rest with AEAD 256-bit keys and never returned unmasked in API responses or logs.
          </p>
        </div>

        {/* Form Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSubmit(handleDraftSubmit)}
            loading={isLoading && !isSubmitting}
            disabled={isLoading || isSubmitting}
            className="text-xs"
          >
            <Save className="h-3.5 w-3.5" /> Save as Draft
          </Button>

          {onSubmitVerification && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit(handleFullSubmit)}
              loading={isSubmitting}
              disabled={isLoading || isSubmitting}
              className="text-xs shadow-sm bg-brand-600 hover:bg-brand-700"
            >
              <Send className="h-3.5 w-3.5" /> Save & Submit for Verification
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
