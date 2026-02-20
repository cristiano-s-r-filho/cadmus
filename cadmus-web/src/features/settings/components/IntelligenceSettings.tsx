import { GitMerge, Activity, Cpu } from 'lucide-react';

export const IntelligenceSettings = () => {
    return (
        <div className="flex flex-col gap-12 font-ui animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Logic_Engine_Parameters</h3>
                </div>
                
                <div className="flex items-center justify-between p-8 border-2 border-border bg-muted/20 shadow-hard relative overflow-hidden group">
                    <div className="flex flex-col gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-text flex items-center gap-3">
                            <GitMerge className="w-4 h-4 text-accent" /> Flow_Sensitivity
                        </span>
                        <span className="text-[9px] text-subtext uppercase tracking-widest opacity-60">Delay_Sync_Propagation::Ms</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 border border-accent/20">500_MS</span>
                        <input type="range" className="w-32 accent-accent bg-border h-1.5 appearance-none cursor-pointer" />
                    </div>
                </div>

                <div className="flex items-center justify-between p-8 border-2 border-border bg-muted/20 shadow-hard">
                    <div className="flex flex-col gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-text flex items-center gap-3">
                            <Activity className="w-4 h-4 text-accent" /> Conflict_Resolution
                        </span>
                        <span className="text-[9px] text-subtext uppercase tracking-widest opacity-60">Distributed_State_Convergence_Strategy</span>
                    </div>
                    <select className="bg-base border-2 border-border px-4 py-2 text-[10px] font-black text-text uppercase tracking-widest outline-none focus:border-accent transition-all">
                        <option>LAST_WRITE_WINS</option>
                        <option>MANUAL_INTERVENTION</option>
                        <option>FORK_AND_MERGE</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-b-2 border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-subtext">Neural_Subsystem_Status</h3>
                </div>
                <div className="bg-base border-2 border-border p-8 min-h-[240px] flex items-center justify-center relative shadow-inner">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent animate-pulse" />
                        <span className="text-[8px] font-black text-accent uppercase tracking-tighter">Live_Telemetry</span>
                    </div>
                    <div className="text-center space-y-4">
                        <Cpu className="w-12 h-12 text-border mx-auto opacity-40" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Neural_Synapse_Core::Offline</p>
                            <p className="text-[8px] font-black text-subtext uppercase tracking-[0.3em] opacity-50">Local_Model_Cache::Empty</p>
                        </div>
                        <button className="px-8 py-3 bg-accent text-base text-[10px] font-black uppercase tracking-[0.2em] shadow-hard active:translate-y-1 active:shadow-none transition-all">
                            INITIALIZE_LOCAL_MODEL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};