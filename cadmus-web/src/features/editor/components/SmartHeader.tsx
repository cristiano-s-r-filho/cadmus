import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { Archetype, dataService } from '../../../kernel/data/DataServiceProvider';
import { ClassIcon } from '../../../design-system/ClassIcon';
import { SmartField } from './inputs/SmartField';
import { TagManager } from './inputs/TagManager';
import { useAuthStore } from '../../auth/authStore';
import { SovereignActionList } from '../../../kernel/behavior/SovereignActionList';
import { getActionsForClass } from '../../../kernel/behavior/BehaviorRegistry';
import { clsx } from 'clsx';

interface SmartHeaderProps {
    docId: string;
    classId?: string;
    title: string;
    ydoc?: Y.Doc;
}

export function SmartHeader({ docId, classId, title, ydoc }: SmartHeaderProps) {
    const [archetype, setArchetype] = useState<Archetype | null>(null);
    const [properties, setProperties] = useState<Record<string, any>>({});
    const [isPulse, setIsPulse] = useState(false);
    const { user, vaultSecret } = useAuthStore();
    
    const propsRef = useRef<Record<string, any>>({});

    useEffect(() => {
        if (!classId) return;
        dataService.getArchetypes().then(list => {
            const found = list.find(a => a.id === classId);
            if (found) {
                let schema = found.ui_schema;
                if (typeof schema === 'string') {
                    try { schema = JSON.parse(schema); } catch(e) { console.error("Failed to parse ui_schema", e); }
                }
                setArchetype({ ...found, ui_schema: schema as any });
            }
        });
    }, [classId]);

    // AUTO-AGGREGATION TRIGGER
    useEffect(() => {
        if (classId === 'ledger' && user?.token && vaultSecret) {
            const timer = setTimeout(async () => {
                try {
                    const aggregateAction = getActionsForClass('ledger').find((a: any) => a.id === 'aggregate_balance');
                    if (aggregateAction) {
                        console.log("[SmartHeader] Triggering Auto-Aggregation...");
                        const result = await aggregateAction.execute(docId, user.id, properties, vaultSecret);
                        if (ydoc && result?.key) {
                            ydoc.getMap('properties').set(result.key, result.value);
                        }
                    }
                } catch (err) {
                    console.error("[SmartHeader] Auto-aggregation failed", err);
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [docId, classId, user?.token, user?.id, vaultSecret]);

    useEffect(() => {
        if (!user || !docId) return;
        
        dataService.getDoc(docId).then(doc => {
            if (doc && (doc as any).properties) {
                const dbProps = (doc as any).properties;
                console.log(`[SmartHeader] DB Props:`, dbProps);
                
                const merged = { ...dbProps, ...propsRef.current };
                propsRef.current = merged;
                setProperties(merged);

                if (ydoc) {
                    const propsMap = ydoc.getMap('properties');
                    Object.entries(dbProps).forEach(([k, v]) => {
                        if (!propsMap.has(k)) propsMap.set(k, v);
                    });
                }
            }
        }).catch(console.error);

        if (ydoc) {
            const propsMap = ydoc.getMap('properties');
            const observer = (event: Y.YMapEvent<any>) => {
                console.log(`%c [SmartHeader] Yjs Sync: ${Array.from(event.keys.keys()).join(', ')}`, "color: #AF3A03; font-weight: bold");
                const updated = propsMap.toJSON();
                const final = { ...propsRef.current, ...updated };
                propsRef.current = final;
                setProperties(final);
                setIsPulse(true);
                setTimeout(() => setIsPulse(false), 600);
            };
            propsMap.observe(observer);
            return () => propsMap.unobserve(observer);
        }
    }, [docId, user, ydoc]);

    const handleTagsUpdate = async (newTags: string[]) => {
        if (ydoc) { ydoc.getMap('properties').set('tags', newTags); }
        await dataService.updateProperty(docId, "tags", newTags, user?.id);
    };

    if (!classId || !archetype) {
        return <div className="mb-8"><h1 className="text-5xl font-black uppercase tracking-tighter text-text leading-none">{title}</h1></div>;
    }

    return (
        <div className="mb-12 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 font-sans">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className={clsx("p-3 bg-accent/10 border-2 border-accent rounded-2xl shadow-hard transition-all", isPulse && "scale-110")}>
                        <ClassIcon classId={classId} className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{archetype.name}</span>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-text leading-none">{title}</h1>
                    </div>
                </div>
            </div>

            <SovereignActionList classId={classId} docId={docId} properties={properties} ydoc={ydoc} />

            <div className="px-2 py-1 border-y border-accent-border/20">
                <TagManager docId={docId} localTags={properties.tags || []} onUpdate={handleTagsUpdate} />
            </div>

            <div className={clsx("flex flex-col gap-1 py-4 border-l-2 border-accent/10 ml-1 transition-all", isPulse && "border-accent")}>
                {archetype?.ui_schema?.map((field: any) => (
                    <div key={field.key} className="flex items-center gap-4 px-4 hover:bg-accent/5 transition-colors rounded-r-xl">
                        <SmartField docId={docId} field={field} initialValue={properties[field.key]} ydoc={ydoc} />
                    </div>
                ))}
            </div>
        </div>
    );
}