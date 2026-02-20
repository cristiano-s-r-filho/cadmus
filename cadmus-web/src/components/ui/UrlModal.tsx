import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Link as LinkIcon, Database, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface UrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (url: string) => void;
    initialValue?: string;
    title?: string;
    label?: string;
}

export function UrlModal({ isOpen, onClose, onConfirm, initialValue = '', title = "Modulate Stream", label = "DATA_SOURCE_URL" }: UrlModalProps) {
    const [url, setUrl] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setUrl(initialValue);
    }, [isOpen, initialValue]);

    const handleConfirm = () => {
        onConfirm(url);
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-base/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border-2 border-border p-8 shadow-hard z-[101] font-ui animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-8">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 text-accent">
                                    <Database className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">I/O_Subsystem</span>
                                </div>
                                <Dialog.Title className="text-2xl font-black uppercase tracking-tighter text-text">
                                    {title}
                                </Dialog.Title>
                            </div>
                            <Dialog.Close className="p-2 hover:bg-accent/10 text-subtext hover:text-accent transition-all">
                                <X className="w-5 h-5" />
                            </Dialog.Close>
                        </div>

                        {/* Body */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-subtext opacity-60">{label}</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext group-focus-within:text-accent transition-colors" />
                                    <input 
                                        type="text" 
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://..."
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                        className="w-full h-14 bg-base border-2 border-border pl-12 pr-6 text-sm font-bold text-text focus:border-accent outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <p className="text-[8px] font-black text-subtext/40 uppercase leading-relaxed tracking-widest italic">
                                Note: Direct links to images (PNG/JPG/GIF) or embeddable video streams are required for optimal parsing.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted/50 transition-all"
                            >
                                CANCEL
                            </button>
                            <button 
                                onClick={handleConfirm}
                                className="px-8 py-3 bg-accent text-base text-[10px] font-black uppercase tracking-[0.2em] shadow-hard hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center gap-3"
                            >
                                EXECUTE_SYNC <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
