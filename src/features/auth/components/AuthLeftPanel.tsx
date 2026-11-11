import React from 'react';

export const AuthLeftPanel: React.FC = () => (
  <div className="auth-left relative hidden lg:flex lg:flex-col h-full">
    {/* subtle grid pattern */}
    <div className="auth-left-bg" />

    {/* top-left logo */}
    <div className="relative z-10 p-10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
          {/* Simple store icon */}
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">Avenquo</span>
      </div>
    </div>

    {/* center content */}
    <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-16">
      {/* pill */}
      <span className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Seller Portal · Secure Access
      </span>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
        Your commerce,<br/>
        <span className="text-white/70">elevated.</span>
      </h1>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
        Manage your products, orders and analytics in one unified platform built for modern merchants.
      </p>

      {/* stats row */}
      <div className="mt-12 flex gap-8">
        {[
          { value: '50K+', label: 'Active sellers' },
          { value: '99.9%', label: 'Uptime SLA' },
          { value: '2M+', label: 'Orders/month' },
        ].map(s => (
          <div key={s.label}>
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="mt-0.5 text-xs text-white/45">{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* bottom bar */}
    <div className="relative z-10 border-t border-white/10 px-10 py-5">
      <p className="text-xs text-white/35">© 2026 Avenquo Marketplace · All rights reserved</p>
    </div>
  </div>
);
