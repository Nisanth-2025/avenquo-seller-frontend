import React, { useRef } from 'react';
import { clsx } from 'clsx';

interface OtpInputProps {
  value:    string;
  onChange: (val: string) => void;
  error?:   string;
  disabled?: boolean;
  length?:  number;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value, onChange, error, disabled = false, length = 6
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const update = (idx: number, ch: string) => {
    const next = [...digits];
    next[idx] = ch;
    onChange(next.join(''));
    if (ch && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  return (
    <div>
      <div className="flex gap-2 sm:gap-3 justify-between">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}            /* allow typing to work naturally */
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            disabled={disabled}
            value={d}
            aria-label={`Digit ${i + 1} of ${length}`}
            onFocus={e => e.target.select()}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '');
              if (!raw) { update(i, ''); return; }
              // Handle paste of multiple digits
              if (raw.length > 1) {
                const pasted = raw.slice(0, length - i);
                const next = [...digits];
                for (let j = 0; j < pasted.length; j++) next[i + j] = pasted[j] ?? '';
                onChange(next.join(''));
                const focusIdx = Math.min(i + pasted.length, length - 1);
                refs.current[focusIdx]?.focus();
                return;
              }
              update(i, raw);
            }}
            onKeyDown={e => {
              if (e.key === 'Backspace' && !d && i > 0) {
                refs.current[i - 1]?.focus();
                const next = [...digits]; next[i - 1] = '';
                onChange(next.join(''));
              }
              if (e.key === 'ArrowLeft'  && i > 0)          { e.preventDefault(); refs.current[i-1]?.focus(); }
              if (e.key === 'ArrowRight' && i < length - 1) { e.preventDefault(); refs.current[i+1]?.focus(); }
            }}
            onPaste={e => {
              e.preventDefault();
              const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
              const next = Array.from({ length }, (_, j) => text[j] ?? '');
              onChange(next.join(''));
              const focusIdx = Math.min(text.length, length - 1);
              refs.current[focusIdx]?.focus();
            }}
            className={clsx(
              'h-12 w-full text-center text-lg font-semibold rounded-lg border bg-white',
              'transition-all duration-150 focus:outline-none focus:ring-2',
              'otp-box',
              d && 'filled',
              error
                ? 'border-red-400 text-red-700 focus:ring-red-400'
                : 'border-gray-300 text-gray-900 focus:ring-brand-600 focus:border-brand-600',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600 font-medium text-center">{error}</p>}
    </div>
  );
};
