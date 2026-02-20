import { useAuthStore } from '../../features/auth/authStore';

/**
 * Generates the Authorization header for API requests.
 */
export const getAuthHeaders = (extra: Record<string, string> = {}) => {
    // Note: Since this is used in async class methods, we access the store state directly
    const state = useAuthStore.getState();
    const user = state.user;
    const headers: Record<string, string> = { ...extra };

    if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
    }

    return headers;
};
