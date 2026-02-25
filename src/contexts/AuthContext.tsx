import { createContext, useContext, useEffect, useState } from 'react';
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

    useEffect(() => {
        const fetchInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
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
                    setUser(null);
                    setRole(null);
                } else {
                    setUser(session.user);
                    setRole(data?.role || 'viewer');
                }
            }
            setLoading(false);
        };

        fetchInitialSession();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === 'INITIAL_SESSION') return; // ya lo manejamos arriba

            setUser(session?.user || null);

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
                    setUser(null);
                    setRole(null);
                } else {
                    setRole(data?.role || 'viewer'); // Por defecto viewer si no hay
                }
            } else {
                setRole(null);
            }
            setLoading(false);
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
