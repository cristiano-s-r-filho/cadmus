export * from './Button';
export * from './Modal';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const SovereignCard: React.FC<CardProps> = ({ children, className, onClick, hoverable = true }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-mantle border-2 border-accent-border/40 p-8 rounded-[2.5rem] flex flex-col transition-all relative overflow-hidden",
        hoverable && "hover:border-accent hover:shadow-hard cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pro' | 'accent' | 'danger' | 'success';
  className?: string;
}

export const SovereignBadge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "bg-crust border-accent-border/20 text-subtext",
    pro: "bg-terminal-yellow/10 border-terminal-yellow text-terminal-yellow",
    accent: "bg-accent/10 border-accent text-accent",
    danger: "bg-terminal-red/10 border-terminal-red text-terminal-red",
    success: "bg-terminal-green/10 border-terminal-green text-terminal-green",
  };

  return (
    <span className={cn(
      "text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};