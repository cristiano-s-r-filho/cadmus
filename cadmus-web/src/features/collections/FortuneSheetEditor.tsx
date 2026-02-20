import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, Info, Loader2, Save, Table } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../auth/authStore';
import { CommentsSidebar } from '../editor/components/CommentsSidebar';
import { RegistryBar } from '../editor/components/RegistryBar';
import { TableOfContents } from '../editor/components/TableOfContents';
import { useYjsSync } from '../editor/hooks/useYjsSync';
import { dataService } from '../../kernel/data/DataServiceProvider';
import { useTranslation } from '../../kernel/i18n';
import { FortuneSheetUtils } from './FortuneSheetUtils';
import { TagManager } from '../editor/components/inputs/TagManager';

interface SheetProps {
    docId: string;
}

export function FortuneSheetEditor({ docId }: SheetProps) {
    const { t } = useTranslation();
    const user = useAuthStore(state => state.user);
    const SNAPSHOT_HEADER = "CADMUS_SHEET_V1:";
    
    const [initialData, setInitialData] = useState<any>(null);
    const dataRef = useRef<any>(null); 
    const [title, setTitle] = useState("Loading...");
    const [properties, setProperties] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showComments, setShowComments] = useState(false);
    const [showToC, setShowToC] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { ydoc, status } = useYjsSync(docId);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event('resize'));
            });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [showComments, showToC]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const doc = await dataService.getDoc(docId);
                if (isMounted) {
                    setTitle(doc.title);
                    setProperties((doc as any).properties || {});
                }

                const snapshot = await dataService.getLatestUpdate(docId);
                if (isMounted) {
                    const defaultSheet = [{ name: "Sheet1", celldata: [], order: 0, status: 1 }];
                    
                    if (snapshot && snapshot.length > 0) {
                        const bytes = new Uint8Array(snapshot);
                        try {
                            const rawStr = new TextDecoder().decode(bytes);
                            let parsed: any = null;

                            if (rawStr.startsWith(SNAPSHOT_HEADER)) {
                                const jsonContent = rawStr.replace(SNAPSHOT_HEADER, "");
                                parsed = JSON.parse(jsonContent);
                            } else {
                                const cleanedStr = rawStr.substring(rawStr.indexOf('[')) || rawStr.substring(rawStr.indexOf('{'));
                                if (cleanedStr) {
                                    parsed = JSON.parse(cleanedStr.trim());
                                } else {
                                    throw new Error("No JSON found");
                                }
                            }

                            if (parsed && Array.isArray(parsed)) {
                                const decompressed = FortuneSheetUtils.decompressWorkbook(parsed);
                                setInitialData(decompressed);
                                dataRef.current = decompressed;
                            } else {
                                throw new Error("Invalid structure");
                            }
                        } catch (e) {
                            setInitialData(defaultSheet);
                            dataRef.current = defaultSheet;
                        }
                    } else {
                        setInitialData(defaultSheet);
                        dataRef.current = defaultSheet;
                    }
                }
            } catch (e) {
                console.error("[Sheet] Core load error", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [docId]);

    const handleTagsUpdate = async (newTags: string[]) => {
        setProperties((prev: any) => ({ ...prev, tags: newTags }));
        await dataService.updateProperty(docId, "tags", newTags);
    };

    const handleSaveSnapshot = async () => {
        const rawData = dataRef.current;
        if (!rawData) return;
        setSaving(true);
        setSaveStatus('idle');
        try {
            const compressedData = FortuneSheetUtils.compressWorkbook(rawData);
            const jsonString = SNAPSHOT_HEADER + JSON.stringify(compressedData);
            const bytes = new TextEncoder().encode(jsonString);
            await dataService.pushUpdate(docId, Array.from(bytes));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (e) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        if (newTitle !== title) {
            setTitle(newTitle);
            await dataService.updateProperty(docId, 'title', newTitle);
        }
    };

    const sheetList = useMemo(() => {
        return dataRef.current?.map((s: any) => ({
            name: s.name || "UNTITLED_STREAM",
            id: s.id || Math.random().toString()
        })) || [];
    }, [dataRef.current, loading]);

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-base gap-6">
            <div className="p-4 border-2 border-accent shadow-hard animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
            <span className="font-ui text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Grid_Logic_Engine::Booting</span>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-base overflow-hidden font-ui" ref={containerRef}>
            <RegistryBar 
                status={status} 
                integrity={1.0} 
                onToggleToC={() => setShowToC(!showToC)}
                onToggleComments={() => setShowComments(!showComments)}
                showToC={showToC}
                showComments={showComments}
                activeUsers={[]}
            />

            <header className="h-20 bg-surface border-b-2 border-border flex items-center justify-between px-8 shrink-0 shadow-sm relative z-10">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-accent text-base shadow-hard">
                        <Table className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <input 
                            className="bg-transparent font-black uppercase tracking-tighter text-xl text-text outline-none focus:border-b-2 border-accent/20 w-96"
                            defaultValue={title}
                            onBlur={handleTitleBlur}
                        />
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black bg-accent text-base px-2 py-0.5 uppercase tracking-widest flex items-center gap-1.5 shadow-hard">
                                <Info className="w-2.5 h-2.5" /> LEGACY_GRID_V1
                            </span>
                            <div className="h-4 w-px bg-border/30 mx-1" />
                            <TagManager 
                                docId={docId} 
                                localTags={properties.tags || []} 
                                onUpdate={handleTagsUpdate} 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    {saveStatus === 'success' && <span className="text-[10px] font-black text-accent flex items-center gap-2 animate-in fade-in uppercase tracking-widest bg-accent/5 px-3 py-1 border border-accent/20 shadow-hard"><CheckCircle2 className="w-3.5 h-3.5" /> Committed_To_Kernel</span>}
                    {saveStatus === 'error' && <span className="text-[10px] font-black text-accent flex items-center gap-2 animate-bounce uppercase tracking-widest bg-accent/5 px-3 py-1 border border-accent/20 shadow-hard"><AlertTriangle className="w-3.5 h-3.5" /> Signal_Lost</span>}
                    
                    <button 
                        className={clsx(
                            "flex items-center gap-3 px-8 h-12 bg-accent text-base font-black uppercase text-[10px] tracking-[0.2em] shadow-hard active:translate-y-1 active:shadow-none transition-all disabled:opacity-50",
                            saving && "animate-pulse"
                        )}
                        disabled={saving}
                        onClick={handleSaveSnapshot}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Commit_Data_Stream
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden bg-base relative">
                <div className="flex-1 relative overflow-hidden border-2 border-border/30 m-4 shadow-inner">
                    {initialData && (
                        <Workbook 
                            data={initialData} 
                            onChange={(newData: any) => { dataRef.current = newData; }}
                            lang="en"
                        />
                    )}
                </div>
                {showToC && <div className="w-64 border-l-2 border-border bg-muted/20"><TableOfContents sheets={sheetList} /></div>}
                {showComments && <div className="w-80 border-l-2 border-border bg-muted/20"><CommentsSidebar editor={null} ydoc={ydoc} /></div>}
            </div>
        </div>
    );
}