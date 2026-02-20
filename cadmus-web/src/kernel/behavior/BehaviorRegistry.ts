import { Calculator, CheckCircle2, Archive, ShieldCheck } from 'lucide-react';
import { BehaviorAction, ActionRegistry } from './types';
import { dataService } from '../data/DataServiceProvider';
import { SovereignCrypto } from '../security/crypto';

const COMMON_ACTIONS: BehaviorAction[] = [
    {
        id: 'archive_node',
        label: 'Archive Artifact',
        icon: Archive,
        execute: async (docId) => {
            await dataService.updateProperty(docId, 'archived', true);
            return { key: 'archived', value: true };
        }
    }
];

export const BEHAVIOR_REGISTRY: ActionRegistry = {
    'note': [
        {
            id: 'seal_note',
            label: 'Apply Integrity Seal',
            icon: ShieldCheck,
            execute: async (docId, userId) => {
                const ts = new Date().toLocaleString();
                await dataService.updateProperty(docId, 'sealed_at', ts, userId);
                return { key: 'sealed_at', value: ts };
            }
        }
    ],
    'ledger': [
        {
            id: 'aggregate_balance',
            label: 'Recalculate Balance',
            icon: Calculator,
            execute: async (docId, userId, _props, vaultSecret) => {
                console.log(`[Behavior] Starting Sovereign Aggregation for Ledger: ${docId}`);
                const allDocs = await dataService.getAllDocs(userId);
                const children = allDocs.filter(d => d.parent_id === docId);
                
                let total = 0;
                for (const child of children) {
                    let val = (child as any).properties?.value;
                    if (val === undefined || val === null) continue;
                    
                    if (SovereignCrypto.isEncrypted(val) && vaultSecret) {
                        try {
                            const decrypted = await SovereignCrypto.decrypt(val, vaultSecret, userId);
                            val = decrypted;
                        } catch (e) { console.warn("Decryption failed", e); }
                    }

                    if (typeof val === 'string') {
                        val = val.replace(/[^0-9.]/g, '');
                    }

                    total += parseFloat(val) || 0;
                }

                console.log(`[Behavior] Aggregation Complete. Total: ${total}`);

                // SYNC CORE KEY: Matches the ui_schema defined in DB
                await dataService.updateProperty(docId, 'balance', total, userId);
                
                return { key: 'balance', value: total }; // Trigger reactive update for the visible field
            }
        }
    ],
    'task': [
        {
            id: 'cycle_status',
            label: 'Cycle Status',
            icon: CheckCircle2,
            execute: async (docId, userId, props) => {
                const current = (props.status || 'todo').toLowerCase();
                let next = 'todo';
                
                if (current === 'todo') next = 'doing';
                else if (current === 'doing') next = 'done';
                else next = 'todo';

                console.log(`[Behavior] Cycling Status: ${current} -> ${next}`);
                await dataService.updateProperty(docId, 'status', next, userId);
                return { key: 'status', value: next };
            }
        }
    ],
    'project': [
        {
            id: 'aggregate_progress',
            label: 'Calculate Progress',
            icon: Calculator,
            execute: async (docId, userId) => {
                console.log(`[Behavior] Starting Project Progress Aggregation: ${docId}`);
                const allDocs = await dataService.getAllDocs(userId);
                const children = allDocs.filter(d => d.parent_id === docId);
                
                if (children.length === 0) return { key: 'progress', value: 0 };

                const tasks = children.filter(d => d.class_id === 'task');
                if (tasks.length === 0) return { key: 'progress', value: 0 };

                const totalProgress = tasks.reduce((sum, t) => sum + (Number((t as any).properties?.progress) || 0), 0);
                const avgProgress = Math.round(totalProgress / tasks.length);

                console.log(`[Behavior] Project Average Progress: ${avgProgress}% (across ${tasks.length} tasks)`);
                await dataService.updateProperty(docId, 'progress', avgProgress, userId);
                
                return { key: 'progress', value: avgProgress };
            }
        }
    ]
};

export function getActionsForClass(classId: string): BehaviorAction[] {
    const classActions = BEHAVIOR_REGISTRY[classId] || [];
    return [...classActions, ...COMMON_ACTIONS];
}
