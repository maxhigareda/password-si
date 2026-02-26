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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                            <div className="mt-auto pt-4 border-t border-[var(--border-color)] w-full flex items-center justify-between">
                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                    ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20'
                                    : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                                    }`}>
                                    Rol: {user.role.toUpperCase()}
                                </span>

                                {user.id !== currentUser?.id && (
                                    <button
                                        onClick={() => toggleRole(user)}
                                        disabled={updatingId === user.id}
                                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline disabled:opacity-50"
                                    >
                                        {updatingId === user.id ? 'Cambiando...' : `Hacer ${user.role === 'admin' ? 'Viewer' : 'Admin'}`}
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
