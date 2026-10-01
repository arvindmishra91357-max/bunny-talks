import React from 'react';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🐰',
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-3xl ${className}`}>
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] border border-[#ede8f7] dark:border-[#332b49] flex items-center justify-center text-3xl shadow-[0_8px_24px_rgba(255,96,125,0.12)] mb-4 animate-in zoom-in-95 duration-300">
        {typeof icon === 'string' ? <span>{icon}</span> : icon}
      </div>
      <h3 className="text-base font-bold text-bunny-ink mb-1.5">{title}</h3>
      <p className="text-xs text-bunny-muted max-w-xs leading-relaxed mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-[0_4px_16px_rgba(255,96,125,0.35)] hover:opacity-95 active:scale-95 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
