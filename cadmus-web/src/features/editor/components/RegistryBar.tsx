import React from 'react';
import { Shield, Globe, WifiOff, Zap, ListTree, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from '../../../kernel/i18n';
import { Button } from '../../../design-system';

interface RegistryBarProps {
  status: 'connecting' | 'connected' | 'disconnected';
  integrity: number;
  isDirty?: boolean;
  activeUsers?: any[];
  onToggleToC?: () => void;
  onToggleComments?: () => void;
  showToC?: boolean;
  showComments?: boolean;
}

export function RegistryBar({ 
  status, integrity, isDirty, activeUsers = [], 
  onToggleToC, onToggleComments, 
  showToC, showComments 
}: RegistryBarProps) {
  const { t } = useTranslation();

  const statusConfig = {
    connected: {
      color: 'text-terminal-green',
      bg: 'bg-terminal-green/10',
      label: t.editor.status.connected,
      icon: Globe
    },
    connecting: {
      color: 'text-terminal-yellow',
      bg: 'bg-terminal-yellow/10',
      label: t.editor.status.connecting,
      icon: Zap
    },
    disconnected: {
      color: 'text-terminal-red',
      bg: 'bg-terminal-red/10',
      label: t.editor.status.disconnected,
      icon: WifiOff
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between px-6 py-2 border-b-2 border-accent-border bg-mantle shadow-sm transition-all duration-500">
      <div className="flex items-center gap-6">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-2.5 h-2.5 rounded-full",
            status === 'connected' ? "bg-terminal-green shadow-[0_0_8px_var(--color-green)]" : "bg-terminal-red animate-pulse",
            status === 'connecting' && "bg-terminal-yellow animate-bounce"
          )} />
          <div className="flex flex-col">
            <span className="text-[10px] text-text font-black uppercase tracking-[0.2em]">
              {t.editor.registry_link} :: {config.label}
            </span>
            <div className="flex items-center gap-2">
              <config.icon className={clsx("w-3 h-3", config.color)} />
              <span className="text-[8px] text-subtext font-bold uppercase">
                Latency: 24ms // Protocol: Yjs_v13
              </span>
            </div>
          </div>
        </div>

        {/* GAP 8: OPERATOR_PRESENCE */}
        <div className="flex -space-x-2">
          {activeUsers.map((u, i) => (
            <div 
              key={i} 
              className="w-6 h-6 rounded-full border-2 border-mantle flex items-center justify-center text-[8px] font-black text-crust uppercase shadow-sm"
              style={{ backgroundColor: u.color }}
              title={u.name}
            >
              {u.name.slice(0, 1)}
            </div>
          ))}
        </div>

        {/* Integrity Index */}
        <div className="hidden md:flex flex-col gap-1 border-l-2 border-accent-border/20 pl-6">
          <span className="text-[9px] font-black text-subtext uppercase tracking-widest">{t.common.integrity}</span>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 bg-crust rounded-full overflow-hidden border border-accent-border/30">
              <div 
                className="h-full bg-accent transition-all duration-1000 ease-out" 
                style={{ width: `${(integrity * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-accent">{(integrity * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Layout Toggles */}
        <div className="flex items-center gap-1 bg-crust p-1 rounded-lg border border-accent-border/20 mr-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleToC}
            className={clsx("h-7 px-2 text-[9px] gap-2", showToC ? "bg-accent text-crust" : "text-subtext")}
          >
            <ListTree className="w-3.5 h-3.5" /> TOC
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleComments}
            className={clsx("h-7 px-2 text-[9px] gap-2", showComments ? "bg-accent text-crust" : "text-subtext")}
          >
            <MessageSquare className="w-3.5 h-3.5" /> REVIEWS
          </Button>
        </div>

        {/* Sync Indicator */}
        {isDirty ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-terminal-yellow/10 border border-terminal-yellow/30 rounded-lg animate-pulse">
            <Zap className="w-3 h-3 text-terminal-yellow" />
            <span className="text-[9px] font-black text-terminal-yellow uppercase tracking-tighter">Local_Changes_Pending</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-terminal-green/5 border border-terminal-green/20 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-terminal-green opacity-50" />
            <span className="text-[9px] font-black text-subtext uppercase">{t.editor.sovereign_active}</span>
          </div>
        )}
      </div>
    </div>
  );
}
