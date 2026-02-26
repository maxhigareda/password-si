import { NavLink } from 'react-router-dom';
import { KeyRound, Users, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
    const { role } = useAuth();
    return (
        <div className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-dark)] h-screen flex flex-col">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center gap-3">
                <Shield className="text-[var(--accent-green)] w-8 h-8" />
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Password SI</h1>
            </div>

            <nav className="flex-1 py-4">
                <ul className="space-y-1">
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-6 py-3 transition-colors ${isActive
                                    ? 'bg-[var(--bg-surface-hover)] border-l-4 border-[var(--accent-green)] text-[var(--accent-green)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] border-l-4 border-transparent'
                                }`
                            }
                        >
                            <KeyRound className="w-5 h-5" />
                            Contraseñas
                        </NavLink>
                    </li>
                    {role === 'admin' && (
                        <li>
                            <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-6 py-3 transition-colors ${isActive
                                        ? 'bg-[var(--bg-surface-hover)] border-l-4 border-[var(--accent-green)] text-[var(--accent-green)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] border-l-4 border-transparent'
                                    }`
                                }
                            >
                                <Users className="w-5 h-5" />
                                Usuarios
                            </NavLink>
                        </li>
                    )}
                </ul>
            </nav>

            <div className="p-4 border-t border-[var(--border-color)]">
                <button className="w-full btn-secondary text-sm">
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
