import { User, Shield, Zap, Palette, Layout, Sliders } from 'lucide-react';
import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { clsx } from 'clsx';

// Modular Components
import { ProfileSettings } from './components/ProfileSettings';
import { AppearanceSettings } from './components/AppearanceSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { IntelligenceSettings } from './components/IntelligenceSettings';
import { EditorSettings } from './components/EditorSettings';

export function SettingsShell() {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  
  const menuItems = [
    { label: 'Profile_Identity', icon: User, path: '/settings/profile' },
    { label: 'Security_Core', icon: Shield, path: '/settings/security' },
    { label: 'Intelligence_Neural', icon: Zap, path: '/settings/intelligence' },
    { label: 'Editor_Runtime', icon: Layout, path: '/settings/editor' },
    { label: 'Appearance_Matrix', icon: Palette, path: '/settings/appearance' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-12 h-full flex flex-col md:flex-row gap-16 font-ui">
      <aside className="w-full md:w-72 flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-accent/10 border-2 border-accent shadow-hard">
                <Sliders className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-text leading-none">
                Sys<br/><span className="text-accent">Config</span>
            </h1>
        </div>

        <div className="flex flex-col gap-2 flex-1">
            {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
                <div className={clsx(
                "flex items-center gap-4 px-6 py-4 transition-all font-black text-[10px] uppercase tracking-[0.2em] border-2",
                location.pathname === item.path 
                    ? "bg-accent text-base shadow-hard border-accent" 
                    : "text-subtext hover:bg-accent/5 hover:text-text border-transparent"
                )}>
                <item.icon className="w-4 h-4" />
                {item.label}
                </div>
            </Link>
            ))}
        </div>

        <button 
            onClick={logout} 
            className="mt-12 flex items-center gap-4 px-6 py-4 text-accent hover:bg-accent/10 font-black text-[10px] tracking-[0.3em] uppercase border-2 border-accent transition-all shadow-hard active:translate-y-1 active:shadow-none"
        >
            TERMINATE_SESSION
        </button>
      </aside>

      <main className="flex-1 bg-surface border-2 border-border p-16 shadow-hard overflow-y-auto custom-scrollbar relative">
        {/* Paper Corner Detail */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-base border-l-2 border-b-2 border-border shadow-[-4px_4px_0_rgba(0,0,0,0.05)]" />
        
        <Routes>
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="intelligence" element={<IntelligenceSettings />} />
          <Route path="editor" element={<EditorSettings />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          <Route path="/" element={<Navigate to="profile" replace />} />
        </Routes>
      </main>
    </div>
  );
}