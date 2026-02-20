import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { isTauri } from '../../../kernel/tauri_bridge';
import { invoke } from '@tauri-apps/api/core';

export function useYjsSync(docId: string) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const { ydoc, provider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const wsUrl = `ws://127.0.0.1:3000/api/v1/content/ws/doc`;
    
    // Only create provider if we are in browser/cloud mode
    const provider = !isTauri() 
        ? new WebsocketProvider(wsUrl, docId, ydoc) 
        : null;
    
    // Local persistence (Browser side)
    new IndexeddbPersistence(docId, ydoc);
    
    return { ydoc, provider };
  }, [docId]);

  useEffect(() => {
    if (isTauri()) {
        setStatus('connected');
        
        // Restore from Local SQLite
        const restore = async () => {
            try {
                const updates = await invoke<number[][]>('get_updates', { docId });
                if (updates && updates.length > 0) {
                    console.log(`[Cadmus] Restoring ${updates.length} updates from SQLite...`);
                    Y.applyUpdate(ydoc, Y.mergeUpdates(updates.map(u => new Uint8Array(u))));
                }
            } catch (e) {
                console.error("Local Restoration Fail", e);
            }
        };
        restore();
        
        const handleUpdate = async (update: Uint8Array) => {
            try {
                await invoke('push_update', { docId, update: Array.from(update) });
            } catch (e) {
                console.error("Tauri Update Push Fail", e);
            }
        };

        ydoc.on('update', handleUpdate);
        return () => { ydoc.off('update', handleUpdate); };
    }

    if (provider) {
        const handleStatus = (event: any) => {
            setStatus(event.status);
        };
        
        provider.on('status', handleStatus);
        return () => {
            provider.off('status', handleStatus);
            provider.disconnect();
            provider.destroy();
        };
    }
  }, [provider, ydoc, docId]);

  return { ydoc, provider, status };
}
