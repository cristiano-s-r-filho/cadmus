use yrs::{Doc, Transact, Update};
use yrs::updates::decoder::Decode;
use std::collections::HashMap;
use tokio::sync::{RwLock, broadcast};
use std::sync::Arc;
use super::storage::ContentStorage;

pub struct Room {
    pub doc: Doc,
    pub tx: broadcast::Sender<Vec<u8>>,
}

pub struct ContentRegistry {
    rooms: RwLock<HashMap<String, Arc<Room>>>,
    storage: Option<Arc<ContentStorage>>,
}

impl ContentRegistry {
    pub fn new(storage: Option<Arc<ContentStorage>>) -> Self {
        Self {
            rooms: RwLock::new(HashMap::new()),
            storage,
        }
    }

    pub fn get_storage(&self) -> Option<Arc<ContentStorage>> {
        self.storage.clone()
    }

    pub async fn get_room(&self, id: &str) -> Arc<Room> {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get(id) {
            return room.clone();
        }

        tracing::info!("Content: Initializing room '{}'...", id);
        let doc = Doc::new();
        
        if let Some(storage) = &self.storage {
            let updates = storage.load_updates(id).await.unwrap_or_default();
            if !updates.is_empty() {
                tracing::info!("Content: Restoring {} updates for '{}'", updates.len(), id);
                let mut txn = doc.transact_mut();
                for update_bytes in updates {
                    if let Ok(u) = Update::decode_v1(&update_bytes) {
                        txn.apply_update(u);
                    }
                }
            }
        }

        let (tx, _) = broadcast::channel(100);
        let room = Arc::new(Room { doc, tx });
        rooms.insert(id.to_string(), room.clone());
        room
    }

    pub async fn process_update(&self, id: &str, update: Vec<u8>) {
        if update.is_empty() || update == vec![0, 0] {
            return;
        }

        let room = self.get_room(id).await;
        
        // 1. Apply to memory with Fail-Safe Concurrency
        if let Ok(u) = Update::decode_v1(&update) {
            match room.doc.try_transact_mut() {
                Ok(mut txn) => {
                    txn.apply_update(u);
                },
                Err(_) => {
                    tracing::warn!("Content: Update for '{}' skipped due to lock contention.", id);
                    // We drop the update instead of panicking. 
                    // Yjs state vector sync will eventually catch up.
                }
            }
        }

        // 2. Broadcast to other participants
        let _ = room.tx.send(update.clone());

        // 3. Persist to storage
        if let Some(storage) = &self.storage {
            let _ = storage.save_update(id, update).await;
        }
    }
}
