import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  BUSINESS_TYPE_OPTIONS,
  CreateSellerApplicationDTO,
  SellerProfileResponseDTO,
} from '../../../types/seller.types';
import { ApiClientError } from '../../../api/client';
import { Store, Building2, PhoneCall, Save, Send, Sparkles, CheckCircle2 } from 'lucide-react';

const phoneRegex = /^\+91[6-9]\d{9}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const applicationSchema = z.object({
  storeName: z
    .string()
    .min(1, 'Store name is required')
    .max(25, 'Store name must not exceed 25 characters'),
  storeSlug: z
    .string()
    .min(1, 'Store slug is required')
    .max(50, 'Store slug must not exceed 50 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and single hyphens'),
  legalName: z
    .string()
    .min(1, 'Legal registered entity name is required')
    .max(150, 'Legal name must not exceed 150 characters'),
  businessType: z.enum([
    'SOLE_PROPRIETORSHIP',
    'PARTNERSHIP',
    'PRIVATE_LIMITED',
    'PUBLIC_LIMITED',
    'LLP',
    'OTHER',
  ]),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  supportEmail: z
    .string()
    .min(1, 'Customer support email is required')
    .email('Enter a valid email address')
    .max(320, 'Email must not exceed 320 characters'),
  supportPhone: z
    .string()
    .regex(phoneRegex, 'Phone must start with +91 followed by 10 digits starting with 6-9 (e.g. +919876543210)'),
  website: z
    .string()
    .max(500, 'Website URL must not exceed 500 characters')
    .refine(
      (val) => !val || /^https?:\/\/.+/i.test(val),
      'Website must start with http:// or https://'
    )
    .optional()
    .or(z.literal('')),
  contactPersonName: z
    .string()
    .min(1, 'Primary contact person name is required')
    .max(100, 'Contact person name must not exceed 100 characters'),
  contactPersonPhone: z
    .string()
    .regex(phoneRegex, 'Phone must start with +91 followed by 10 digits starting with 6-9 (e.g. +919876543210)'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface SellerApplicationFormProps {
  application: SellerProfileResponseDTO | null;
  onSaveDraft: (data: CreateSellerApplicationDTO) => Promise<void>;
  onSubmitApplication: (data: CreateSellerApplicationDTO) => Promise<void>;
  isEditable: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
}

export const SellerApplicationForm: React.FC<SellerApplicationFormProps> = ({
  application,
  onSaveDraft,
  onSubmitApplication,
  isEditable,
  isSaving,
  isSubmitting,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const defaultValues: ApplicationFormData = {
    storeName: application?.storeName || '',
    storeSlug: application?.storeSlug || '',
    legalName: application?.legalName || '',
    businessType: application?.businessType || 'PRIVATE_LIMITED',
    description: application?.description || '',
    supportEmail: application?.supportEmail || '',
    supportPhone: application?.supportPhone || '',
    website: application?.website || '',
    contactPersonName: application?.contactPersonName || '',
    contactPersonPhone: application?.contactPersonPhone || '',
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: 'onTouched',
  });

  // Keep form in sync when application loads/updates
  useEffect(() => {
    if (application) {
      reset({
        storeName: application.storeName || '',
        storeSlug: application.storeSlug || '',
        legalName: application.legalName || '',
        businessType: application.businessType || 'PRIVATE_LIMITED',
        description: application.description || '',
        supportEmail: application.supportEmail || '',
        supportPhone: application.supportPhone || '',
        website: application.website || '',
        contactPersonName: application.contactPersonName || '',
        contactPersonPhone: application.contactPersonPhone || '',
      });
      setSlugManuallyEdited(true);
    }
  }, [application, reset]);

  const watchedStoreSlug = watch('storeSlug');

  // Auto-slug generator from store name
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('storeName', name, { shouldValidate: true });
    if (!slugManuallyEdited && !application) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
      setValue('storeSlug', generated, { shouldValidate: true });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setValue('storeSlug', slug, { shouldValidate: true });
  };

  const handleFormError = (err: unknown) => {
    if (err instanceof ApiClientError) {
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([field, msg]) => {
          setError(field as keyof ApplicationFormData, { message: msg });
        });
      }
      setApiError(err.message);
    } else {
      setApiError('An unexpected error occurred. Please try again.');
    }
  };

  const onDraftClick = handleSubmit(async (data) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      await onSaveDraft(data as CreateSellerApplicationDTO);
      setSuccessMessage('Application draft saved successfully.');
    } catch (err) {
      handleFormError(err);
    }
  });

  const onSubmitClick = handleSubmit(async (data) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      await onSubmitApplication(data as CreateSellerApplicationDTO);
      setSuccessMessage('Application submitted successfully for review!');
    } catch (err) {
      handleFormError(err);
    }
  });

  return (
    <form className="space-y-8" noValidate>
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}
      {successMessage && (
        <Alert variant="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* ── Section 1: Store & Entity Identity ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Storefront & Entity Identity</h3>
            <p className="text-xs text-gray-500">
              Define your brand name, URL handle, and registered business classification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Store Name */}
          <Input
            label="Storefront Brand Name *"
            placeholder="e.g. Avenquo Home"
            disabled={!isEditable}
            error={errors.storeName?.message}
            hint="Customer-facing store name (1-25 characters)"
            {...register('storeName')}
            onChange={handleStoreNameChange}
          />

          {/* Store Slug with prefix preview */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Store URL Handle (Slug) *
            </label>
            <div className="relative rounded-lg shadow-input">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-gray-400 font-mono">
                avenquo.com/store/
              </div>
              <input
                type="text"
                disabled={!isEditable}
                placeholder="avenquo-home"
                value={watchedStoreSlug}
                onChange={handleSlugChange}
                className={`block w-full rounded-lg border bg-white pl-[138px] pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 font-mono transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 ${
                  errors.storeSlug ? 'border-red-400' : 'border-gray-300'
                } ${!isEditable ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.storeSlug && (
              <p className="text-xs text-red-600 font-medium">{errors.storeSlug.message}</p>
            )}
            {!errors.storeSlug && (
              <p className="text-xs text-gray-400">
                Lowercase letters, digits, and single hyphens (1-50 chars)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Legal Name */}
          <Input
            label="Legal Registered Business Name *"
            placeholder="e.g. Avenquo Retail Private Limited"
            disabled={!isEditable}
            error={errors.legalName?.message}
            hint="Exact legal name as registered on tax certificates (1-150 chars)"
            {...register('legalName')}
          />

          {/* Business Type */}
          <Controller
            name="businessType"
            control={control}
            render={({ field }) => (
              <Select
                label="Business Entity Structure *"
                options={BUSINESS_TYPE_OPTIONS}
                disabled={!isEditable}
                error={errors.businessType?.message}
                hint="Entity classification for tax and compliance verification"
                {...field}
              />
            )}
          />
        </div>
      </div>

      {/* ── Section 2: Contact & Support Channels ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Support Channels & Web Presence</h3>
            <p className="text-xs text-gray-500">
              Customer support channels displayed on your storefront and order receipts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Support Email */}
          <Input
            label="Customer Support Email *"
            type="email"
            placeholder="help@yourbrand.com"
            disabled={!isEditable}
            error={errors.supportEmail?.message}
            hint="Public support contact for buyer inquiries (max 320 chars)"
            {...register('supportEmail')}
          />

          {/* Support Phone */}
          <Input
            label="Customer Support Phone (+91) *"
            placeholder="+919876543210"
            disabled={!isEditable}
            error={errors.supportPhone?.message}
            hint="Must be +91 followed by 10 digits beginning with 6-9"
            {...register('supportPhone')}
          />
        </div>

        {/* Website */}
        <Input
          label="Official Website (Optional)"
          placeholder="https://example.com"
          disabled={!isEditable}
          error={errors.website?.message}
          hint="Link to existing corporate or brand website (max 500 chars)"
          {...register('website')}
        />

        {/* Storefront Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Storefront About & Catalog Summary (Optional)"
              placeholder="Describe your brand, product categories, manufacturing values, and customer commitment..."
              rows={4}
              maxLength={2000}
              showCount
              disabled={!isEditable}
              error={errors.description?.message}
              hint="Displayed on your public seller profile (max 2000 characters)"
              {...field}
            />
          )}
        />
      </div>

      {/* ── Section 3: Authorized Representative ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Authorized Merchant Representative</h3>
            <p className="text-xs text-gray-500">
              Primary business point-of-contact for account compliance and administrative notifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Contact Person Name */}
          <Input
            label="Authorized Representative Name *"
            placeholder="e.g. Asha Kumar"
            disabled={!isEditable}
            error={errors.contactPersonName?.message}
            hint="Full legal name of company signatory or founder (1-100 chars)"
            {...register('contactPersonName')}
          />

          {/* Contact Person Phone */}
          <Input
            label="Authorized Representative Phone (+91) *"
            placeholder="+919876543210"
            disabled={!isEditable}
            error={errors.contactPersonPhone?.message}
            hint="Direct mobile number for urgent communications (+91...)"
            {...register('contactPersonPhone')}
          />
        </div>
      </div>

      {/* ── Action Toolbar ── */}
      {isEditable && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>
              You can save your progress as a draft and return anytime before submission.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              loading={isSaving}
              disabled={isSubmitting}
              onClick={onDraftClick}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4" /> Save Draft
            </Button>

            <Button
              type="button"
              variant="primary"
              loading={isSubmitting}
              disabled={isSaving}
              onClick={onSubmitClick}
              className="flex-1 sm:flex-none"
            >
              <Send className="h-4 w-4" /> Submit Application
            </Button>
          </div>
        </div>
      )}

      {!isEditable && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
          <CheckCircle2 className="h-4 w-4 text-gray-400" />
          <span>
            Application fields are currently locked in read-only mode ({application?.status}). To request changes, contact merchant support.
          </span>
        </div>
      )}
    </form>
  );
};
