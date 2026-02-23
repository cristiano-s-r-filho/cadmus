import { IDataService, Archetype, FieldDefinition, CollectionData, DocumentMeta, WorkspaceNode } from './IDataService';
import { HttpDataService } from './services/HttpDataService';
import { TauriDataService } from './services/TauriDataService';

export type { Archetype, FieldDefinition, CollectionData, DocumentMeta, WorkspaceNode };

// Detecta se está rodando no Tauri
const isTauri = () => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
};

let cachedService: IDataService | null = null;

export const dataService = {
    getService(): IDataService {
        if (!cachedService) {
            if (isTauri()) {
                console.log("Cadmus Kernel: Initializing Local Data Service (Tauri)");
                cachedService = new TauriDataService();
            } else {
                console.log("Cadmus Kernel: Initializing Cloud Data Service (HTTP)");
                cachedService = new HttpDataService();
            }
        }
        return cachedService;
    },

    // Proxy methods to maintain compatibility with existing code
    async getDoc(docId: string) { return this.getService().getDoc(docId); },
    async getRecentDocs(userId: string, limit?: number) { return this.getService().getRecentDocs(userId, limit); },
    async getAllDocs(userId: string) { return this.getService().getAllDocs(userId); },
    async createDoc(userId: string, title: string, classId?: string, parentId?: string) { return this.getService().createDoc(userId, title, classId, parentId); },
    async deleteDoc(docId: string, userId: string) { return this.getService().deleteDoc(docId, userId); },
    async getSystemStats(userId: string) { return this.getService().getSystemStats(userId); },
    async updateProperty(docId: string, key: string, value: any, userId?: string) { return this.getService().updateProperty(docId, key, value, userId); },
    async getArchetypes() { return this.getService().getArchetypes(); },
    async getTags(docId: string) { return this.getService().getTags(docId); },
    async getCollection(docId: string) { return this.getService().getCollection(docId); },
    async updateCollectionCell(docId: string, rowId: string, colId: string, value: any) { return this.getService().updateCollectionCell(docId, rowId, colId, value); },
    async addCollectionRow(docId: string) { return this.getService().addCollectionRow(docId); },
    async pushUpdate(docId: string, update: number[]) { return this.getService().pushUpdate(docId, update); },
    async getUpdates(docId: string) { return this.getService().getUpdates(docId); },
    async getLatestUpdate(docId: string) { return this.getService().getLatestUpdate(docId); }
};
