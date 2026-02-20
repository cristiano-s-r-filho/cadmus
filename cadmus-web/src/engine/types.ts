import * as Y from 'yjs';

export type ActionType = 'AGGREGATE' | 'VALIDATE' | 'TRANSFORM' | 'NOTIFY' | 'TRIGGER';

export interface BehaviorAction {
    id: string;
    type: ActionType;
    params: Record<string, any>;
}

export interface BehaviorGroup {
    id: string;
    actions: BehaviorAction[];
}

export interface BehaviorSchema {
    groups: BehaviorGroup[];
}

export interface ProcessingContext {
    docId: string;
    classId: string;
    ydoc: Y.Doc;
    properties: Record<string, any>;
    dispatch: (action: string, payload: any) => Promise<void>;
}

export interface IBehaviorGroupProcessor {
    id: string;
    process(group: BehaviorGroup, context: ProcessingContext): Promise<void>;
}
