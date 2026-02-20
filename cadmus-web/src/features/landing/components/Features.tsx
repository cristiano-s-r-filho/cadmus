import { Activity, Layers, Shield, Zap, Lock, Cpu } from 'lucide-react';

export const Features = () => {
  const items = [
    { title: 'KINETIC_SYNC', desc: 'Atomic multi-operator convergence via Rust-powered Yjs clusters.', icon: Activity },
    { title: 'HYPER_STRUCTURE', desc: 'Relational node organs. System-wide integrity via hash-chain audit.', icon: Layers },
    { title: 'SOVEREIGN_CORE', desc: 'Zero operational cost. Total privacy via sovereign client-side logic.', icon: Shield },
    { title: 'LOW_LATENCY', desc: 'Real-time performance optimized for local-first operations.', icon: Zap },
    { title: 'FIELD_ENCRYPTION', desc: 'In-browser AES-256-GCM. Keys never touch the network.', icon: Lock },
    { title: 'RUST_RUNTIME', desc: 'Memory-safe execution environment for mission-critical data.', icon: Cpu },
  ];

  return (
    <section className="max-w-7xl mx-auto px-10 py-40 grid grid-cols-1 md:grid-cols-3 gap-12 font-ui">
      {items.map((f, i) => (
        <div key={i} className="p-10 border-2 border-[#1a1a1a]/10 bg-white/50 shadow-[4px_4px_0px_#eee] hover:border-accent hover:shadow-[4px_4px_0px_#1a1a1a] transition-all group">
          <div className="w-12 h-12 bg-[#1a1a1a] text-[#f4f1ea] flex items-center justify-center mb-8 shadow-[4px_4px_0px_#ccc] group-hover:bg-accent group-hover:shadow-none transition-all">
            <f.icon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-4 text-[#1a1a1a]">{f.title}</h3>
          <p className="text-[11px] font-bold text-[#1a1a1a]/50 uppercase leading-loose tracking-widest">{f.desc}</p>
        </div>
      ))}
    </section>
  );
};
