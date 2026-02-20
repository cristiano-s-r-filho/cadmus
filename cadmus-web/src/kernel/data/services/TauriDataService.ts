import { invoke } from '@tauri-apps/api/core';
import { IDataService, DocumentMeta, SystemStats, Archetype, CollectionData } from '../IDataService';

export class TauriDataService implements IDataService {
    async getDoc(docId: string): Promise<DocumentMeta> {
        return invoke('get_doc', { docId });
    }

    async getRecentDocs(userId: string, limit: number = 10): Promise<DocumentMeta[]> {
        return invoke('get_recent_docs', { userId, limit });
    }

    async getAllDocs(userId: string): Promise<DocumentMeta[]> {
        return invoke('get_all_docs', { userId });
    }

    async createDoc(userId: string, title: string, classId?: string, parentId?: string): Promise<DocumentMeta> {
        return invoke('create_doc', { userId, title, classId, parentId });
    }

    async deleteDoc(docId: string, userId: string): Promise<void> {
        return invoke('delete_doc', { docId, userId });
    }

    async getSystemStats(userId: string): Promise<SystemStats> {
        return invoke('get_system_stats', { userId });
    }

    async updateProperty(docId: string, key: string, value: any, userId?: string): Promise<void> {
        return invoke('update_doc_property', { docId, key, value, userId });
    }

    async getArchetypes(): Promise<Archetype[]> {
        return invoke('get_archetypes');
    }

    async getTags(docId: string): Promise<string[]> {
        return invoke('get_tags', { docId });
    }

    // Collection Engine Implementation
    async getCollection(docId: string): Promise<CollectionData> {
        return invoke('get_collection', { docId });
    }

    async updateCollectionCell(docId: string, rowId: string, colId: string, value: any): Promise<void> {
        return invoke('update_collection_cell', { docId, rowId, colId, value });
    }

    async addCollectionRow(docId: string): Promise<void> {
        return invoke('add_collection_row', { docId });
    }

    async pushUpdate(docId: string, update: number[]): Promise<void> {
        return invoke('push_update', { docId, update });
    }

    async getUpdates(docId: string): Promise<number[][]> {
        return invoke('get_updates', { docId });
    }

    async getLatestUpdate(docId: string): Promise<number[] | null> {
        return invoke('get_latest_update', { docId });
    }
}
