import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface AlertProps {
  variant?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', message, onClose }) => {
  const cfg = {
    success: { bg: 'bg-green-50 border-green-200',  text: 'text-green-800',  Icon: CheckCircle,  ic: 'text-green-500' },
    error:   { bg: 'bg-red-50   border-red-200',    text: 'text-red-800',    Icon: AlertCircle,  ic: 'text-red-500' },
    info:    { bg: 'bg-blue-50  border-blue-200',   text: 'text-blue-800',   Icon: Info,         ic: 'text-blue-500' },
  }[variant];

  return (
    <div className={clsx('flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm', cfg.bg, cfg.text)}>
      <cfg.Icon className={clsx('mt-0.5 h-4 w-4 flex-shrink-0', cfg.ic)} />
      <span className="flex-1 leading-relaxed">{message}</span>
      {onClose && (
        <button onClick={onClose} className="mt-0.5 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
