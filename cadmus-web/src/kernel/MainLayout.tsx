// Cadmus Kernel Main Layout - V2
import { Activity, Box, ChevronRight, Cpu, Database, FolderTree, ShieldCheck, Sliders, Table, Terminal, User, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '../features/auth/authStore';
import { SpawnModal } from '../features/dashboard/components/SpawnModal';
import { dataService } from './data/DataServiceProvider';
import { useTranslation } from './i18n';
import { SidebarTreeItem } from './SidebarTreeItem';
import { useThemeStore } from './themeStore';
import { getAllDocs } from './tauri_bridge';
import { SystemStats, WorkspaceNode } from './data/IDataService';

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = useAuthStore(state => state.user);
  const { theme, setTheme } = useThemeStore();
  const [docs, setDocs] = useState<WorkspaceNode[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [cpuLoad, setCpuLoad] = useState("12.4");
  const [isSpawnOpen, setIsSpawnOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setTheme(theme);
    if (!user?.token) return;

    const fetchData = () => {
        getAllDocs(user.id)
          .then(data => setDocs(data))
          .catch(err => console.error("Sidebar fetch fail", err));

        dataService.getSystemStats(user.id)
          .then(data => setStats(data))
          .catch(err => {
              console.error("System Stats unavailable", err);
              setStats({ nodes: 0, class_distribution: {}, recent_activity_count: 0, total_links: 0, orphan_nodes: 0, untagged_nodes: 0, integrity: 1 });
          });
    };

    fetchData();
    const interval = setInterval(() => {
        fetchData();
        setCpuLoad((10 + Math.random() * 5).toFixed(1));
    }, 30000); 

    return () => clearInterval(interval);
  }, [user?.token, theme, setTheme]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'pt' : 'en');
  };

  const navItems = [
    { label: t.nav.dashboard, icon: Terminal, path: '/dashboard' },
    { label: "Livraria", icon: Database, path: '/library' },
    { label: "Databases", icon: Table, path: '/collections' },
    { label: t.nav.map, icon: Activity, path: '/map' },
    { label: t.nav.ontology, icon: Box, path: '/ontology' },
  ];

  const rootDocs = docs.filter(d => !d.parent_id);
  const currentDocId = location.pathname.startsWith('/editor/') ? location.pathname.split('/').pop() : null;

  return (
    <div className="fixed inset-0 flex bg-base text-text font-ui overflow-hidden select-none">
      <aside 
        className={clsx(
            "bg-surface border-r-2 border-border flex flex-col z-20 shadow-hard transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={clsx(
            "p-6 flex items-center border-b-2 border-border bg-muted/20 h-20",
            isCollapsed ? "justify-center" : "gap-4"
        )}>
          <Link to="/" className="shrink-0 group">
            <div className="w-10 h-10 bg-text text-base flex items-center justify-center font-black text-xl shadow-hard group-hover:scale-110 transition-transform">
              <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>C</span>
            </div>
          </Link>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[14px] font-black tracking-tighter text-text uppercase leading-none" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Cadmus
              </span>
              <span className="text-[8px] font-black tracking-[0.2em] text-accent uppercase mt-0.5 opacity-50">
                OPERATOR_CONSOLE
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col gap-8 pt-6">
          <section className="flex flex-col gap-1">
            {!isCollapsed && <p className="px-6 text-[9px] font-black text-subtext uppercase tracking-[0.3em] mb-2 opacity-40">/usr/bin</p>}
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={clsx(
                  "flex items-center transition-all group border-l-4",
                  isCollapsed ? "justify-center px-0 py-4" : "gap-3 px-6 py-2.5",
                  location.pathname.startsWith(item.path) 
                    ? "bg-accent/10 border-accent text-accent" 
                    : "border-transparent hover:bg-accent/5 hover:text-accent"
                )}>
                  <item.icon className={clsx("w-4 h-4 shrink-0", location.pathname.startsWith(item.path) ? "text-accent" : "text-subtext group-hover:text-accent")} />
                  {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>}
                </div>
              </Link>
            ))}
          </section>

          {!isCollapsed && (
              <section className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center justify-between px-6 mb-2">
                  <p className="text-[9px] font-black text-subtext uppercase tracking-[0.2em] opacity-40">/home/operator</p>
                  <button 
                    onClick={() => setIsSpawnOpen(true)}
                    className="text-accent hover:scale-125 transition-transform font-black text-sm"
                  >+</button>
                </div>
                <div className="flex flex-col">
                   {rootDocs.length > 0 ? rootDocs.map(doc => (
                     <SidebarTreeItem key={doc.id} doc={doc} allDocs={docs} depth={0} />
                   )) : (
                     <div className="px-6 py-4 text-[8px] text-subtext italic uppercase tracking-tighter opacity-30 border-2 border-border/10 m-4 border-dashed text-center">
                        [ No_Nodes_Detected ]
                     </div>
                   )}
                </div>
              </section>
          )}
        </nav>

        <div className="border-t-2 border-border bg-muted/10">
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full p-4 flex items-center justify-center text-subtext hover:text-accent hover:bg-surface transition-colors"
            >
                {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
            <Link to="/settings">
                <div className={clsx(
                "flex items-center transition-all border-2 border-transparent",
                isCollapsed ? "justify-center p-4" : "gap-3 px-4 py-3",
                location.pathname.startsWith('/settings') ? "bg-accent text-base border-accent shadow-hard" : "text-subtext hover:border-border hover:bg-surface"
                )}>
                <Sliders className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>}
                </div>
            </Link>
            <button 
                onClick={() => {
                    useAuthStore.getState().logout();
                    navigate('/');
                }}
                className="w-full"
            >
                <div className={clsx(
                "flex items-center transition-all border-t-2 border-border/10",
                isCollapsed ? "justify-center p-4" : "gap-3 px-4 py-3",
                "text-subtext hover:text-red-500 hover:bg-red-500/5 group"
                )}>
                <Box className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform" />
                {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Exit_to_Landing</span>}
                </div>
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-base relative transition-all duration-300">
        <header className="h-14 border-b-2 border-border flex items-center px-6 justify-between bg-surface shadow-sm relative z-10">
          <div className="flex items-center gap-6 text-[9px] font-black tracking-widest uppercase">
             <div className="flex items-center gap-3 text-accent bg-accent/5 px-3 py-1.5 border border-accent/20">
                <div className="w-2 h-2 bg-current animate-pulse shadow-[0_0_5px_currentColor]" />
                <span>KERNEL_READY</span>
             </div>
             <div className="h-6 w-px bg-border/30 mx-2" />
             <div className="flex items-center gap-3 text-subtext">
                <FolderTree className="w-3.5 h-3.5" />
                <span className="hover:text-accent cursor-pointer transition-colors" onClick={() => navigate('/library')}>ROOT</span>
                {location.pathname.includes('/editor/') && (
                    <>
                        <ChevronRight className="w-2.5 h-2.5 opacity-30" />
                        <span className="text-accent">EDIT_MODE</span>
                    </>
                )}
             </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={toggleLanguage} className="text-[9px] font-black px-3 py-1.5 border-2 border-border hover:border-accent hover:text-accent transition-all uppercase tracking-tighter">
                {i18n.language?.toUpperCase() || 'EN'}
            </button>
            
            <div className="flex items-center gap-4 border-l-2 border-border pl-6">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] font-black text-text uppercase leading-none tracking-tighter">{user?.username || 'GUEST'}</span>
                <span className="text-[8px] font-black text-accent uppercase tracking-widest opacity-80">SOVEREIGN</span>
              </div>
              <div className="w-9 h-9 bg-accent text-base flex items-center justify-center shadow-hard border-2 border-accent overflow-hidden">
                 {user?.avatar_url ? (
                     <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                 ) : (
                     <User className="w-5 h-5" />
                 )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto relative">
          <Outlet />
        </div>

        <footer className="h-8 border-t-2 border-border bg-muted/20 flex items-center px-6 gap-8 text-[9px] font-black text-subtext uppercase tracking-widest">
           <div className="flex items-center gap-2">
              <span className="bg-accent text-base px-1.5 py-0.5 shadow-hard">^K</span>
              <span className="opacity-60">QUICK_SEARCH_DAEMON</span>
           </div>
           <div className="ml-auto flex items-center gap-6">
              <span className="text-accent opacity-50 italic tracking-tighter">Sovereign_OS_Kernel::v0.1.0</span>
              <div className="flex items-center gap-2 text-accent">
                <div className="w-1.5 h-1.5 bg-current animate-pulse shadow-[0_0_5px_currentColor]" />
                <span>SECURE_LINK_ACTIVE</span>
              </div>
           </div>
        </footer>
      </main>

      <SpawnModal isOpen={isSpawnOpen} onClose={() => setIsSpawnOpen(false)} initialParentId={currentDocId} />
    </div>
  );
};