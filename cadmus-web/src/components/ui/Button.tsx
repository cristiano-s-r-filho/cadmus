import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const SovereignButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-accent text-crust border-accent hover:bg-accent/90',
      secondary: 'bg-mantle text-text border-accent-border hover:border-accent',
      ghost: 'bg-transparent border-transparent text-subtext hover:text-accent hover:bg-accent/5',
      danger: 'bg-terminal-red/10 text-terminal-red border-terminal-red/20 hover:bg-terminal-red hover:text-white',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[10px]',
      md: 'h-10 px-4 text-xs',
      lg: 'h-14 px-8 text-sm',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border-2 font-black uppercase tracking-widest transition-all focus-visible:outline-none disabled:opacity-30 disabled:pointer-events-none active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

SovereignButton.displayName = 'SovereignButton';
