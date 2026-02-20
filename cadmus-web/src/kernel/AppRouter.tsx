import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { CollaborativeEditor } from '../features/editor';
import { SchemaMap } from '../features/canvas';
import { OntologyManager } from '../features/collection';
import { Dashboard } from '../features/dashboard';
import { CollectionsHub } from '../features/collections/CollectionsHub';
import { FortuneSheetEditor } from '../features/collections/FortuneSheetEditor';
import { SettingsShell } from '../features/settings/SettingsShell';
import { Library } from '../features/library/Library';
import { SovereignDashboardEditor } from '../features/editor/components/specialized/SovereignDashboardEditor';
import { SovereignTaskEditor } from '../features/editor/components/specialized/SovereignTaskEditor';
import { LandingPage } from '../LandingPage';
import { useAuthStore } from '../features/auth/authStore';
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';
import { SmartErrorBoundary } from '../components/ErrorBoundary';
import { dataService } from './data/DataServiceProvider';

const EditorWrapper = () => {
    const { docId } = useParams<{ docId: string }>();
    const [classId, setClassId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (docId && docId !== 'new-doc' && docId.match(/^[0-9a-fA-F-]{36}$/)) {
            dataService.getDoc(docId).then(doc => {
                setClassId(doc.class_id || 'note');
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [docId]);

    if (isLoading) return <div className="h-full flex items-center justify-center font-mono text-accent animate-pulse uppercase tracking-widest">Accessing_Sovereign_Node...</div>;

    if (classId === 'folha') {
        return <FortuneSheetEditor docId={docId!} />;
    }

    if (classId === 'container' || classId === 'project' || classId === 'ledger') {
        return (
            <SmartErrorBoundary key={docId}>
                <SovereignDashboardEditor docId={docId!} />
            </SmartErrorBoundary>
        );
    }

    if (classId === 'task') {
        return (
            <SmartErrorBoundary key={docId}>
                <SovereignTaskEditor docId={docId!} />
            </SmartErrorBoundary>
        );
    }

    return (
        <SmartErrorBoundary key={docId}>
            <CollaborativeEditor docId={docId || 'new-doc'} />
        </SmartErrorBoundary>
    );
};

const ProtectedRoute = () => {
    const { user, vaultSecret, _hasHydrated, setHasHydrated } = useAuthStore();
    
    // FAIL-SAFE: Force hydration complete after timeout to prevent infinite loading
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!_hasHydrated) {
                console.warn("[Router] Hydration fail-safe triggered.");
                setHasHydrated(true);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [_hasHydrated, setHasHydrated]);

    if (!_hasHydrated) return (
        <div className="fixed inset-0 bg-base flex flex-col items-center justify-center gap-6 font-ui">
            <div className="p-4 border-2 border-accent shadow-hard animate-pulse">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent animate-spin" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent animate-pulse">Establishing_Sovereign_Session...</span>
        </div>
    ); 
    
    // Detect if running in Tauri
    const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);

    // SOVEREIGN RULE: No keys, no access. 
    // EXCEPT for Tauri, which is local-first and doesn't always require a remote token or vault secret.
    if (!isTauri && (!user || !user.token || !vaultSecret)) {
        return <Navigate to="/login" />;
    }

    // In Tauri, if there's no user, we inject a default 'SOVEREIGN' user to avoid UI breaks
    if (isTauri && !user) {
        // We use a stable UUID for the local user
        useAuthStore.getState().setUser({
            id: '00000000-0000-0000-0000-000000000000',
            username: 'SOVEREIGN',
            token: 'local-session'
        });
        useAuthStore.getState().setVaultSecret('local-vault');
    }
    
    return <Outlet />;
};

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (Public) */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/collections" element={<CollectionsHub />} />
            <Route path="/map" element={<SchemaMap />} />
            <Route path="/ontology" element={<OntologyManager />} />
            <Route path="/settings/*" element={<SettingsShell />} />
            
            {/* Direct Editor Access */}
            <Route path="/editor/:docId" element={
                <div className="h-full w-full max-w-none">
                <EditorWrapper />
                </div>
            } />
            </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
