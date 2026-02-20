import { clsx } from 'clsx';

interface GaugeWidgetProps {
  value: number; // 0 to 1
  label: string;
  className?: string;
}

export function GaugeWidget({ value, label, className }: GaugeWidgetProps) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);
  const color = percentage > 80 ? 'bg-terminal-green' : percentage > 40 ? 'bg-terminal-yellow' : 'bg-terminal-red';

  return (
    <div className={clsx("my-6 p-4 bg-mantle border border-border rounded-xl shadow-sm", className)}>
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-text">{label}</span>
        <span className="text-xs font-mono font-bold text-subtext">{percentage.toFixed(1)}%</span>
      </div>
      
      <div className="h-2 w-full bg-crust rounded-full overflow-hidden">
        <div 
          className={clsx("h-full transition-all duration-500 ease-out", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
