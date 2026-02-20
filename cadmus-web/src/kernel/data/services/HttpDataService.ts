import { IDataService, DocumentMeta, SystemStats, Archetype, CollectionData } from '../IDataService';
import { getAuthHeaders } from '../authHeaders';

export class HttpDataService implements IDataService {
    private baseUrl = '/api/v1/content/docs';

    async getDoc(docId: string): Promise<DocumentMeta> {
        const res = await fetch(`${this.baseUrl}/${docId}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch doc');
        return res.json();
    }

    async getRecentDocs(_userId: string, limit: number = 10): Promise<DocumentMeta[]> {
        const res = await fetch(`${this.baseUrl}/recent?limit=${limit}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch recent docs');
        return res.json();
    }

    async getAllDocs(_userId: string): Promise<DocumentMeta[]> {
        const res = await fetch(`${this.baseUrl}/all`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch all docs');
        return res.json();
    }

    async createDoc(userId: string, title: string, classId?: string, parentId?: string): Promise<DocumentMeta> {
        const res = await fetch(`${this.baseUrl}/create`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ user_id: userId, title, class_id: classId, parent_id: parentId })
        });
        if (!res.ok) throw new Error('Failed to create doc');
        return res.json();
    }

    async deleteDoc(docId: string, _userId: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/${docId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete doc');
    }

    async getSystemStats(_userId: string): Promise<SystemStats> {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/v1/stats`, { headers });
        if (!res.ok) return { nodes: 0, class_distribution: {}, recent_activity_count: 0, total_links: 0, orphan_nodes: 0, untagged_nodes: 0, integrity: 1 };
        const data = await res.json();
        return {
            nodes: data.nodes,
            class_distribution: data.class_distribution,
            recent_activity_count: data.recent_activity_count,
            total_links: data.total_links,
            orphan_nodes: data.orphan_nodes || 0,
            untagged_nodes: data.untagged_nodes || 0,
            integrity: data.integrity || 1
        };
    }

    async updateProperty(docId: string, key: string, value: any, userId?: string): Promise<void> {
        console.group(`%c [METADATA_SYNC] ${key}`, "color: #AF3A03; font-weight: bold");
        try {
            const res = await fetch(`${this.baseUrl}/update_property`, {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ id: docId, key, value, user_id: userId })
            });
            
            if (!res.ok) throw new Error(await res.text());

            // Read-back Validation
            const verifyRes = await fetch(`${this.baseUrl}/${docId}`, { headers: getAuthHeaders() });
            if (verifyRes.ok) {
                const updatedDoc = await verifyRes.json();
                const serverValue = key === 'title' ? updatedDoc.title : updatedDoc.properties?.[key];
                if (JSON.stringify(serverValue) !== JSON.stringify(value)) {
                    console.warn(`%c [INTEGRITY_ALERT] Value mismatch!`, "background: red; color: white");
                }
            }
        } catch (e) {
            console.error(`%c [SYNC_FAIL]`, "color: red", e);
            throw e;
        } finally {
            console.groupEnd();
        }
    }

    async getArchetypes(): Promise<Archetype[]> {
        const res = await fetch(`${this.baseUrl}/archetypes`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch archetypes');
        return res.json();
    }

    async getTags(docId: string): Promise<string[]> {
        const res = await fetch(`${this.baseUrl}/tags/${docId}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch tags');
        return res.json();
    }

    async getCollection(docId: string): Promise<CollectionData> {
        const res = await fetch(`${this.baseUrl}/collection/${docId}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch collection');
        return res.json();
    }

    async updateCollectionCell(docId: string, rowId: string, colId: string, value: any): Promise<void> {
        const res = await fetch(`${this.baseUrl}/collection/${docId}/cell`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ row_id: rowId, col_id: colId, value })
        });
        if (!res.ok) throw new Error('Failed to update cell');
    }

    async addCollectionRow(docId: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/collection/${docId}/row`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to add row');
    }

    async pushUpdate(docId: string, update: number[]): Promise<void> {
        const res = await fetch(`${this.baseUrl}/${docId}/snapshot`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ data: update })
        });
        if (!res.ok) throw new Error('Failed to push update');
    }

    async getUpdates(docId: string): Promise<number[][]> {
        const res = await fetch(`${this.baseUrl}/${docId}/updates`, { headers: getAuthHeaders() });
        if (!res.ok) return [];
        return res.json();
    }

    async getLatestUpdate(docId: string): Promise<number[] | null> {
        const res = await fetch(`${this.baseUrl}/${docId}/latest_snapshot`, { headers: getAuthHeaders() });
        if (!res.ok) return null;
        return res.json();
    }
}