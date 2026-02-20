import { EditorContent, BubbleMenu } from '@tiptap/react';
import { useEffect, useState, memo, useRef } from 'react';
import { Button } from '../../design-system';
import { Table as TableIcon, Rows, Columns, Trash2, ShieldCheck } from 'lucide-react';
import { SmartHeader } from './components/SmartHeader';
import { dataService } from '../../kernel/data/DataServiceProvider'; // New Data Layer
import { useAuthStore } from '../auth/authStore';
import { useYjsSync } from './hooks/useYjsSync';
import { useTiptapConfig } from './hooks/useTiptapConfig';
import { useTranslation } from '../../kernel/i18n';
import { RegistryBar } from './components/RegistryBar';
import { TableOfContents } from './components/TableOfContents';
import { CommentsSidebar } from './components/CommentsSidebar';

const PureEditorContent = memo(({ editor, className }: { editor: any, className: string }) => (
  <EditorContent editor={editor} className={className} />
));

export function CollaborativeEditor({ docId }: { docId: string }) {
  const { t } = useTranslation();
  const [docMeta, setDocMeta] = useState<{ title: string; class_id?: string; integrity?: number } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showToC, setShowToC] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const user = useAuthStore(state => state.user);
  
  // AI Worker Ref
  const workerRef = useRef<Worker | null>(null);

  // Hooks
  const { ydoc, provider, status } = useYjsSync(docId);
  const editor = useTiptapConfig({ ydoc, provider, user });
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  // Initialize AI Worker
  useEffect(() => {
    if (!window.Worker) return;
    workerRef.current = new Worker(new URL('../../workers/synapse.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = async (e) => {
        const { type, payload } = e.data;
        if (type === 'EMBED_RESULT' && payload) {
            // Send vector to backend
            try {
                const { getAuthHeaders } = await import('../../kernel/data/authHeaders');
                await fetch('/api/v1/content/docs/embedding', {
                    method: 'POST',
                    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ doc_id: docId, vector: payload })
                });
                console.log("[Synapse] Vector synced to Neural Metadata.");
            } catch (err) {
                console.error("[Synapse] Vector sync failed", err);
            }
        }
    };
    workerRef.current.postMessage({ type: 'INIT' });

    return () => { workerRef.current?.terminate(); };
  }, [docId]);

  // Monitor Awareness (Presence)
  useEffect(() => {
    if (!provider) return;
    const handleAwareness = () => {
      const states = provider.awareness.getStates();
      // Deduplicate by username to fix ghost sessions
      const uniqueUsers = new Map();
      states.forEach((s: any) => {
          if (s.user && s.user.name) uniqueUsers.set(s.user.name, s.user);
      });
      setActiveUsers(Array.from(uniqueUsers.values()));
    };
    provider.awareness.on('change', handleAwareness);
    return () => { provider.awareness.off('change', handleAwareness); };
  }, [provider]);

  // Track Dirty State & AI Trigger
  useEffect(() => {
    if (!editor) return;
    
    const handleUpdate = () => {
      setIsDirty(true);
      
      // Debounce Save & AI
      const timer = setTimeout(() => {
          setIsDirty(false);
          // Trigger AI Embedding
          const text = editor.getText();
          if (text.length > 50 && workerRef.current) {
              workerRef.current.postMessage({ type: 'EMBED', payload: text });
          }
      }, 2000);
      
      return () => clearTimeout(timer);
    };
    
    editor.on('update', handleUpdate);
    return () => { editor.off('update', handleUpdate); };
  }, [editor]);

  useEffect(() => {
      if (!user) return;
      if (docId === 'new-doc' || !docId.match(/^[0-9a-fA-F-]{36}$/)) return; // Skip fetch for new docs or invalid UUIDs
      
      const fetchData = async () => {
          try {
              const doc = await dataService.getDoc(docId);
              const physics = (doc as any).properties || {};
              
              setDocMeta({
                  title: doc.title || t.editor.untitled,
                  class_id: doc.class_id,
                  integrity: 1.0 - (physics.entropy || 0)
              });
          } catch (e) {
              console.error("Data Fetch Error:", e);
          }
      };
      fetchData();
  }, [docId, user, t.editor.untitled]);

  if (!editor) return null;

  return (
    <div className="flex h-full bg-transparent overflow-hidden relative">
      
      {/* Table Bubble Menu */}
      {editor && !editor.isDestroyed && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, appendTo: 'parent' }} shouldShow={({ editor }) => editor.isActive('table')}>
          <div className="flex items-center gap-1 p-1 bg-surface border-2 border-accent rounded-sm shadow-hard">
            <button onClick={() => editor.chain().focus().addRowAfter().run()} className="h-8 w-8 flex items-center justify-center hover:bg-accent/10 transition-colors">
                <Rows className="w-4 h-4" />
            </button>
            <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="h-8 w-8 flex items-center justify-center hover:bg-accent/10 transition-colors">
                <Columns className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button onClick={() => editor.chain().focus().deleteTable().run()} className="h-8 w-8 flex items-center justify-center text-accent hover:bg-accent/10 transition-colors">
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Registry Bar (Always Top) */}
        <RegistryBar 
            status={status} 
            integrity={docMeta?.integrity ?? 1} 
            isDirty={isDirty} 
            activeUsers={activeUsers}
            onToggleToC={() => setShowToC(!showToC)}
            onToggleComments={() => setShowComments(!showComments)}
            showToC={showToC}
            showComments={showComments}
        />

        <div className="flex-1 flex overflow-hidden">
            {/* The Document Core (Header + Body) */}
            <div className="flex-1 overflow-y-auto flex flex-col items-center">
                <div className="max-w-4xl w-full px-16 py-16 relative">
                    <div className="absolute top-16 right-16 z-10">
                        <button onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="h-10 w-10 flex items-center justify-center border-2 border-border bg-muted/50 hover:bg-accent hover:text-base hover:border-accent transition-all shadow-hard active:translate-y-0.5">
                            <TableIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="mb-16">
                        <SmartHeader docId={docId} title={docMeta?.title || t.editor.untitled} classId={docMeta?.class_id} ydoc={ydoc} />
                    </div>
                    
                    <PureEditorContent 
                        key={docId}
                        editor={editor} 
                        className="font-content text-text prose-base focus:outline-none pb-64" 
                    />
                </div>
            </div>
            
            {/* Sidebars */}
            {showToC && <div className="w-64 border-l-2 border-border bg-muted/20 animate-in slide-in-from-right duration-300"><TableOfContents editor={editor} /></div>}
            {showComments && <div className="w-80 border-l-2 border-border bg-muted/20 animate-in slide-in-from-right duration-300"><CommentsSidebar editor={editor} ydoc={ydoc} /></div>}
        </div>
      </div>
    </div>
  );
}