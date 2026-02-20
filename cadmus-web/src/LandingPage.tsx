import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/authStore';

// Modular Components
import { Hero } from './features/landing/components/Hero';
import { Features } from './features/landing/components/Features';
import { Manifesto } from './features/landing/components/Manifesto';

export function LandingPage() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // We allow staying on landing even if logged in for "Marketing" visibility, 
    // but typically technical apps redirect. Let's keep it flexible.
  }, [user, navigate]);

  return (
    <div className="min-h-screen w-screen bg-[#f4f1ea] text-[#1a1a1a] font-ui selection:bg-accent/30 overflow-x-hidden overflow-y-auto scroll-smooth paper-texture">
      {/* SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* NAV */}
      <nav className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between border-b-2 border-[#1a1a1a]/10 bg-[#f4f1ea]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#1a1a1a] text-[#f4f1ea] flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_#ccc]">
            <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-[0.4em] uppercase leading-none">Cadmus</span>
            <span className="text-[8px] font-bold tracking-[0.2em] opacity-40">SOVEREIGN_ENGINE_V2</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/60">
           <a href="#logic" className="hover:text-accent transition-all hover:tracking-[0.3em]">:: SYSTEM_LOGIC</a>
           <a href="#manifesto" className="hover:text-accent transition-all hover:tracking-[0.3em]">:: DATA_ETHICS</a>
        </div>

        <Link to="/login">
          <button className="px-8 py-3 bg-[#1a1a1a] text-[#f4f1ea] font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_#ccc] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            AUTH_OPERATOR
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <div id="logic" className="border-t-2 border-[#1a1a1a]/5">
        <Features />
      </div>

      {/* Manifesto Section */}
      <div id="manifesto" className="border-t-2 border-[#1a1a1a]/5">
        <Manifesto />
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-10 py-32 flex flex-col md:flex-row justify-between items-center gap-16 text-[9px] font-black uppercase tracking-[0.3em] opacity-60">
        <div className="flex items-center gap-10">
            <span>CADMUS_PROJECT_2026</span>
            <span className="opacity-30 tracking-tighter">BUILD::STABLE_0x2F</span>
        </div>
        <div className="flex gap-12">
            <a href="#" className="hover:text-accent transition-all">Protocol</a>
            <a href="#" className="hover:text-accent transition-all">Terminal</a>
            <a href="#" className="hover:text-accent transition-all">Source</a>
        </div>
        <div className="px-6 py-2 border border-[#1a1a1a] font-black tracking-widest">
            STATION_ONLINE
        </div>
      </footer>
    </div>
  );
}
