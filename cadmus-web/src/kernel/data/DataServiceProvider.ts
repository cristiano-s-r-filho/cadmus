import { IDataService, Archetype, FieldDefinition, CollectionData, DocumentMeta, WorkspaceNode } from './IDataService';
import { HttpDataService } from './services/HttpDataService';
import { TauriDataService } from './services/TauriDataService';

export type { Archetype, FieldDefinition, CollectionData, DocumentMeta, WorkspaceNode };

// Detecta se está rodando no Tauri
const isTauri = () => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
};

class DataServiceProvider {
    private service: IDataService;

    constructor() {
        if (isTauri()) {
            console.log("Cadmus Kernel: Initializing Local Data Service (Tauri)");
            this.service = new TauriDataService();
        } else {
            console.log("Cadmus Kernel: Initializing Cloud Data Service (HTTP)");
            this.service = new HttpDataService();
        }
    }

    getService(): IDataService {
        return this.service;
    }
}

export const dataService = new DataServiceProvider().getService();
