import { List, Save, Users, Maximize2 } from 'lucide-react';
import { clsx } from 'clsx';

export const EditorSettings = () => {
    const settings = [
        { 
            key: 'line_numbers', 
            label: 'Technical_Gutter', 
            desc: 'Real-time vertical coordinate referencing.', 
            icon: List,
            active: true 
        },
        { 
            key: 'auto_save', 
            label: 'Sovereign_Sync_Link', 
            desc: 'Continuous byte-stream persistence to Kernel.', 
            icon: Save,
            active: true 
        },
        { 
            key: 'ghost_cursors', 
            label: 'Operator_Presence', 
            desc: 'Multi-operator awareness signals.', 
            icon: Users,
            active: false 
        },
        { 
            key: 'focus_mode', 
            label: 'Focus_Protocol_Alpha', 
            desc: 'Subsystem isolation for deep cognitive work.', 
            icon: Maximize2,
            active: false 
        }
    ];

    return (
        <div className="flex flex-col gap-12 font-ui animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Editor_Environment_Matrix</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {settings.map((s) => (
                        <div key={s.key} className="flex items-center justify-between p-8 border-2 border-border bg-muted/20 shadow-hard hover:border-accent group transition-all">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-base border-2 border-border group-hover:border-accent transition-all">
                                    <s.icon className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-black text-xs text-text uppercase tracking-widest">{s.label}</span>
                                    <span className="text-[9px] text-subtext uppercase tracking-widest opacity-60">{s.desc}</span>
                                </div>
                            </div>
                            <button className={clsx(
                                "px-6 py-2 text-[9px] font-black uppercase border-2 shadow-hard transition-all active:translate-y-0.5 active:shadow-none",
                                s.active 
                                    ? "bg-accent text-base border-accent" 
                                    : "border-border text-subtext hover:border-text hover:text-text"
                            )}>
                                {s.active ? 'ACTIVE_LINK' : 'OFFLINE_MODE'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};