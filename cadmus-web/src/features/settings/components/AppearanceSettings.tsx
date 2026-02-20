import { useThemeStore } from '../../../kernel/themeStore';
import { clsx } from 'clsx';
import { Type, BoxSelect, ScanLine } from 'lucide-react';

export const AppearanceSettings = () => {
    const { theme, font, effects, setTheme, setFont, toggleEffect } = useThemeStore();

    const themes = [
        { id: 'ivory', label: 'Ivory Tower', desc: 'Warm professional digital paper.' },
        { id: 'pulp', label: 'Pulp Fiction', desc: 'Vintage paperback high-contrast.' },
        { id: 'crt', label: 'CRT Phosphor', desc: 'Retro terminal green matrix.' },
        { id: 'vapor', label: 'Vapor Midnight', desc: 'Outrun futuristic synthwave.' }
    ];

    const fonts = [
        { id: 'mono', label: 'Monospace', desc: 'IBM Plex Mono' },
        { id: 'sans', label: 'Sans-Serif', desc: 'Inter' },
        { id: 'serif', label: 'Serif', desc: 'Lora' }
    ];

    return (
        <div className="flex flex-col gap-12 font-ui animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* THEME SELECTION */}
            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Visual_Kernel_Matrix</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {themes.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setTheme(item.id as any)}
                            className={clsx(
                                "flex flex-col gap-2 p-8 border-2 text-left transition-all relative overflow-hidden", 
                                theme === item.id 
                                    ? 'border-accent bg-accent/5 shadow-hard' 
                                    : 'border-border text-subtext hover:border-text group'
                            )}
                        >
                            {theme === item.id && (
                                <div className="absolute top-0 right-0 bg-accent text-base px-3 py-1 text-[8px] font-black uppercase tracking-tighter">
                                    ACTIVE_CORE
                                </div>
                            )}
                            <span className={clsx("font-black text-xs uppercase tracking-widest", theme === item.id ? "text-accent" : "group-hover:text-text")}>
                                {item.label}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider opacity-60">
                                {item.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* FONT SELECTION */}
            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-subtext">Typography_Engine</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {fonts.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setFont(item.id as any)}
                            className={clsx(
                                "p-6 border-2 text-left transition-all relative", 
                                font === item.id 
                                    ? 'border-accent bg-accent/5 shadow-hard' 
                                    : 'border-border text-subtext hover:border-text'
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Type className="w-4 h-4" />
                                <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                            </div>
                            <span className="text-[9px] font-mono opacity-60 block">{item.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* EFFECTS */}
            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-subtext">Post_Process_FX</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                        onClick={() => toggleEffect('texture')}
                        className={clsx(
                            "flex items-center justify-between p-6 border-2 transition-all",
                            effects.texture ? "border-accent bg-accent/5 shadow-hard" : "border-border opacity-60 hover:opacity-100"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <BoxSelect className="w-5 h-5" />
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-black uppercase tracking-tight">Analog_Noise</span>
                                <span className="text-[8px] uppercase tracking-widest opacity-60">Paper grain simulation</span>
                            </div>
                        </div>
                        <div className={clsx("w-3 h-3 rounded-full", effects.texture ? "bg-accent" : "bg-border")} />
                    </button>

                    <button 
                        onClick={() => toggleEffect('scanlines')}
                        className={clsx(
                            "flex items-center justify-between p-6 border-2 transition-all",
                            effects.scanlines ? "border-accent bg-accent/5 shadow-hard" : "border-border opacity-60 hover:opacity-100"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <ScanLine className="w-5 h-5" />
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-black uppercase tracking-tight">CRT_Interlace</span>
                                <span className="text-[8px] uppercase tracking-widest opacity-60">Cathode ray tube emulation</span>
                            </div>
                        </div>
                        <div className={clsx("w-3 h-3 rounded-full", effects.scanlines ? "bg-accent" : "bg-border")} />
                    </button>
                </div>
            </div>
        </div>
    );
};