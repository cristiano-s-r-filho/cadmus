import { useState } from 'react';
import { CollaborativeEditor } from '../features/editor';

export function Shell() {
  const [activeDoc, setActiveDoc] = useState('demo-doc');

  return (
    <div className="fixed inset-0 flex bg-base text-text font-ui overflow-hidden p-2">
      {/* Sidebar - Integrated Card Style */}
      <div className="w-72 h-full bg-surface border-2 border-border p-6 flex flex-col gap-8 shadow-hard z-20 rounded-xl mr-2">
        <div className="flex items-center gap-3 border-b-2 border-border pb-6">
          <div className="w-10 h-10 bg-accent text-base flex items-center justify-center font-black text-xl shadow-hard">C</div>
          <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Cadmus<br/><span className="text-accent opacity-80 text-xs">Sovereign_OS</span></h1>
        </div>
        
        <div className="flex flex-col gap-4">
          <p className="text-[10px] uppercase font-black text-subtext tracking-[0.3em]">Workspace_Nodes</p>
          <div className="space-y-2">
            <button 
              className={`w-full text-left px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border-2 ${activeDoc === 'demo-doc' ? 'bg-accent text-base border-accent shadow-hard' : 'hover:border-accent hover:text-accent border-transparent'}`}
              onClick={() => setActiveDoc('demo-doc')}
            >
              Demo_Document
            </button>
            <button 
              className={`w-full text-left px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border-2 ${activeDoc === 'physics-log' ? 'bg-accent text-base border-accent shadow-hard' : 'hover:border-accent hover:text-accent border-transparent'}`}
              onClick={() => setActiveDoc('physics-log')}
            >
              Physics_Log
            </button>
          </div>
        </div>

        <div className="mt-auto p-4 border-2 border-border bg-muted/50 text-[9px] text-subtext leading-relaxed">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
            <p className="font-black uppercase tracking-widest">Core_Status: Active</p>
          </div>
          <div className="space-y-1 font-mono opacity-70">
            <p>KERNEL_ID: V0.1.0_SOVEREIGN</p>
            <p>SYNC_PROTO: YJS_V4_SECURE</p>
            <p>LOC_DATA: 127.0.0.1:3000</p>
          </div>
        </div>
      </div>

      {/* Main Content Area - The "Paper" Container */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-surface border-2 border-border rounded-xl shadow-hard overflow-hidden relative">
        <header className="h-16 border-b-2 border-border flex items-center px-8 justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-1 border border-accent/20">Active_Node</span>
            <span className="font-black text-sm uppercase tracking-tighter">{activeDoc}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[10px] font-black uppercase tracking-widest text-subtext hover:text-accent transition-colors">Settings</button>
            <button className="px-6 py-2 bg-accent text-base font-black uppercase tracking-widest text-[10px] shadow-hard active:translate-y-1 active:shadow-none transition-all">Export_PDF</button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-12">
          <div className="max-w-5xl mx-auto bg-base border-2 border-border shadow-hard min-h-full rounded-sm">
             <CollaborativeEditor key={activeDoc} docId={activeDoc} />
          </div>
        </main>
      </div>
    </div>
  );
}
