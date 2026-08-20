import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-orange-500/20 text-orange-400 border-orange-500/30',
        secondary: 'border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
        destructive: 'border-transparent bg-red-500/20 text-red-400 border-red-500/30',
        outline: 'text-zinc-300 border-zinc-700',
        emerald: 'border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        sky: 'border-transparent bg-sky-500/20 text-sky-400 border-sky-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function ShadcnBadge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { ShadcnBadge, badgeVariants };
