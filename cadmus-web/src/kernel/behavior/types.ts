import { LucideIcon } from 'lucide-react';

export interface BehaviorAction {
    id: string;
    label: string;
    icon: LucideIcon;
    description?: string;
    execute: (docId: string, userId: string, properties: any, vaultSecret?: string | null) => Promise<any>;
}

export type ActionRegistry = Record<string, BehaviorAction[]>;
