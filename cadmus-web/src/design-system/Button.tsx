import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-accent text-base border-accent shadow-hard active:translate-y-0.5 active:shadow-none',
      secondary: 'bg-surface text-text border-border shadow-hard hover:border-accent hover:text-accent active:translate-y-0.5 active:shadow-none',
      ghost: 'bg-transparent border-transparent text-subtext hover:text-accent hover:border-accent/20',
      danger: 'bg-base text-accent border-accent shadow-hard hover:bg-accent/5 active:translate-y-0.5 active:shadow-none',
    };

    const sizes = {
      sm: 'h-8 px-4 text-[9px]',
      md: 'h-11 px-6 text-[10px]',
      lg: 'h-14 px-10 text-xs',
      icon: 'h-11 w-11 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border-2 font-black uppercase tracking-[0.2em] transition-all focus-visible:outline-none disabled:opacity-30 disabled:pointer-events-none font-ui',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';