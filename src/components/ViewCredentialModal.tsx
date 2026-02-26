import { useState } from 'react';
import { X, Copy, Eye, EyeOff, Shield } from 'lucide-react';

interface Credential {
    id: string;
    platform: string;
    username: string;
    password?: string;
    url: string | null;
}

interface ViewCredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    credential: Credential | null;
}

export function ViewCredentialModal({ isOpen, onClose, credential }: ViewCredentialModalProps) {
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen || !credential) return null;

    const copyToClipboard = (text?: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-md shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-dark)] flex items-center justify-center border border-[var(--border-color)]">
                            <Shield className="w-5 h-5 text-[var(--accent-green)]" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">
                            {credential.platform}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* URL */}
                    {credential.url && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">URL / Web</label>
                            <a
                                href={credential.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[var(--accent-green)] hover:underline break-all block p-3 bg-[var(--bg-dark)] rounded-lg border border-[var(--border-color)]"
                            >
                                {credential.url}
                            </a>
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-[var(--text-secondary)]">Usuario / Correo</label>
                            <button onClick={() => copyToClipboard(credential.username)} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                                <Copy className="w-3 h-3" /> Copiar
                            </button>
                        </div>
                        <div className="p-4 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-mono break-all">
                            {credential.username}
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-[var(--text-secondary)]">Contraseña</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowPassword(!showPassword)} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {showPassword ? 'Ocultar' : 'Mostrar'}
                                </button>
                                <button onClick={() => copyToClipboard(credential.password)} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> Copiar
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-mono break-all text-lg">
                            {showPassword ? (
                                credential.password
                            ) : (
                                <span className="tracking-[0.2em]">••••••••••••</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border-color)]">
                    <button onClick={onClose} className="w-full btn-secondary py-3">
                        Cerrar panel
                    </button>
                </div>
            </div>
        </div>
    );
}
