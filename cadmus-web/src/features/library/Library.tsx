import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../auth/authStore';
import { useNavigate } from 'react-router-dom';
import { Book, Search, Filter, MoreVertical, Loader2, Calendar as CalendarIcon, Tag, X } from 'lucide-react';
import { Button } from '../../design-system';
import { ClassIcon } from '../../design-system/ClassIcon';
import { useTranslation } from '../../kernel/i18n';
import { getAllDocs } from '../../kernel/tauri_bridge';
import { WorkspaceNode } from '../../kernel/data/IDataService';
import { clsx } from 'clsx';

export const Library = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [docs, setDocs] = useState<WorkspaceNode[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<WorkspaceNode[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!user) return;
    getAllDocs(user.id)
      .then(data => {
        setDocs(data);
        setFilteredDocs(data);
        
        // Extract all unique tags
        const tags = new Set<string>();
        data.forEach((d: WorkspaceNode) => {
            if (d.properties?.tags && Array.isArray(d.properties.tags)) {
                d.properties.tags.forEach((tag: string) => tags.add(tag));
            }
        });
        setAllTags(Array.from(tags));
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [user]);

  const applyFilters = (term: string = '', classId: string | null = activeFilter, dateR = dateRange, tags = selectedTags) => {
      let matches = docs;

      // 1. Text Search
      if (term) {
          matches = matches.filter(d => d.title.toLowerCase().includes(term.toLowerCase()));
      }

      // 2. Class Filter
      if (classId) {
          matches = matches.filter(d => d.class_id === classId);
      }

      // 3. Date Range
      if (dateR.start) {
          matches = matches.filter(d => d.updated_at && new Date(d.updated_at) >= new Date(dateR.start));
      }
      if (dateR.end) {
          matches = matches.filter(d => d.updated_at && new Date(d.updated_at) <= new Date(dateR.end));
      }

      // 4. Tags
      if (tags.length > 0) {
          matches = matches.filter(d => {
              const docTags = d.properties?.tags || [];
              return tags.every(t => docTags.includes(t));
          });
      }

      setFilteredDocs(matches);
  };

  const toggleFilter = (classId: string | null) => {
      setActiveFilter(classId);
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      applyFilters(searchInput?.value, classId);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      applyFilters(term);

      if (term.length > 3 && workerRef.current) {
          setSearching(true);
          // workerRef.current.postMessage({ type: 'EMBED', payload: term });
          setTimeout(() => setSearching(false), 500); // Simulate for now
      }
  };

  const toggleTag = (tag: string) => {
      const newTags = selectedTags.includes(tag) 
          ? selectedTags.filter(t => t !== tag)
          : [...selectedTags, tag];
      setSelectedTags(newTags);
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      applyFilters(searchInput?.value, activeFilter, dateRange, newTags);
  };

  return (
    <div className="p-10 max-w-6xl mx-auto flex flex-col gap-10 bg-base min-h-full font-mono">
      <header className="flex flex-col gap-8">
        <div className="flex items-end justify-between">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-text flex items-center gap-4">
                <Book className="w-12 h-12 text-accent" />
                BIBLIOTECA
            </h1>
            <div className="text-[10px] font-black text-subtext uppercase tracking-widest border-b-2 border-accent/20 pb-1">
                {filteredDocs.length} ARTIFACTS_LOADED
            </div>
        </div>

        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="flex-1 relative group">
                    {searching ? (
                        <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin" />
                    ) : (
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext group-hover:text-accent transition-colors" />
                    )}
                    <input 
                        type="text" 
                        placeholder={t.sidebar.search_placeholder}
                        onChange={handleSearch}
                        className="w-full h-14 bg-mantle border-2 border-accent-border/20 rounded-2xl pl-12 pr-6 py-2 text-sm outline-none focus:border-accent text-text placeholder:text-subtext/30 font-bold transition-all shadow-sm focus:shadow-md"
                    />
                </div>
                <Button 
                    variant="ghost" 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={clsx(
                        "h-14 border-2 text-[10px] px-6 transition-all",
                        showAdvanced ? "border-accent text-accent bg-accent/5" : "border-accent-border/20 text-subtext"
                    )}
                >
                    <Filter className="w-4 h-4 mr-2" /> ADVANCED
                </Button>
            </div>

            {/* ADVANCED FILTERS PANEL */}
            {showAdvanced && (
                <div className="p-6 bg-surface border-2 border-border rounded-xl shadow-hard grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3">
                        <span className="text-[10px] font-black text-subtext uppercase tracking-widest flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" /> Date_Range
                        </span>
                        <div className="flex gap-4">
                            <input 
                                type="date" 
                                className="flex-1 bg-base border border-border p-2 text-xs font-mono uppercase focus:border-accent outline-none"
                                onChange={(e) => {
                                    const newRange = { ...dateRange, start: e.target.value };
                                    setDateRange(newRange);
                                    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                                    applyFilters(searchInput?.value, activeFilter, newRange);
                                }}
                            />
                            <input 
                                type="date" 
                                className="flex-1 bg-base border border-border p-2 text-xs font-mono uppercase focus:border-accent outline-none"
                                onChange={(e) => {
                                    const newRange = { ...dateRange, end: e.target.value };
                                    setDateRange(newRange);
                                    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                                    applyFilters(searchInput?.value, activeFilter, newRange);
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <span className="text-[10px] font-black text-subtext uppercase tracking-widest flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Semantic_Tags
                        </span>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={clsx(
                                        "px-2 py-1 text-[9px] font-black uppercase border rounded transition-all",
                                        selectedTags.includes(tag) ? "bg-accent text-white border-accent" : "bg-base text-subtext border-border hover:border-accent"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                            {allTags.length === 0 && <span className="text-[10px] text-subtext italic">No tags indexed.</span>}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <button 
                    onClick={() => toggleFilter(null)}
                    className={clsx(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                        !activeFilter ? "bg-accent border-accent text-crust shadow-lg" : "border-accent-border/20 text-subtext hover:border-accent/50"
                    )}
                >
                    ALL_ARTIFACTS
                </button>
                {['note', 'task', 'project', 'folha', 'ledger', 'asset'].map(cls => (
                    <button 
                        key={cls}
                        onClick={() => toggleFilter(cls)}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2",
                            activeFilter === cls ? "bg-accent border-accent text-crust shadow-lg" : "border-accent-border/20 text-subtext hover:border-accent/50"
                        )}
                    >
                        <ClassIcon classId={cls} className="w-3 h-3" /> {cls}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <div className="bg-mantle border-2 border-accent-border/20 rounded-[2rem] overflow-hidden shadow-hard">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-crust border-b border-accent-border/20 text-[10px] font-black uppercase tracking-widest text-subtext">
              <th className="px-6 py-4">DOCUMENT_TITLE</th>
              <th className="px-6 py-4">INTEGRITY</th>
              <th className="px-6 py-4">UUID_SIGNATURE</th>
              <th className="px-6 py-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-border/10">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-subtext animate-pulse">:: ACCESSING_VAULT ::</td></tr>
            ) : filteredDocs.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-subtext uppercase">NO_ARTIFACTS_FOUND</td></tr>
            ) : filteredDocs.map(doc => (
              <tr 
                key={doc.id} 
                className="hover:bg-accent/5 cursor-pointer group transition-colors"
                onClick={() => navigate(`/editor/${doc.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ClassIcon classId={doc.class_id} className="w-5 h-5 text-accent" />
                    <span className="font-bold text-text group-hover:text-accent transition-colors">{doc.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-terminal-green/10 text-terminal-green text-[10px] font-black rounded-md uppercase border border-terminal-green/20">STABLE</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-subtext opacity-50">
                  0x{doc.id.slice(0,8)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
