import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
 size?: 'sm' | 'md' | 'lg';
 icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
 children,
 variant = 'primary',
 size = 'md',
 icon,
 className = '',
 disabled,
 ...props
}) => {
 const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl gap-2.5',
 }[size];

 const variantClasses = {
   primary: 'bg-orange-700 hover:bg-orange-600 text-white font-semibold shadow-lg active:scale-[0.98]',
  secondary: 'bg-ink-700 hover:bg-ink-500 text-surface-primary active:scale-[0.98]',
  outline: 'border border-ink-500/80 hover:border-ink-500 bg-surface-canvas/40 text-ink-300 hover:bg-ink-700/60 active:scale-[0.98]',
  ghost: 'text-ink-300 hover:text-surface-primary hover:bg-ink-700/50',
  danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30',
 }[variant];

 return (
  <button
   className={`inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
   disabled={disabled}
   {...props}
  >
   {icon && <span className="shrink-0">{icon}</span>}
   {children}
  </button>
 );
};
