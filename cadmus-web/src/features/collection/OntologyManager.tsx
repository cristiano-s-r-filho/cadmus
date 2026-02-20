import React, { useState, useEffect } from 'react';
import { Box, Info, Zap, ChevronRight, Layers, FileText, Folder, Table, Activity, BookOpen, PenTool, Database, Lightbulb } from 'lucide-react';
import { dataService, Archetype } from '../../kernel/data/DataServiceProvider';
import { useAuthStore } from '../auth/authStore';
import { ClassIcon } from '../../design-system/ClassIcon';
import { clsx } from 'clsx';

const CLASS_DESCRIPTIONS: Record<string, { desc: string; usage: string }> = {
    'note': {
        desc: "A generic container for unstructured text and ideas. The fundamental atom of the knowledge base.",
        usage: "Use for quick thoughts, meeting minutes, drafts, or any content that doesn't fit into a structured workflow."
    },
    'task': {
        desc: "A discrete unit of work with a defined state and completion criteria. Supports sub-tasks and progress tracking.",
        usage: "Use to track actionable items. Link tasks to Projects to automatically aggregate progress."
    },
    'project': {
        desc: "A high-level aggregator for tasks and resources. Automatically calculates progress based on child tasks.",
        usage: "Use to manage complex initiatives. Projects provide a dashboard view of all related tasks, assets, and notes."
    },
    'container': {
        desc: "A physical or logical storage unit. Tracks inventory capacity and location.",
        usage: "Use to represent boxes, shelves, rooms, or digital folders that contain Assets or other items."
    },
    'asset': {
        desc: "A valuable resource or item. Tracks value, category, and location.",
        usage: "Use for inventory items, equipment, or digital assets. Place Assets inside Containers."
    },
    'ledger': {
        desc: "A financial aggregator. Sums up the value of linked assets or entries.",
        usage: "Use to track financial health, budget usage, or total inventory value. Aggregates values from child documents."
    },
    'profile': {
        desc: "A representation of a user or entity within the system.",
        usage: "Use to store contact information, roles, and preferences for system users."
    },
    'folha': {
        desc: "A specialized spreadsheet for fortune and probability calculations.",
        usage: "Use for advanced data modelling, randomization tables, or structured data sets."
    }
};

export function OntologyManager() {
    const [archetypes, setArchetypes] = useState<Archetype[]>([]);
    const [selected, setSelected] = useState<string>('note');
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        dataService.getArchetypes().then(setArchetypes).catch(console.error);
    }, []);

    const groups = ['primitiva', 'operacional', 'recursos', 'dados'];

    return (
        <div className="p-12 max-w-7xl mx-auto flex flex-col gap-12 font-sans selection:bg-accent/20">
            <header className="flex flex-col gap-4 border-b-2 border-accent/10 pb-8">
                <div className="flex items-center gap-4 text-accent">
                    <Database className="w-8 h-8" />
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-text">Registry of Forms</h1>
                </div>
                <p className="text-sm text-subtext max-w-2xl font-serif italic">
                    The ontological definitions governing the structure and behavior of your knowledge artifacts.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* SIDEBAR: CLASS LIST */}
                <aside className="lg:col-span-4 flex flex-col gap-8">
                    {groups.map(group => {
                        const items = archetypes.filter(a => (a as any).group_id === group);
                        if (items.length === 0) return null;

                        return (
                            <div key={group} className="flex flex-col gap-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-subtext pl-2 border-l-2 border-accent/20">
                                    {group}
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {items.map(arch => (
                                        <button
                                            key={arch.id}
                                            onClick={() => setSelected(arch.id)}
                                            className={clsx(
                                                "group flex items-center justify-between p-3 rounded-lg transition-all border",
                                                selected === arch.id 
                                                    ? "bg-white border-accent shadow-md translate-x-2" 
                                                    : "bg-transparent border-transparent hover:bg-white hover:border-border hover:shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    "p-2 rounded-md transition-colors",
                                                    selected === arch.id ? "bg-accent text-white" : "bg-mantle text-subtext group-hover:text-text"
                                                )}>
                                                    <ClassIcon classId={arch.id} className="w-4 h-4" />
                                                </div>
                                                <span className={clsx(
                                                    "text-sm font-bold uppercase tracking-wide",
                                                    selected === arch.id ? "text-text" : "text-subtext group-hover:text-text"
                                                )}>{arch.name}</span>
                                            </div>
                                            {(arch as any).required_tier === 'PRO' && (
                                                <span className="text-[8px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded">PRO</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </aside>

                {/* MAIN: CLASS DETAILS */}
                <main className="lg:col-span-8 flex flex-col gap-8">
                    {selected && archetypes.find(a => a.id === selected) && (
                        <>
                            <div className="p-8 bg-white border border-border rounded-xl shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <ClassIcon classId={selected} className="w-64 h-64 text-text" />
                                </div>
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className="flex items-start justify-between">
                                        <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center shadow-lg">
                                            <ClassIcon classId={selected} className="w-8 h-8" />
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 rounded-full border border-border bg-mantle text-[10px] font-black uppercase text-subtext tracking-widest">
                                                ID: {selected}
                                            </span>
                                            <span className="px-3 py-1 rounded-full border border-border bg-mantle text-[10px] font-black uppercase text-subtext tracking-widest">
                                                GROUP: {(archetypes.find(a => a.id === selected) as any).group_id}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h2 className="text-3xl font-serif font-bold text-text uppercase tracking-wide mb-4">
                                            {archetypes.find(a => a.id === selected)?.name}
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="flex gap-3 text-sm text-subtext leading-relaxed bg-mantle/50 p-4 rounded-lg border border-border">
                                                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                                <p>{CLASS_DESCRIPTIONS[selected]?.desc || "No description available."}</p>
                                            </div>
                                            <div className="flex gap-3 text-sm text-subtext leading-relaxed bg-mantle/50 p-4 rounded-lg border border-border">
                                                <Lightbulb className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                                <p><span className="font-bold text-text uppercase text-xs">Usage:</span> {CLASS_DESCRIPTIONS[selected]?.usage || "Standard usage."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* STRUCTURE CARD */}
                                <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col gap-4">
                                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                                        <Layers className="w-5 h-5 text-subtext" />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-text">Data Structure</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {(archetypes.find(a => a.id === selected)?.ui_schema as any[])?.map((field: any) => (
                                            <div key={field.key} className="flex items-center justify-between p-3 bg-mantle rounded-lg border border-transparent hover:border-border transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-text uppercase">{field.label}</span>
                                                    <span className="text-[9px] font-mono text-subtext">{field.key}</span>
                                                </div>
                                                <span className="text-[9px] font-black bg-white border border-border px-2 py-1 rounded uppercase text-subtext">
                                                    {field.type}
                                                </span>
                                            </div>
                                        ))}
                                        {(!archetypes.find(a => a.id === selected)?.ui_schema || (archetypes.find(a => a.id === selected)?.ui_schema as any[]).length === 0) && (
                                            <div className="py-8 text-center opacity-40 text-xs font-serif italic text-subtext">
                                                No structured metadata fields defined.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* BEHAVIOR CARD */}
                                <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col gap-4">
                                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                                        <Zap className="w-5 h-5 text-accent" />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-text">Active Behaviors</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(archetypes.find(a => a.id === selected)?.behavior_rules || {}).map(([rule, value]) => (
                                            <div key={rule} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/10">
                                                <span className="text-xs font-bold text-accent uppercase tracking-tight">{rule.replace(/_/g, ' ')}</span>
                                                <span className="text-[9px] font-black bg-white text-accent px-2 py-1 rounded border border-accent/20">ACTIVE</span>
                                            </div>
                                        ))}
                                        {(Object.keys(archetypes.find(a => a.id === selected)?.behavior_rules || {}).length === 0) && (
                                            <div className="py-8 text-center opacity-40 text-xs font-serif italic text-subtext">
                                                Standard passive document behavior.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}