import { invoke } from "@tauri-apps/api/core";
import { dataService } from "./data/DataServiceProvider";

export const isTauri = () => {
    return !!(window as any).__TAURI_INTERNALS__;
};

export const getRecentDocs = async (userId: string) => {
    if (isTauri()) {
        try {
            return await invoke<any[]>("get_recent_docs", { userId, limit: 10 });
        } catch (e) { console.error(e); }
    }
    return await dataService.getRecentDocs(userId);
};

export const createDoc = async (userId: string, title: string, classId: string | null, parentId: string | null = null) => {
    if (isTauri()) {
        try {
            return await invoke<any>("create_doc", { userId, title, classId, parentId });
        } catch (e) { console.error(e); }
    }
    return await dataService.createDoc(userId, title, classId || undefined, parentId || undefined);
};

export const getAllDocs = async (userId: string) => {
    if (isTauri()) {
        try {
            return await invoke<any[]>("get_all_docs", { userId });
        } catch (e) { console.error(e); }
    }
    return await dataService.getAllDocs(userId);
};

export const deleteDoc = async (docId: string, userId: string) => {
    if (isTauri()) {
        try { await invoke("delete_doc", { docId, userId }); return; }
        catch (e) { console.error(e); }
    }
    return await dataService.deleteDoc(docId, userId);
};

export const getArchetypes = async () => {
    if (isTauri()) {
        try {
            return await invoke<any[]>("get_archetypes");
        } catch (e) { console.error(e); }
    }
    return await dataService.getArchetypes();
};

export const getSystemStats = async (userId: string) => {
    if (isTauri()) {
        try {
            return await invoke<any>("get_system_stats", { userId });
        } catch (e) { console.error(e); }
    }
    return await dataService.getSystemStats(userId);
};

export const getLinks = async (userId: string) => {
    if (isTauri()) {
        try {
            return await invoke<[string, string][]>("get_links", { userId });
        } catch (e) { console.error(e); }
    }
    // Note: Temporary inline fix for links to avoid breaking IDataService contract mid-refactor
    const { getAuthHeaders } = await import("./data/authHeaders");
    const res = await fetch(`/api/v1/content/docs/links`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
};

export const createLink = async (fromId: string, toId: string) => {
    if (isTauri()) {
        try { await invoke("create_link", { fromId, toId }); return; }
        catch (e) { console.error(e); }
    }
    const { getAuthHeaders } = await import("./data/authHeaders");
    await fetch('/api/v1/content/docs/links/create', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ from_id: fromId, to_id: toId }),
    });
};