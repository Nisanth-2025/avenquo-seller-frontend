import React from 'react';
import { Store, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

export const AuthLeftPanel: React.FC = () => (
  <div className="auth-left relative hidden lg:flex lg:flex-col h-full bg-[#0f172a] select-none">
    {/* subtle grid pattern */}
    <div className="auth-left-bg" />

    {/* Top brand logo */}
    <div className="relative z-10 p-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 text-white shadow-sm">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white block leading-tight">
            Avenquo
          </span>
          <span className="text-xs font-medium text-white/50 block">Seller Portal</span>
        </div>
      </div>
    </div>

    {/* Center content hero */}
    <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-16">
      {/* Pill badge */}
      <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-medium text-white/85 backdrop-blur-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Merchant Gateway · Secure Access
      </span>

      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
        Your commerce,
        <br />
        <span className="text-white/60">elevated.</span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
        Manage inventory, fulfill orders, monitor real-time statutory compliance, and scale your sales
        across the unified Avenquo marketplace.
      </p>

      {/* Feature bullets / highlights */}
      <div className="mt-8 space-y-3 max-w-sm">
        <div className="flex items-center gap-2.5 text-xs text-white/75">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Automated GST, PAN & statutory compliance</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-white/75">
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Real-time inventory sync & quick product listings</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-white/75">
          <TrendingUp className="h-4 w-4 text-blue-400 shrink-0" />
          <span>Direct payouts with bank-grade security</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-10 flex gap-8 border-t border-white/10 pt-8">
        {[
          { value: '50K+', label: 'Active sellers' },
          { value: '99.9%', label: 'Uptime SLA' },
          { value: '2M+', label: 'Orders / mo' },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-xl font-black text-white tracking-tight">{s.value}</div>
            <div className="mt-0.5 text-xs text-white/50">{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom copyright */}
    <div className="relative z-10 border-t border-white/10 px-10 py-5">
      <p className="text-xs text-white/40">© 2026 Avenquo Marketplace · All rights reserved</p>
    </div>
  </div>
);
