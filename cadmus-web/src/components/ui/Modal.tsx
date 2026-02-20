import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function SovereignModal({ isOpen, onClose, title, children, icon }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-base/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface border-2 border-border shadow-hard rounded-sm overflow-hidden flex flex-col max-h-[85vh]">
        <header className="flex items-center justify-between px-10 py-8 border-b-2 border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-accent/10 border-2 border-accent shadow-hard text-accent">
                {icon}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-text leading-none">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 border-2 border-transparent hover:border-accent hover:text-accent transition-all">
            <X className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-12 font-ui">
          {children}
        </div>

        <footer className="px-10 py-6 border-t-2 border-border bg-muted/10 flex justify-end">
            <button 
                onClick={onClose}
                className="px-8 py-3 border-2 border-border font-black text-[10px] uppercase tracking-widest hover:border-accent transition-all"
            >
                TERMINATE_SIGNAL
            </button>
        </footer>
      </div>
    </div>
  );
}