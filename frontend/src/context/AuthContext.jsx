import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/client';
import { TOKEN_STORAGE_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
    }, []);

    useEffect(() => {
        api.setUnauthorizedHandler(logout);
    }, [logout]);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) {
            setLoading(false);
            return;
        }
        api.getMe()
            .then(setUser)
            .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (email, password) => {
        const { access_token } = await api.login(email, password);
        localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
        const me = await api.getMe();
        setUser(me);
        return me;
    }, []);

    const signup = useCallback(async (email, name, password) => {
        // No auto-login: the account is created unverified, and login is
        // blocked until the verification link is used (app/api/v1/auth.py).
        return api.signup(email, name, password);
    }, []);

    const verifyEmail = useCallback(async (token) => {
        return api.verifyEmail(token);
    }, []);

    const updateProfile = useCallback(async (data) => {
        const updated = await api.updateProfile(data);
        setUser(updated);
        return updated;
    }, []);

    const removeAvatar = useCallback(async () => {
        const updated = await api.deleteAvatar();
        setUser(updated);
        return updated;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, verifyEmail, updateProfile, removeAvatar, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
