import React from 'react';
import { clsx } from 'clsx';
import { Check, Clock, AlertTriangle, XCircle, Store } from 'lucide-react';
import { ApplicationStatus } from '../../../types/seller.types';

interface ApplicationStepperProps {
  status?: ApplicationStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
}

export const ApplicationStepper: React.FC<ApplicationStepperProps> = ({
  status = 'DRAFT',
  submittedAt,
  approvedAt,
}) => {
  const steps = [
    { id: 1, label: 'Profile Draft', sub: 'Details provided' },
    { id: 2, label: 'Application Submitted', sub: submittedAt ? new Date(submittedAt).toLocaleDateString() : 'Pending submission' },
    { id: 3, label: 'Under Review', sub: 'Admin review' },
    { id: 4, label: 'Storefront Active', sub: approvedAt ? new Date(approvedAt).toLocaleDateString() : 'Awaiting approval' },
  ];

  let currentStep = 1;
  if (status === 'SUBMITTED') currentStep = 2;
  else if (status === 'UNDER_REVIEW') currentStep = 3;
  else if (status === 'APPROVED') currentStep = 4;
  else if (status === 'CHANGES_REQUIRED' || status === 'DRAFT') currentStep = 1;
  else if (status === 'REJECTED') currentStep = 3;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-5 shadow-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Application Progress</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Track your merchant onboarding and verification milestones
          </p>
        </div>
        {status === 'CHANGES_REQUIRED' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Action Required
          </span>
        )}
        {status === 'REJECTED' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="h-3.5 w-3.5 text-red-600" /> Application Rejected
          </span>
        )}
        {status === 'APPROVED' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Store className="h-3.5 w-3.5 text-emerald-600" /> Verified Seller
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative">
        {steps.map((step, idx) => {
          const isComplete = currentStep > step.id || (status === 'APPROVED' && step.id === 4);
          const isCurrent = currentStep === step.id && status !== 'APPROVED';
          const isRejectedStep = status === 'REJECTED' && step.id === 3;

          return (
            <div key={step.id} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative">
              {/* Connector line for desktop */}
              {idx < steps.length - 1 && (
                <div
                  className={clsx(
                    'hidden sm:block absolute top-4 left-[50%] w-full h-0.5 z-0',
                    currentStep > step.id ? 'bg-brand-600' : 'bg-gray-200'
                  )}
                />
              )}

              {/* Step indicator circle */}
              <div
                className={clsx(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-150',
                  isComplete
                    ? 'bg-brand-600 text-white'
                    : isRejectedStep
                    ? 'bg-red-600 text-white'
                    : isCurrent
                    ? 'border-2 border-brand-600 bg-white text-brand-600 ring-4 ring-brand-50'
                    : 'border border-gray-300 bg-white text-gray-400'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : isRejectedStep ? (
                  <XCircle className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>

              {/* Labels */}
              <div className="flex-1 sm:w-full">
                <div
                  className={clsx(
                    'text-xs font-semibold',
                    isCurrent || isComplete ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{step.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
