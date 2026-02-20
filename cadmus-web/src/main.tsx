import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './kernel/queryClient'
import './kernel/i18n'
import { AppRouter } from './kernel/AppRouter'
import './index.css'

import { useAuthStore } from './features/auth/authStore'

// --- ZENITH KINETIC SHIELD & 401 INTERCEPTOR ---
(function() {
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = (input instanceof Request) ? input.url : String(input);
        const isLocal = !url.match(/^https?:\/\//) || url.startsWith(window.location.origin);
        
        const response = await originalFetch(input, init);
        
        // GLOBAL 401 HANDLER: If server rejects token, clear session
        if (response.status === 401 && isLocal && !url.includes('/auth/login')) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }

        return response;
    };
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <AppRouter />
    </QueryClientProvider>
)