import { Terminal, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../design-system';

interface CodeWidgetProps {
  language?: string;
  code: string;
  className?: string;
}

export function CodeWidget({ language = 'plaintext', code, className }: CodeWidgetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border-2 border-accent/30 bg-[#1E2326] overflow-hidden my-6 shadow-xl ${className}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#272E33] border-b border-accent/10">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-subtext">
            SOURCE // {language}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="h-6 px-2 text-[9px] text-subtext hover:text-accent hover:bg-white/5 uppercase"
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'COPIED' : 'COPY'}
        </Button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="font-mono text-sm leading-relaxed text-[#D3C6AA]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
