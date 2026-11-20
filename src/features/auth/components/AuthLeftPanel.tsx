import React from 'react';
import { Store, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

export const AuthLeftPanel: React.FC = () => (
  <div className="relative hidden h-full select-none flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white lg:flex">
    <div className="p-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-xl font-bold leading-tight tracking-tight text-gray-900">
            Avenquo
          </span>
          <span className="block text-xs font-medium text-gray-500">Seller Portal</span>
        </div>
      </div>
    </div>

    <div className="flex flex-1 flex-col justify-center px-10 pb-16">
      <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-[#f6f7f9] px-3.5 py-1 text-xs font-medium text-gray-600">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        Merchant Gateway · Secure Access
      </span>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900">
        Your commerce,
        <br />
        <span className="text-brand-600">elevated.</span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
        Manage inventory, fulfill orders, monitor statutory compliance, and scale your sales across
        the unified Avenquo marketplace.
      </p>

      <div className="mt-8 max-w-sm space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-gray-600">
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
          <span>Automated GST, PAN & statutory compliance</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-600">
          <Zap className="h-4 w-4 shrink-0 text-brand-600" />
          <span>Real-time inventory sync & quick product listings</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-600">
          <TrendingUp className="h-4 w-4 shrink-0 text-brand-600" />
          <span>Direct payouts with bank-grade security</span>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-100 px-10 py-5">
      <p className="text-xs text-gray-400">© Avenquo Marketplace · All rights reserved</p>
    </div>
  </div>
);
