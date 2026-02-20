import { Activity } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

interface LogFeedWidgetProps {
  entries: LogEntry[];
}

export function LogFeedWidget({ entries }: LogFeedWidgetProps) {
  return (
    <div className="my-6 rounded-lg bg-[#1E2326] border-l-4 border-accent p-4 font-mono text-xs shadow-lg">
      <div className="flex items-center gap-2 mb-4 text-subtext border-b border-white/10 pb-2">
        <Activity className="w-3 h-3 text-accent" />
        <span className="font-black uppercase tracking-widest">SESSION_LOG // KINETIC_TRACE</span>
      </div>
      
      <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
        {entries.length === 0 ? (
          <div className="text-white/30 italic">NO_ACTIVITY_DETECTED...</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-3 text-[#D3C6AA] opacity-80 hover:opacity-100 hover:bg-white/5 p-1 rounded">
              <span className="text-white/40 min-w-[80px]">{entry.timestamp}</span>
              <span className="text-accent font-bold min-w-[100px]">{entry.action}</span>
              <span className="truncate">{entry.details}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
