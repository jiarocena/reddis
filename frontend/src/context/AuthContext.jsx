import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('reddis_token'));
    const [loading, setLoading] = useState(true);

    // Load user from token on mount
    useEffect(() => {
        if (token) {
            api.fetchMe()
                .then(data => {
                    setUser(data);
                    setLoading(false);
                })
                .catch(() => {
                    // Token invalid/expired
                    localStorage.removeItem('reddis_token');
                    setToken(null);
                    setUser(null);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = useCallback(async (email, password) => {
        const data = await api.loginUser(email, password);
        localStorage.setItem('reddis_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (nombre, email, password, departamento) => {
        const data = await api.registerUser(nombre, email, password, departamento);
        // Auto-login if the backend returns a token
        if (data.token) {
            localStorage.setItem('reddis_token', data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('reddis_token');
        setToken(null);
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const data = await api.fetchMe();
            setUser(data);
        } catch {
            logout();
        }
    }, [token, logout]);

    const requestCollaboratorRole = useCallback(async (message) => {
        const result = await api.requestRole(message);
        await refreshUser();
        return result;
    }, [refreshUser]);

    const isAuthenticated = !!user;
    const role = user?.rol || null;

    const hasRole = useCallback((requiredRole) => {
        if (!role) return false;
        const levels = { ADMIN: 100, REFERENTE: 80, COLABORADOR: 60, USUARIO: 10 };
        return (levels[role] || 0) >= (levels[requiredRole] || 0);
    }, [role]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        role,
        login,
        register,
        logout,
        refreshUser,
        requestCollaboratorRole,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
