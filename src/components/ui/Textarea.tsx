import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, value, id, className, disabled, ...rest }, ref) => {
    const uid = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={uid} className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-xs text-gray-400 tabular-nums">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={uid}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${uid}-err` : undefined}
          className={clsx(
            'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400',
            'shadow-input transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            className
          )}
          {...rest}
        />
        {error && <p id={`${uid}-err`} className="text-xs text-red-600 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
