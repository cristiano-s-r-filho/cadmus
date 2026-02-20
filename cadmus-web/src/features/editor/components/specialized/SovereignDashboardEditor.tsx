import { Activity, ArrowUpRight, BarChart3, Box, Database, Layout, Plus, Table } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ClassIcon } from '../../../../design-system/ClassIcon';
import { useAuthStore } from '../../../auth/authStore';
import { dataService, DocumentMeta, WorkspaceNode } from '../../../../kernel/data/DataServiceProvider';
import { SovereignActionList } from '../../../../kernel/behavior/SovereignActionList';
import { SmartField } from '../inputs/SmartField';
import { TagManager } from '../inputs/TagManager';
import { SpawnModal } from '../../../dashboard/components/SpawnModal';

interface DashboardEditorProps {
    docId: string;
}

export function SovereignDashboardEditor({ docId }: DashboardEditorProps) {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const [doc, setDoc] = useState<DocumentMeta | null>(null);
    const [children, setChildren] = useState<WorkspaceNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSpawnOpen, setIsSpawnOpen] = useState(false);

    useEffect(() => {
        if (!docId || !user) return;

        const fetchData = async () => {
            try {
                const docData = await dataService.getDoc(docId);
                setDoc(docData);

                const allDocs = await dataService.getAllDocs(user.id);
                const childNodes = allDocs.filter(d => d.parent_id === docId);
                setChildren(childNodes);
            } catch (err) {
                console.error("[DashboardEditor] Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [docId, user, isSpawnOpen]);

    if (loading || !doc) return (
        <div className="h-full flex flex-col items-center justify-center bg-base gap-6 font-ui">
            <div className="p-4 border-2 border-accent shadow-hard animate-pulse">
                <Database className="w-10 h-10 animate-spin text-accent" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing_Subsystem_Runtime...</span>
        </div>
    );

    const classId = doc.class_id || 'container';
    const properties = doc.properties || {};

    const renderMetrics = () => {
        switch (classId) {
            case 'project':
                const progress = properties.progress || 0;
                return (
                    <div className="p-8 bg-surface border-2 border-border shadow-hard flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Project_Velocity</span>
                                <span className="text-5xl font-black text-text tracking-tighter">{progress}%</span>
                            </div>
                            <span className="text-[9px] font-black text-subtext uppercase tracking-widest opacity-40">Aggregate_Metrics</span>
                        </div>
                        <div className="w-full h-3 bg-base border-2 border-border shadow-inner relative overflow-hidden">
                            <div 
                                className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_15px_var(--color-accent)]" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                    </div>
                );
            case 'ledger':
                const balance = properties.balance || 0;
                return (
                    <div className="p-8 bg-surface border-2 border-border shadow-hard flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Table className="w-32 h-32" />
                        </div>
                        <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Net_Asset_Valuation</span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-black text-subtext opacity-40">$</span>
                                <span className="text-6xl font-black text-text tracking-tighter">
                                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="p-8 bg-surface border-2 border-border shadow-hard flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Inventory_Capacity</span>
                            <span className="text-5xl font-black text-text tracking-tighter">{children.length}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 opacity-40">
                            <span className="text-[9px] font-black text-subtext uppercase tracking-widest text-right">Linked_Objects</span>
                            <Box className="w-8 h-8 text-border" />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-full bg-base p-12 font-ui animate-in fade-in duration-500 selection:bg-accent/20">
            <div className="max-w-6xl mx-auto flex flex-col gap-12">
                
                {/* 1. Header Section */}
                <header className="flex justify-between items-start border-b-4 border-border pb-10">
                    <div className="flex gap-8 items-center">
                        <div className="p-4 bg-accent text-base shadow-hard">
                            <ClassIcon classId={classId} className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 border border-accent/20 uppercase tracking-widest">Active_Node</span>
                                <span className="text-[10px] font-black text-subtext uppercase tracking-widest opacity-40">ID: 0x{doc.id.slice(0,12)}</span>
                            </div>
                            <h1 className="text-6xl font-black uppercase tracking-tighter text-text leading-none">{doc.title}</h1>
                            
                            <div className="pt-4">
                                <TagManager docId={docId} localTags={properties.tags || []} onUpdate={(tags) => dataService.updateProperty(docId, "tags", tags)} />
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(`/dashboard`)}
                        className="px-6 py-3 border-2 border-border text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-hard active:translate-y-1"
                    >
                        Term_Dashboard
                    </button>
                </header>

                {/* 2. Primary Metric */}
                {renderMetrics()}

                {/* 3. Logic Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3 border-b-2 border-border pb-2">
                            <BarChart3 className="w-4 h-4" /> Logic_Registry
                        </h3>
                        <SovereignActionList classId={classId} docId={docId} properties={properties} />
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3 border-b-2 border-border pb-2">
                            <Activity className="w-4 h-4" /> System_Registry
                        </h3>
                        <div className="p-6 bg-surface border-2 border-border shadow-hard space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-subtext tracking-widest border-b border-border pb-2 opacity-60">Node_Parameters</h4>
                            {doc.class_id === 'project' && (
                                <SmartField docId={docId} field={{ key: 'status', type: 'select', label: 'PROJECT_STATE', options: ['planning', 'active', 'paused', 'completed'] }} initialValue={properties.status} />
                            )}
                            {doc.class_id === 'ledger' && (
                                <SmartField docId={docId} field={{ key: 'status', type: 'badge', label: 'LEDGER_STATUS' }} initialValue={properties.status} />
                            )}
                            <SmartField docId={docId} field={{ key: 'priority', type: 'select', label: 'NODE_PRIORITY', options: ['low', 'medium', 'high', 'critical'] }} initialValue={properties.priority} />
                        </div>
                    </section>
                </div>

                {/* 4. Children Stream */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center border-b-2 border-border pb-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                            <Layout className="w-4 h-4" /> Relational_Stream
                        </h3>
                        <button 
                            onClick={() => setIsSpawnOpen(true)}
                            className="flex items-center gap-2 text-[10px] font-black text-accent hover:underline uppercase tracking-widest"
                        >
                            <Plus className="w-3.5 h-3.5" /> Initialize_Child_Node
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {children.length > 0 ? children.map(child => (
                            <div 
                                key={child.id}
                                onClick={() => navigate(`/editor/${child.id}`)}
                                className="group bg-surface border-2 border-border p-6 shadow-hard hover:border-accent hover:shadow-[0_0_15px_rgba(var(--color-accent),0.1)] transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-muted border-2 border-border text-subtext group-hover:text-accent group-hover:border-accent transition-all shadow-sm">
                                            <ClassIcon classId={child.class_id} className="w-5 h-5" />
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-border group-hover:text-accent transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-subtext uppercase tracking-[0.2em] opacity-40">{child.class_id}::NODE</span>
                                        <h4 className="text-sm font-black uppercase text-text tracking-tight group-hover:text-accent transition-colors">{child.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2 border-t border-border/20">
                                        {(child as any).properties?.status && (
                                            <span className="text-[8px] font-black px-2 py-0.5 bg-accent/5 border border-accent/20 text-accent uppercase tracking-widest">
                                                {(child as any).properties.status}
                                            </span>
                                        )}
                                        {(child as any).properties?.value && (
                                            <span className="text-[8px] font-black text-subtext uppercase tracking-widest ml-auto">
                                                VAL: ${(child as any).properties.value}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center border-2 border-border border-dashed opacity-20 flex flex-col items-center gap-4">
                                <Database className="w-12 h-12" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">No_Active_Signals_Detected_In_Stream</span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <SpawnModal isOpen={isSpawnOpen} onClose={() => setIsSpawnOpen(false)} initialParentId={docId} />
        </div>
    );
}
