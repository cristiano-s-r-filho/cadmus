import { Activity, AlertCircle, BarChart3, Clock, Database, Plus, Share2, ShieldCheck, Tag, Link2Off, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ClassIcon } from '../../design-system/ClassIcon';
import { useAuthStore } from '../auth/authStore';
import { SpawnModal } from './components/SpawnModal';
import { dataService } from '../../kernel/data/DataServiceProvider';
import { WorkspaceNode, SystemStats } from '../../kernel/data/IDataService';
import { useTranslation } from '../../kernel/i18n';

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [docs, setDocs] = useState<WorkspaceNode[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpawnOpen, setIsSpawnOpen] = useState(false);

  const refreshData = async () => {
    if (!user?.id) return;
    try {
        const [recentDocs, systemStats] = await Promise.all([
            dataService.getRecentDocs(user.id, 10),
            dataService.getSystemStats(user.id)
        ]);
        setDocs(recentDocs as any);
        setStats(systemStats);
        setLoading(false);
    } catch (e) {
        console.error("Dashboard Sync Fail", e);
    }
  };

  useEffect(() => { 
    if (user?.id) refreshData(); 
  }, [user?.id]);

  return (
    <div className="p-16 max-w-[1600px] mx-auto flex flex-col gap-16 font-ui selection:bg-accent/20 animate-in fade-in duration-700">
      <SpawnModal isOpen={isSpawnOpen} onClose={() => { setIsSpawnOpen(false); refreshData(); }} />

      {/* COMMAND HEADER */}
      <header className="flex justify-between items-end border-b-4 border-border pb-10">
        <div className="space-y-4">
            <h1 className="text-8xl font-black uppercase tracking-tighter text-text leading-[0.8]">Command<br/><span className="text-accent">Center</span></h1>
            <div className="flex items-center gap-8 pt-4">
                <div className="px-4 py-1.5 bg-accent text-base text-[10px] font-black uppercase tracking-[0.3em] shadow-hard">
                    Welcome, {user?.username}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-subtext opacity-60">
                    <Clock className="w-4 h-4" /> LOCAL_TIME::0x{new Date().getHours()}
                </div>
            </div>
        </div>
        <button 
            onClick={() => setIsSpawnOpen(true)} 
            className="h-12 px-8 bg-surface border-2 border-border shadow-hard hover:border-accent hover:text-accent transition-all font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 group active:translate-y-1 active:shadow-none"
        >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> 
            INITIALIZE_NODE
        </button>
      </header>

      {/* CORE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {[
            { label: 'Registered_Units', value: stats?.nodes, icon: Database },
            { label: 'Structural_Links', value: stats?.total_links, icon: Share2 },
            { label: '24h_Active_Pulse', value: `+${stats?.recent_activity_count}`, icon: Activity },
            { label: 'Integrity_Status', value: 'VERIFIED', icon: ShieldCheck, isStatus: true }
        ].map((m, i) => (
            <div key={i} className="bg-surface border-2 border-border p-8 flex flex-col gap-4 shadow-hard group hover:border-accent transition-all">
                <span className="text-[10px] font-black text-subtext uppercase tracking-widest flex items-center gap-3 group-hover:text-accent transition-colors">
                    <m.icon className="w-4 h-4" /> {m.label}
                </span>
                <div className="flex flex-col gap-1">
                  <div className={clsx(
                    "text-5xl lg:text-6xl font-black text-text tracking-tighter leading-none break-all",
                    m.isStatus && "text-accent"
                  )}>
                    {m.value ?? '---'}
                  </div>
                  {m.isStatus && (
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest opacity-60">SOVEREIGN_MODE_ACTIVE</span>
                  )}
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MIDDLE: KINETIC FEED (9 cols) */}
        <section className="lg:col-span-9 space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-accent flex items-center gap-3 border-b-2 border-border pb-2">
                <Activity className="w-4 h-4" /> KINETIC_FEED
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-24 text-center border-2 border-border border-dashed font-black uppercase opacity-20 text-[10px] tracking-widest animate-pulse">Syncing_Data_Sectors...</div>
                ) : docs.map(d => (
                    <div 
                        key={d.id} 
                        onClick={() => navigate(`/editor/${d.id}`)}
                        className="group bg-surface border-2 border-border p-6 flex items-center justify-between hover:border-accent hover:shadow-hard transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex items-center gap-6">
                            <div className="p-3 bg-muted border-2 border-border text-subtext group-hover:text-accent group-hover:border-accent transition-all shadow-hard">
                                <ClassIcon classId={d.class_id} className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-black text-lg uppercase text-text tracking-tighter group-hover:text-accent transition-colors">{d.title}</span>
                                <span className="text-[9px] font-black text-subtext opacity-40 uppercase tracking-widest">0x{d.id.slice(0,12)}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-accent opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                    </div>
                ))}
            </div>
        </section>

        {/* RIGHT: ATTENTION (3 cols) */}
        <section className="lg:col-span-3 space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-accent flex items-center gap-3 border-b-2 border-border pb-2">
                <AlertCircle className="w-4 h-4" /> ATTENTION
            </h2>
            
            <div className="flex flex-col gap-6">
                <div onClick={() => navigate('/library')} className="p-8 border-2 border-accent/20 bg-accent/5 flex flex-col gap-4 shadow-hard hover:border-accent transition-all cursor-pointer">
                    <div className="flex items-center gap-3 text-accent">
                        <Link2Off className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Orphan_Nodes</span>
                    </div>
                    <div className="text-5xl font-black text-text tracking-tighter">{stats?.orphan_nodes || 0}</div>
                    <p className="text-[9px] font-black text-subtext uppercase tracking-wider leading-relaxed opacity-60">Discovery_Failure_Risk::High</p>
                </div>

                <div onClick={() => navigate('/library')} className="p-8 border-2 border-accent/20 bg-accent/5 flex flex-col gap-4 shadow-hard hover:border-accent transition-all cursor-pointer">
                    <div className="flex items-center gap-3 text-accent">
                        <Tag className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Untagged_Units</span>
                    </div>
                    <div className="text-5xl font-black text-text tracking-tighter">{stats?.untagged_nodes || 0}</div>
                    <p className="text-[9px] font-black text-subtext uppercase tracking-wider leading-relaxed opacity-60">Search_Efficiency::Degraded</p>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
