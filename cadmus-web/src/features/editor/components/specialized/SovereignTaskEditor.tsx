import { Activity, AlertCircle, ArrowLeft, BarChart3, CheckSquare, ChevronRight, User, ListTodo } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '../../../auth/authStore';
import { dataService, DocumentMeta } from '../../../../kernel/data/DataServiceProvider';
import { SovereignActionList } from '../../../../kernel/behavior/SovereignActionList';
import { SmartField } from '../inputs/SmartField';
import { TagManager } from '../inputs/TagManager';
import { useYjsSync } from '../../hooks/useYjsSync';
import { useTiptapConfig } from '../../hooks/useTiptapConfig';
import { EditorContent } from '@tiptap/react';

interface TaskEditorProps {
    docId: string;
}

export function SovereignTaskEditor({ docId }: TaskEditorProps) {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const [doc, setDoc] = useState<DocumentMeta | null>(null);
    const [parent, setParent] = useState<DocumentMeta | null>(null);
    const [loading, setLoading] = useState(true);

    // Yjs Sync for sub-tasks content
    const { ydoc, provider } = useYjsSync(docId);
    const editor = useTiptapConfig({ ydoc, provider, user });

    useEffect(() => {
        if (!docId || !user) return;

        const fetchData = async () => {
            try {
                const docData = await dataService.getDoc(docId);
                setDoc(docData);

                if (docData.parent_id) {
                    const p = await dataService.getDoc(docData.parent_id);
                    setParent(p);
                }
            } catch (err) {
                console.error("[TaskEditor] Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [docId, user]);

    if (loading || !doc) return (
        <div className="h-full flex flex-col items-center justify-center bg-base gap-6 font-ui">
            <div className="p-4 border-2 border-accent shadow-hard animate-pulse">
                <CheckSquare className="w-10 h-10 animate-bounce text-accent" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Analyzing_Task_Parameters...</span>
        </div>
    );

    const properties = doc.properties || {};
    const progress = Number(properties.progress) || 0;
    const status = properties.status || 'todo';

    const handleProgressChange = (newProgress: number) => {
        let newStatus = status;
        if (newProgress === 0) newStatus = 'todo';
        else if (newProgress === 100) newStatus = 'done';
        else if (status === 'todo' || status === 'done') newStatus = 'doing';

        setDoc((prev: DocumentMeta | null) => prev ? { ...prev, properties: { ...prev.properties, progress: newProgress, status: newStatus } } : null);
        dataService.updateProperty(docId, "progress", newProgress);
        if (newStatus !== status) {
            dataService.updateProperty(docId, "status", newStatus);
        }
    };

    return (
        <div className="min-h-full bg-base p-12 font-ui animate-in fade-in duration-500 selection:bg-accent/20">
            <div className="max-w-5xl mx-auto flex flex-col gap-12">
                
                {/* Header */}
                <header className="flex justify-between items-start border-b-4 border-border pb-10">
                    <div className="flex gap-8 items-center">
                        <div className="p-4 bg-accent text-base shadow-hard">
                            <CheckSquare className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 border border-accent/20 uppercase tracking-widest">Task_Artifact</span>
                                {parent && (
                                    <>
                                        <ChevronRight className="w-3 h-3 opacity-30" />
                                        <span 
                                            onClick={() => navigate(`/editor/${parent.id}`)}
                                            className="text-[10px] font-black text-subtext hover:text-accent cursor-pointer uppercase tracking-widest"
                                        >
                                            PARENT::{parent.title}
                                        </span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-6xl font-black uppercase tracking-tighter text-text leading-none">{doc.title}</h1>
                            <div className="pt-4">
                                <TagManager docId={docId} localTags={properties.tags || []} onUpdate={(tags) => dataService.updateProperty(docId, "tags", tags)} />
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border-2 border-border text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-hard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </header>

                {/* Sub-tasks / Content Area */}
                <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3 border-b-2 border-border pb-2">
                        <ListTodo className="w-4 h-4" /> Action_Manifest
                    </h3>
                    <div className="p-10 bg-surface border-2 border-border shadow-hard min-h-[300px]">
                        <EditorContent editor={editor} className="font-content prose-base focus:outline-none" />
                    </div>
                </section>

                {/* Task Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-surface border-2 border-border shadow-hard space-y-4">
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Operational_State</span>
                        <div className="flex items-center gap-4">
                            <div className={clsx(
                                "w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_currentColor]",
                                status === 'done' ? "text-terminal-green bg-current" : 
                                status === 'doing' ? "text-terminal-yellow bg-current" : "text-subtext bg-current"
                            )} />
                            <span className="text-3xl font-black uppercase tracking-tighter">{status}</span>
                        </div>
                    </div>

                    <div className="p-8 bg-surface border-2 border-border shadow-hard space-y-4 col-span-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Completion_Vector</span>
                            <span className="text-2xl font-black">{progress}%</span>
                        </div>
                        <div className="w-full h-4 bg-base border-2 border-border relative overflow-hidden">
                            <div 
                                className="h-full bg-accent transition-all duration-700 shadow-[0_0_15px_var(--color-accent)]" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                    </div>
                </div>

                {/* Configuration Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3 border-b-2 border-border pb-2">
                                <BarChart3 className="w-4 h-4" /> State_Control
                            </h3>
                            <SovereignActionList classId="task" docId={docId} properties={properties} />
                        </div>

                        <div className="p-8 bg-surface border-2 border-border shadow-hard space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-subtext tracking-widest border-b border-border pb-2 opacity-60">Linear_Progress_Input</h4>
                            <div className="space-y-4">
                                <input 
                                    type="range" 
                                    min="0" max="100" step="5"
                                    value={progress}
                                    onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                                    className="w-full accent-accent h-2 bg-base border border-border appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[8px] font-black text-subtext/40 tracking-widest">
                                    <span>0%_INITIAL</span>
                                    <span>50%_BUFFER</span>
                                    <span>100%_TERMINATED</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border/10">
                                <SmartField docId={docId} field={{ key: 'due_date', type: 'date', label: 'TERMINATION_DATE' }} initialValue={properties.due_date} />
                                <SmartField docId={docId} field={{ key: 'priority', type: 'select', label: 'EXECUTION_PRIORITY', options: ['low', 'medium', 'high', 'critical'] }} initialValue={properties.priority} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3 border-b-2 border-border pb-2">
                                <Activity className="w-4 h-4" /> System_Registry
                            </h3>
                            <div className="p-8 bg-accent/5 border-2 border-accent/20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 text-accent" />
                                    <span className="text-[10px] font-black uppercase text-accent tracking-widest">Operator_Note</span>
                                </div>
                                <p className="text-xs text-subtext leading-relaxed italic">
                                    "This node represents a discrete unit of execution. Progress updates are automatically propagated to parental project manifests. Blocked status is a temporary bypass."
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Meta */}
                <footer className="mt-auto pt-12 flex justify-between items-center opacity-20 border-t border-border/10">
                    <div className="flex items-center gap-4">
                        <User className="w-4 h-4" />
                        {user && <span className="text-[8px] font-black uppercase tracking-[0.4em]">Authored_By::OPERATOR_0x{user.id.slice(0,4).toUpperCase()}</span>}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em]">SOVEREIGN_TASK_PROTOCOL_v1.0</span>
                </footer>
            </div>
        </div>
    );
}
