import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    role: 'admin' | 'viewer' | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'viewer' | null>(null);
    const [loading, setLoading] = useState(true);

    // Refs para evitar el problema de "stale closures" en useEffect
    const userRef = React.useRef<User | null>(null);
    const roleRef = React.useRef<'admin' | 'viewer' | null>(null);

    // Helpers para actualizar state y refs sincronizadamente
    const updateUserAndRole = (newUser: User | null, newRole: 'admin' | 'viewer' | null) => {
        userRef.current = newUser;
        roleRef.current = newRole;
        setUser(newUser);
        setRole(newRole);
    };

    useEffect(() => {
        const fetchInitialSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session?.user) {
                    let { data, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();

                    // Compensación de tiempo para el Trigger de la DB: 
                    // Si el perfil no existe "aun" (PGRST116), reintenta en breve.
                    if (error && error.code === 'PGRST116') {
                        await new Promise(res => setTimeout(res, 1000));
                        const retry = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                        data = retry.data;
                        error = retry.error;
                    }

                    if (error) {
                        // User was likely deleted from the database but local session remains
                        await supabase.auth.signOut();
                        updateUserAndRole(null, null);
                    } else {
                        updateUserAndRole(session.user, data?.role || 'viewer');
                    }
                } else {
                    updateUserAndRole(null, null);
                }
            } catch (error) {
                console.error("Error during initial session fetch:", error);
                updateUserAndRole(null, null);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialSession();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === 'INITIAL_SESSION') return; // ya lo manejamos arriba

            // Evitar llamadas duplicadas: si el usuario es el mismo y ya tenemos su rol (leyendo del Ref actualizado)
            if (session?.user?.id === userRef.current?.id && roleRef.current !== null) {
                return;
            }

            try {
                if (session?.user) {
                    // Fetch role from profiles table
                    let { data, error } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (error && error.code === 'PGRST116') {
                        await new Promise(res => setTimeout(res, 1000));
                        const retry = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                        data = retry.data;
                        error = retry.error;
                    }

                    if (error) {
                        await supabase.auth.signOut();
                        updateUserAndRole(null, null);
                    } else {
                        updateUserAndRole(session.user, data?.role || 'viewer');
                    }
                } else {
                    updateUserAndRole(null, null);
                }
            } catch (error) {
                console.error("Error during auth state change:", error);
                updateUserAndRole(null, null);
            } finally {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
