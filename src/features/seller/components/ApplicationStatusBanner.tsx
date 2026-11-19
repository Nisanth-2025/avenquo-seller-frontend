import React from 'react';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ApplicationStatus } from '../../../types/seller.types';

interface ApplicationStatusBannerProps {
  status?: ApplicationStatus;
  rejectionReason?: string | null;
}

export const ApplicationStatusBanner: React.FC<ApplicationStatusBannerProps> = ({
  status,
  rejectionReason,
}) => {
  if (!status || status === 'DRAFT') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50/80 px-4 py-3.5 text-sm text-blue-900 border border-blue-100/60">
        <Clock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-950">Draft Application</h4>
          <p className="mt-0.5 text-xs text-blue-800 leading-relaxed">
            Fill in your storefront identity, business registration, and verified contact details. You can save your draft at any time and submit when ready for review.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'CHANGES_REQUIRED') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 text-sm text-amber-900 border border-amber-200/60">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-950">Reviewer Feedback: Changes Required</h4>
          <p className="mt-1 text-xs text-amber-800 leading-relaxed">
            Our onboarding team reviewed your application and requested the following modifications before your storefront can be activated:
          </p>
          {rejectionReason && (
            <div className="mt-2.5 rounded-xl border border-amber-200 bg-white/90 p-3 text-xs font-mono text-gray-800 leading-relaxed">
              "{rejectionReason}"
            </div>
          )}
          <p className="mt-2 text-xs font-medium text-amber-900">
            Please update the requested fields below and click <strong>Submit Application</strong> to re-trigger review.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50/80 px-4 py-3.5 text-sm text-blue-900 border border-blue-100/60">
        <Clock className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-950">
            {status === 'SUBMITTED' ? 'Application Submitted' : 'Application Under Review'}
          </h4>
          <p className="mt-1 text-xs text-blue-800 leading-relaxed">
            Your seller application has been submitted and is currently being reviewed by our compliance team. Editing is locked while under review. You will receive an update once verification is complete.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'APPROVED') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/80 px-4 py-3.5 text-sm text-emerald-900 border border-emerald-100/60">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-emerald-950">Storefront Profile Active</h4>
          <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
            Congratulations! Your seller account is verified and approved. You can now customize your public storefront profile, upload brand assets (logo & banner), and manage customer support channels.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3.5 text-sm text-red-900 border border-red-200/60">
        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-950">Application Not Approved</h4>
          <p className="mt-1 text-xs text-red-800 leading-relaxed">
            Unfortunately, your seller application could not be approved at this time.
          </p>
          {rejectionReason && (
            <div className="mt-2.5 rounded-xl border border-red-200 bg-white/90 p-3 text-xs font-mono text-gray-800 leading-relaxed">
              "{rejectionReason}"
            </div>
          )}
          <p className="mt-2 text-xs text-red-800">
            If you believe this was an error, please reach out to <a href="mailto:compliance@avenquo.com" className="font-semibold underline">compliance@avenquo.com</a>.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
