import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../design-system';

interface Props {
  children?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SmartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Sovereign Error] in Widget <${this.props.name || 'Unknown'}>:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border-2 border-dashed border-terminal-red/30 bg-terminal-red/5 rounded-2xl flex flex-col items-center gap-4 text-center my-4 animate-in fade-in duration-500">
          <div className="w-12 h-12 bg-terminal-red/10 rounded-full flex items-center justify-center text-terminal-red">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-text">Widget_Failure</h3>
            <p className="text-[10px] text-subtext font-bold uppercase max-w-[250px]">
              The Sovereign Engine could not render this block. Data integrity remains intact.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => this.setState({ hasError: false })}
            className="h-8 text-[9px] gap-2 border border-accent-border hover:border-terminal-red"
          >
            <RefreshCw className="w-3 h-3" /> RELOAD_WIDGET
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}