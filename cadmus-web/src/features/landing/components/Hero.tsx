import { ArrowRight, Monitor, Laptop, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export const Hero = () => {
  const [os, setOs] = useState<'windows' | 'linux' | 'other'>('windows');

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('win')) setOs('windows');
    else if (platform.includes('linux')) setOs('linux');
    else setOs('other');
  }, []);

  const handleDownload = () => {
    const downloadUrls = {
      windows: '/cadmus_setup.msi',
      linux: '/cadmus.AppImage',
      other: '#'
    };
    const link = document.createElement('a');
    link.href = downloadUrls[os];
    link.download = os === 'windows' ? 'cadmus_setup.msi' : 'cadmus.AppImage';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="max-w-7xl mx-auto px-10 py-40 flex flex-col items-center text-center gap-16 font-ui relative">
      {/* DECORATIVE TERMINAL TAG */}
      <div className="px-6 py-2 bg-[#1a1a1a] text-[#f4f1ea] text-[10px] font-black uppercase tracking-[0.5em] shadow-[4px_4px_0px_#ccc]">
        NODE_STATUS::CONNECTED
      </div>
      
      <div className="space-y-6">
        <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase max-w-6xl leading-[0.8] text-[#1a1a1a]">
          The <span className="text-accent">Protocol</span> <br />
          For <span className="underline decoration-[#1a1a1a]/10">Intel</span>.
        </h1>
        <p className="text-[#1a1a1a]/60 text-lg md:text-xl font-black max-w-2xl mx-auto uppercase tracking-[0.2em] leading-relaxed">
          Local-First Knowledge Infrastructure. <br/>
          Built for high-stakes operational environments.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 mt-8">
        <Link to="/signup">
          <button className="px-16 h-20 bg-accent text-[#f4f1ea] text-lg font-black uppercase tracking-[0.2em] shadow-[6px_6px_0px_#1a1a1a] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-4">
            <Zap className="w-6 h-6 fill-current" />
            INITIALIZE_SYNC
          </button>
        </Link>
        <button 
          onClick={handleDownload}
          className="px-12 h-20 border-4 border-[#1a1a1a] text-[#1a1a1a] font-black uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-[#f4f1ea] group transition-all shadow-[6px_6px_0px_#ccc] relative"
        >
           <div className="flex items-center gap-4 relative z-10">
              <span className="text-sm">OBTAIN_{os.toUpperCase()}_BINARY</span>
              {os === 'windows' ? <Monitor className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
           </div>
        </button>
      </div>

      {/* METRIC FOOTNOTE */}
      <div className="mt-20 flex gap-12 text-[10px] font-bold text-[#1a1a1a]/30 uppercase tracking-widest">
        <span>[ Latency: 0.00ms ]</span>
        <span>[ Encryption: AES-256 ]</span>
        <span>[ Storage: Local_First ]</span>
      </div>
    </header>
  );
};
