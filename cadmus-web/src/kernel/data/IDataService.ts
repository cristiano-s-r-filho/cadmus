export interface WorkspaceNode {
    id: string;
    title: string;
    parent_id?: string;
    class_id?: string;
    updated_at?: string;
    properties?: Record<string, any>;
}

export interface DocumentMeta {
    id: string;
    title: string;
    class_id?: string;
    parent_id?: string;
    updated_at: string;
    owner_id: string;
    integrity?: number;
    properties?: Record<string, any>;
    email?: string | null;
}

export interface SystemStats {
    nodes: number;
    class_distribution: Record<string, number>;
    recent_activity_count: number;
    total_links: number;
    orphan_nodes: number;
    untagged_nodes: number;
    integrity: number;
}

export interface Archetype {
    id: string;
    name: string;
    icon?: string;
    ui_schema: FieldDefinition[];
    behavior_rules: any;
    allowed_children?: string[];
    has_collection?: boolean; // GAP 7: Flag to indicate if this class hosts a database
}

export interface FieldDefinition {
    key: string;
    type: 'text' | 'date' | 'select' | 'badge' | 'progress' | 'money' | 'email' | 'tags';
    label: string;
    options?: string[];
    read_only?: boolean;
    currency?: string;
    confidential?: boolean;
}

export interface CollectionData {
    columns: any[];
    rows: any[];
}

export interface IDataService {
    // Document Management
    getDoc(docId: string): Promise<DocumentMeta>;
    getRecentDocs(userId: string, limit?: number): Promise<DocumentMeta[]>;
    getAllDocs(userId: string): Promise<DocumentMeta[]>;
    createDoc(userId: string, title: string, classId?: string, parentId?: string): Promise<DocumentMeta>;
    deleteDoc(docId: string, userId: string): Promise<void>;
    
    // System Intelligence
    getSystemStats(userId: string): Promise<SystemStats>;
    
    // Properties & Archetypes
    updateProperty(docId: string, key: string, value: any, userId?: string): Promise<void>;
    getArchetypes(): Promise<Archetype[]>;
    getTags(docId: string): Promise<string[]>;

    // Collection Engine (GAP 7)
    getCollection(docId: string): Promise<CollectionData>;
    updateCollectionCell(docId: string, rowId: string, colId: string, value: any): Promise<void>;
    addCollectionRow(docId: string): Promise<void>;

    // Raw Data Access (For FortuneSheet)
    pushUpdate(docId: string, update: number[]): Promise<void>;
    getUpdates(docId: string): Promise<number[][]>;
    getLatestUpdate(docId: string): Promise<number[] | null>;
}