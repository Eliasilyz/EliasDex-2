import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
 'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible: disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
 {
  variants: {
   variant: {
    default: 'bg-orange-500 text-white shadow-lg hover:bg-orange-600',
    destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
    outline: 'border border-ink-700 bg-surface-canvas/60 text-ink-300 hover:bg-ink-700 hover:text-white',
    secondary: 'bg-ink-700 text-surface-primary shadow-sm hover:bg-ink-500',
    ghost: 'text-ink-300 hover:bg-ink-700/80 hover:text-white',
    link: 'text-orange-400 underline-offset-4 hover:underline',
    glass: 'bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/20',
   },
   size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-lg px-3 text-xs',
    lg: 'h-12 rounded-2xl px-6 text-base',
    icon: 'h-9 w-9 p-0',
   },
  },
  defaultVariants: {
   variant: 'default',
   size: 'default',
  },
 }
);

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
 asChild?: boolean;
}

const ShadcnButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
   <Comp
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    {...props}
   />
  );
 }
);
ShadcnButton.displayName = 'ShadcnButton';

export { ShadcnButton, buttonVariants };
