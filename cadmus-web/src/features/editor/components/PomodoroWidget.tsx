import React, { useState, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';
import { Button } from '../../../design-system';

export const PomodoroWidget = (props: NodeViewProps) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <NodeViewWrapper className="my-6">
      <div className="bg-mantle border border-accent-border p-4 rounded-xl flex flex-col gap-4 shadow-sm max-w-xs mx-auto">
        <div className="flex items-center justify-between border-b border-accent-border pb-2">
            <div className="flex items-center gap-2 text-accent">
                <Timer className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Focus_Engine</span>
            </div>
            <button onClick={() => props.deleteNode()} className="text-subtext hover:text-terminal-red">
                <X className="w-3 h-3" />
            </button>
        </div>

        <div className="text-4xl font-mono font-bold text-center text-text py-2">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>

        <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={toggle}>
                {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="sm" className="border border-accent-border" onClick={reset}>
                <RotateCcw className="w-3 h-3" />
            </Button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
