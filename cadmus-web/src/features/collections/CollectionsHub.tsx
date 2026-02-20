import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../auth/authStore';
import { useNavigate } from 'react-router-dom';
import { Database, Table, ArrowRight, Layers, Search, Filter } from 'lucide-react';
import { Button } from '../../design-system';
import { dataService } from '../../kernel/data/DataServiceProvider';
import { WorkspaceNode } from '../../kernel/data/IDataService';
import { ClassIcon } from '../../design-system/ClassIcon';

export function CollectionsHub() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [collections, setCollections] = useState<WorkspaceNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    dataService.getAllDocs(user.id).then(docs => {
        // Filter: Any object that acts as a database/collection
        const filtered = docs.filter(d => 
            d.class_id === 'ledger' || 
            d.class_id === 'project' || 
            d.class_id === 'folha'
        );
        setCollections(filtered as any);
        setLoading(false);
    });
  }, [user]);

  return (
    <div className="p-12 max-w-7xl mx-auto flex flex-col gap-12 font-mono">
      <header className="flex flex-col gap-4 border-b-4 border-accent pb-8">
        <h1 className="text-6xl font-black uppercase tracking-tighter text-text">
            DATABASE <span className="text-accent text-2xl align-top">NODES</span>
        </h1>
        <p className="text-xs font-bold text-subtext uppercase tracking-[0.4em]">
            Identified Collection Engines :: {collections.length} UNITS_ACTIVE
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
            <div className="col-span-full py-20 text-center text-accent animate-pulse font-black uppercase">Syncing_Sector_Registry...</div>
        ) : collections.length === 0 ? (
            <div className="col-span-full py-20 border-4 border-dashed border-accent-border/20 rounded-[3rem] flex flex-col items-center gap-6 opacity-30">
                <Database className="w-16 h-16" />
                <span className="text-xs font-black uppercase tracking-[0.5em]">No_Relational_Nodes_Active</span>
            </div>
        ) : collections.map(c => (
            <div 
                key={c.id}
                onClick={() => navigate(`/editor/${c.id}`)}
                className="group bg-mantle border-2 border-accent-border/40 p-10 rounded-[2.5rem] flex flex-col gap-8 hover:border-accent hover:shadow-hard transition-all cursor-pointer relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                    <ClassIcon classId={c.class_id} className="w-40 h-40" />
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-3 text-accent mb-2">
                        <ClassIcon classId={c.class_id} className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-crust px-3 py-1 rounded-full border border-accent/20">
                            {c.class_id}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-text uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">{c.title}</h3>
                </div>

                <div className="space-y-3 relative z-10 border-t border-accent-border/10 pt-6">
                    <div className="flex justify-between text-[9px] font-bold text-subtext uppercase tracking-widest">
                        <span>Integrity_Signature</span>
                        <span className="text-text">0x{c.id.slice(0,8)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-subtext uppercase tracking-widest">
                        <span>Last_Modified</span>
                        <span className="text-text">TODAY_0x9</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto relative z-10">
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest animate-pulse opacity-0 group-hover:opacity-100 transition-opacity">
                        LINK_ESTABLISHED
                    </span>
                    <div className="w-10 h-10 bg-accent text-crust flex items-center justify-center rounded-full shadow-lg group-hover:translate-x-2 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
