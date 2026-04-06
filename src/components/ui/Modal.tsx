import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-3xl p-6 pb-8 animate-slide-up z-10">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold text-textPrimary">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-full hover:bg-surfaceHigh transition-colors text-textMuted"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
