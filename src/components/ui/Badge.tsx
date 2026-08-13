import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'outline' | 'sub' | 'dub';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  className = '',
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs md:text-sm font-medium';

  const variantClasses = {
    primary: 'bg-orange-600/90 text-white font-medium',
    secondary: 'bg-zinc-800 text-zinc-300 border border-zinc-700/50',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium',
    info: 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium',
    outline: 'border border-zinc-700/80 text-zinc-300 bg-zinc-900/60 backdrop-blur-sm',
    sub: 'bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold uppercase tracking-wider',
    dub: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase tracking-wider',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-sans leading-none select-none ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
