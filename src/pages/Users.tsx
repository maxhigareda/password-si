import { useState, useEffect } from 'react';
import { Users as UsersIcon, ShieldCheck, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface Profile {
    id: string;
    email: string;
    role: string;
    created_at: string;
}

export function Users() {
    const { role } = useAuth();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Seguridad extra: Si no es admin, no debería estar aquí
    if (role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestión de Usuarios</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Directorio de cuentas registradas en el sistema</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-8 text-center text-[var(--text-secondary)]">
                        Cargando usuarios...
                    </div>
                ) : users.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-[var(--text-secondary)]">
                        No hay usuarios registrados.
                    </div>
                ) : (
                    users.map(user => (
                        <div key={user.id} className="card p-6 flex flex-col items-center text-center gap-4 hover:border-[var(--accent-green)] transition-colors">
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-dark)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                                {user.role === 'admin' ? (
                                    <ShieldCheck className="w-8 h-8 text-[var(--accent-green)]" />
                                ) : (
                                    <UsersIcon className="w-8 h-8 text-[var(--text-primary)]" />
                                )}
                            </div>

                            <div className="w-full">
                                <h3 className="text-[var(--text-primary)] font-medium text-lg truncate px-2" title={user.email}>
                                    {user.email.split('@')[0]}
                                </h3>
                                <div className="flex items-center justify-center gap-1 mt-1 text-[var(--text-secondary)] text-sm">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate" title={user.email}>{user.email}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-[var(--border-color)] w-full">
                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                    ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20'
                                    : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                                    }`}>
                                    Rol: {user.role.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
