import { Download, FileText, Key, Lock, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { SovereignModal } from '../../../components/ui/Modal';

export const SecuritySettings = () => {
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryKey, setRecoveryKey] = useState('');

    const generateRecoveryKey = () => {
        // Generate a random 32-character hex key
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        const key = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        setRecoveryKey(`CADMUS-RECOVERY-${key}`);
        setShowRecovery(true);
    };

    return (
        <div className="flex flex-col gap-12 font-ui animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-8 bg-accent/5 border-2 border-accent shadow-hard flex items-center gap-6">
                <Shield className="w-10 h-10 text-accent" />
                <div className="flex flex-col">
                    <span className="font-black text-text uppercase tracking-[0.2em]">Sovereign_Encryption::Active</span>
                    <span className="text-[10px] text-subtext font-black uppercase tracking-widest opacity-60">All data streams are secured via TLS 1.3 + AES-256-GCM.</span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-subtext">Vault_Access_Control</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border-2 border-border bg-muted/20 flex flex-col gap-4 shadow-hard group">
                        <div className="flex items-center gap-3 text-text font-black text-xs uppercase tracking-widest group-hover:text-accent transition-colors">
                            <Key className="w-4 h-4 text-accent" />
                            <span>Recovery_Mechanism</span>
                        </div>
                        <p className="text-[9px] text-subtext uppercase tracking-wider leading-relaxed">Generate a one-time emergency access key to bypass master authentication.</p>
                        <button 
                            onClick={generateRecoveryKey}
                            className="mt-2 w-full py-3 border-2 border-border font-black text-[9px] uppercase tracking-widest hover:border-accent hover:text-accent transition-all bg-base shadow-hard active:translate-y-0.5"
                        >
                            GENERATE_RECOVERY_KEY
                        </button>
                    </div>

                    <div className="p-6 border-2 border-border bg-muted/20 flex flex-col gap-4 shadow-hard group">
                        <div className="flex items-center gap-3 text-text font-black text-xs uppercase tracking-widest group-hover:text-accent transition-colors">
                            <Lock className="w-4 h-4 text-accent" />
                            <span>Kill_Switch</span>
                        </div>
                        <p className="text-[9px] text-subtext uppercase tracking-wider leading-relaxed">Instantly revoke all active sessions and lock global write access.</p>
                        <button className="mt-2 w-full py-3 bg-accent text-base font-black text-[9px] uppercase tracking-widest shadow-hard active:translate-y-1 active:shadow-none transition-all">ENGAGE_PROTOCOL_ZERO</button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-subtext">Immutable_Audit_Chain</h3>
                </div>
                
                <div className="bg-base border-2 border-border p-6 h-64 overflow-y-auto font-mono text-[9px] text-subtext space-y-3 shadow-inner">
                    <div className="flex gap-6 text-accent font-black border-b border-border/30 pb-2 mb-4">
                        <span className="w-32">[TIMESTAMP]</span>
                        <span className="w-24">[OPERATOR]</span>
                        <span>[ACTION_SIGNAL]</span>
                    </div>
                    <div className="flex gap-6 opacity-60">
                        <span className="w-32">2026-02-04 21:45:01</span>
                        <span className="w-24">LOCAL_HOST</span>
                        <span className="text-text">KERNEL_BOOT::INTEGRITY_CHECK_PASSED</span>
                    </div>
                    <div className="flex gap-6 opacity-60">
                        <span className="w-32">2026-02-04 21:46:12</span>
                        <span className="w-24">USER_01</span>
                        <span className="text-text">AUTH_PASETO_TOKEN_GENERATED</span>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button className="flex items-center gap-3 px-6 py-3 border-2 border-border text-[9px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-hard">
                        <FileText className="w-4 h-4" /> EXPORT_AUDIT_MANIFEST
                    </button>
                </div>
            </div>

            <SovereignModal 
                isOpen={showRecovery} 
                onClose={() => setShowRecovery(false)} 
                title="RECOVERY_KEY_MANIFEST"
                icon={<Key className="w-6 h-6" />}
            >
                <div className="space-y-8 py-4">
                    <div className="p-6 bg-accent/5 border-2 border-accent border-dashed text-center">
                        <p className="text-[10px] font-black text-subtext uppercase tracking-[0.2em] mb-4">EMERGENCY_ACCESS_SEQUENCE</p>
                        <span className="text-xl font-black text-text tracking-widest break-all font-mono select-all">
                            {recoveryKey}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 bg-accent text-base flex items-center justify-center font-black text-[10px] shrink-0 mt-1">!</div>
                            <p className="text-[10px] font-black text-text uppercase leading-relaxed tracking-widest">
                                This key is the ONLY way to recover your data if you lose your Master Key. It is never stored on the kernel.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            const blob = new Blob([recoveryKey], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'cadmus_recovery_key.txt';
                            a.click();
                        }}
                        className="w-full py-4 bg-accent text-base font-black uppercase text-xs tracking-[0.2em] shadow-hard flex items-center justify-center gap-3"
                    >
                        <Download className="w-4 h-4" /> DOWNLOAD_BACKUP_TOKEN
                    </button>
                </div>
            </SovereignModal>
        </div>
    );
};