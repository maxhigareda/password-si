import { NavLink } from 'react-router-dom';
import { KeyRound, Users, Shield, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { role } = useAuth();

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border-color)] bg-[var(--bg-dark)] h-screen flex flex-col
                transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="p-4 md:p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="text-[var(--accent-green)] w-8 h-8 flex-shrink-0" />
                        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Password SI</h1>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        <li>
                            <NavLink
                                to="/dashboard"
                                onClick={() => onClose && onClose()}
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
                                    onClick={() => onClose && onClose()}
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
        </>
    );
}
