import { useState, useEffect } from 'react';
import { Users as UsersIcon, ShieldCheck, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface Profile {
    id: string;
    email: string;
    role: string;
}

export function Users() {
    const { user: currentUser, role } = useAuth();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_all_profiles');

        if (error) {
            console.error('Error fetching users:', error);
            setErrorMsg(error.message || 'Error desconocido al cargar usuarios');
        } else {
            setUsers(data || []);
            setErrorMsg(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line
        fetchUsers();
    }, []);

    const toggleRole = async (targetUser: Profile) => {
        if (targetUser.id === currentUser?.id) {
            alert("No puedes cambiar tu propio rol por seguridad.");
            return;
        }

        const newRole = targetUser.role === 'admin' ? 'viewer' : 'admin';
        const confirmMessage = `¿Estás seguro de que deseas hacer a este usuario ${newRole.toUpperCase()}?`;

        if (!confirm(confirmMessage)) return;

        setUpdatingId(targetUser.id);

        const { error } = await supabase.rpc('admin_update_user_role', {
            target_id: targetUser.id,
            new_role: newRole
        });

        if (error) {
            console.error("Error updating role:", error);
            alert("Error al cambiar el rol. Asegate de haber ejecutado el script SQL en Supabase.");
        } else {
            // Actualizar localmente la lista
            setUsers(prev => prev.map(u =>
                u.id === targetUser.id ? { ...u, role: newRole } : u
            ));
        }

        setUpdatingId(null);
    };

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

            <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 divide-y border-y border-[var(--border-color)] md:gap-6 md:divide-hidden md:border-none">
                {loading ? (
                    <div className="col-span-full py-8 text-center text-[var(--text-secondary)]">
                        Cargando usuarios...
                    </div>
                ) : errorMsg ? (
                    <div className="col-span-full py-8 text-center text-red-400 bg-red-400/10 rounded-lg">
                        <p className="font-semibold">Error de Base de Datos:</p>
                        <p>{errorMsg}</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-[var(--text-secondary)]">
                        No hay usuarios registrados. (O fallaron los permisos)
                    </div>
                ) : (
                    users.map(user => (
                        <div key={user.id} className="p-4 md:p-6 flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-3 md:gap-4 md:card hover:bg-[var(--bg-surface-hover)] transition-colors">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--bg-dark)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                                {user.role === 'admin' ? (
                                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[var(--accent-green)]" />
                                ) : (
                                    <UsersIcon className="w-6 h-6 md:w-8 md:h-8 text-[var(--text-primary)]" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-[var(--text-primary)] font-medium text-base md:text-lg truncate md:px-2" title={user.email}>
                                    {user.email.split('@')[0]}
                                </h3>
                                <div className="flex items-center md:justify-center gap-1 mt-0.5 md:text-[var(--text-secondary)] text-xs md:text-sm">
                                    <Mail className="w-3 h-3 flex-shrink-0 text-[var(--text-secondary)]" />
                                    <span className="truncate text-[var(--text-secondary)]" title={user.email}>{user.email}</span>
                                </div>
                                <div className="mt-1.5 md:hidden">
                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border ${user.role === 'admin'
                                        ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20'
                                        : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] border-[var(--border-color)]'
                                        }`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-center md:mt-auto md:pt-4 md:border-t border-[var(--border-color)] md:w-full md:flex-row md:items-center md:justify-between">
                                <span className={`hidden md:inline-block px-3 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                    ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20'
                                    : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                                    }`}>
                                    Rol: {user.role.toUpperCase()}
                                </span>

                                {user.id !== currentUser?.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleRole(user);
                                        }}
                                        disabled={updatingId === user.id}
                                        className="text-[11px] md:text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 whitespace-nowrap bg-[var(--bg-dark)] md:bg-transparent px-2.5 py-1.5 md:p-0 rounded-md border border-[var(--border-color)] md:border-none md:underline"
                                    >
                                        {updatingId === user.id ? '...' : `Hacer ${user.role === 'admin' ? 'Viewer' : 'Admin'}`}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
