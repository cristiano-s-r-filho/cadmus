import { BarChart3, Database, FolderTree, Loader2, Plus, Terminal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { SovereignModal } from '../../../components/ui/Modal';
import { ClassIcon } from '../../../design-system/ClassIcon';
import { useAuthStore } from '../../auth/authStore';
import { dataService, Archetype } from '../../../kernel/data/DataServiceProvider';
import { DocumentMeta } from '../../../kernel/data/IDataService';

interface SpawnModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParentId?: string | null;
}

export function SpawnModal({ isOpen, onClose, initialParentId }: SpawnModalProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [potentialParents, setPotentialParents] = useState<DocumentMeta[]>([]);
  
  const [title, setTitle] = useState('');
  const [selectedArch, setSelectedArch] = useState('note');
  const [parentId, setParentId] = useState<string | null>(initialParentId || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setParentId(initialParentId || null);
  }, [isOpen, initialParentId]);

  useEffect(() => {
    if (isOpen && user?.token) {
      // Load Archetypes and potential Parent Nodes
      Promise.all([
        dataService.getArchetypes(),
        dataService.getAllDocs(user.id)
      ]).then(([archs, docs]) => {
        setArchetypes(archs);
        // Only allow grouping classes as parents
        const parents = docs.filter(d => 
            d.class_id === 'project' || 
            d.class_id === 'container' || 
            d.class_id === 'folha' || 
            d.class_id === 'ledger'
        );
        setPotentialParents(parents);
      }).catch(console.error);
    }
  }, [isOpen, user?.token, user?.id]);

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    setLoading(true);
    try {
      const node = await dataService.createDoc(user.id, title, selectedArch, parentId || undefined);
      onClose();
      // Clean state for next use
      setTitle('');
      setParentId(null);
      navigate(`/editor/${node.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const groups = ['primitiva', 'operacional', 'recursos', 'dados'];

  return (
    <SovereignModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="INITIALIZE_NODE" 
      icon={<Terminal className="w-6 h-6" />}
    >
      <div className="space-y-10 font-ui animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Node Name */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] flex items-center gap-3">
            <Database className="w-3.5 h-3.5" /> Identity_Handle
          </label>
          <input 
            autoFocus
            placeholder="NAME_YOUR_ARTIFACT..."
            className="w-full bg-base border-2 border-border px-5 py-4 text-text font-black outline-none focus:border-accent transition-all placeholder:text-subtext/20 uppercase tracking-widest"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Parent Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] flex items-center gap-3">
            <FolderTree className="w-3.5 h-3.5" /> Hierarchical_Bus
          </label>
          <select 
            className="w-full bg-base border-2 border-border px-5 py-4 text-xs font-black text-text outline-none focus:border-accent appearance-none cursor-pointer uppercase tracking-widest"
            value={parentId || ''}
            onChange={e => setParentId(e.target.value || null)}
          >
            <option value="">:: ROOT_LEVEL_ACCESS ::</option>
            {potentialParents.map(p => (
                <option key={p.id} value={p.id}>
                    {p.class_id?.toUpperCase()} // {p.title}
                </option>
            ))}
          </select>
        </div>

        {/* Archetype Grid */}
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] flex items-center gap-3">
            <BarChart3 className="w-3.5 h-3.5" /> Archetype_Matrix
          </label>
          
          <div className="space-y-8 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar border-y-2 border-border/10 py-6">
            {groups.map(group => {
              const items = archetypes.filter(a => (a as any).group_id === group);
              if (items.length === 0) return null;

              return (
                <div key={group} className="space-y-3">
                  <h4 className="text-[9px] font-black text-subtext uppercase tracking-[0.4em] opacity-40">{group}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(a => (
                      <button 
                        key={a.id}
                        onClick={() => setSelectedArch(a.id)}
                        className={clsx(
                          "p-4 border-2 flex items-center justify-between transition-all group relative overflow-hidden",
                          selectedArch === a.id 
                            ? "bg-accent border-accent text-base shadow-hard" 
                            : "bg-surface border-border text-subtext hover:border-accent/50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <ClassIcon classId={a.id} className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{a.name}</span>
                        </div>
                        {selectedArch === a.id && (
                            <div className="absolute top-0 right-0 bg-base text-accent px-2 py-0.5 text-[7px] font-black tracking-tighter">
                                SELECTED
                            </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-6 pt-4 border-t-2 border-border/30">
            <button 
                className="flex-1 h-16 bg-accent text-base font-black uppercase text-xs tracking-[0.3em] shadow-hard active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                onClick={handleCreate}
                disabled={loading || !title.trim()}
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                CONFIRM_SPAWN_SEQUENCE
            </button>
        </div>
      </div>
    </SovereignModal>
  );
}
