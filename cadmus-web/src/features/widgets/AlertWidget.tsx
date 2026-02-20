import { ShieldCheck, Info, AlertTriangle, Ban, Settings2, X } from 'lucide-react';
import { clsx } from 'clsx';
import React, { ReactNode } from 'react';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

interface AlertWidgetProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  onDelete?: () => void;
}

const VARIANTS = {
  info: { border: 'border-accent/30', bg: 'bg-accent/5', icon: <Info className="w-4 h-4" />, text: 'text-accent' },
  warning: { border: 'border-accent/30', bg: 'bg-accent/5', icon: <AlertTriangle className="w-4 h-4" />, text: 'text-accent' },
  error: { border: 'border-accent/30', bg: 'bg-accent/5', icon: <Ban className="w-4 h-4" />, text: 'text-accent' },
  success: { border: 'border-accent/30', bg: 'bg-accent/5', icon: <ShieldCheck className="w-4 h-4" />, text: 'text-accent' }
};

export function AlertWidget({ variant = 'info', title, children, className, onDelete }: AlertWidgetProps) {
  const style = VARIANTS[variant];
  const displayTitle = title || `${variant.toUpperCase()}_SIGNAL`;

  return (
    <div className={clsx(
      "group/alert relative flex w-full overflow-hidden border border-border bg-surface transition-all hover:border-accent/50 my-6",
      className
    )}>
      {/* Sidebar Accent */}
      <div className="w-1 bg-accent opacity-50 group-hover/alert:opacity-100 transition-opacity" />
      
      <div className="flex-1 p-4 flex items-start gap-4">
        <div className="mt-1 opacity-40 group-hover/alert:opacity-100 transition-opacity text-accent">
          {style.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-30 group-hover/alert:opacity-60 transition-opacity">
            {displayTitle}
          </div>
          <div className="text-sm font-medium text-text leading-snug">
            {children}
          </div>
        </div>

        {/* Minimalist Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover/alert:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors">
                <Settings2 className="w-3 h-3" />
            </button>
            <button 
                onClick={onDelete}
                className="p-1 hover:bg-accent/10 text-subtext hover:text-accent transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
      </div>
    </div>
  );
}