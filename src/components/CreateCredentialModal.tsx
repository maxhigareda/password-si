import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PasswordGenerator } from './PasswordGenerator';

interface CredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateCredentialModal({ isOpen, onClose, onSuccess }: CredentialModalProps) {
    const { user } = useAuth();
    const [platform, setPlatform] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validación de seguridad de contraseña (mínimo 8 caracteres)
        const isSecure = password.length >= 8;

        if (!isSecure) {
            setError('La contraseña debe tener al menos 8 caracteres. ¡Te sugerimos usar el generador para mayor seguridad!');
            return;
        }

        setLoading(true);

        try {
            if (!user) throw new Error('Usuario no autenticado');

            const { error: insertError } = await supabase
                .from('credentials')
                .insert([
                    {
                        owner_id: user.id,
                        platform,
                        username,
                        password,
                        url: url || null,
                    }
                ]);

            if (insertError) throw insertError;

            onSuccess();
            onClose();
            // Limpiar formulario
            setPlatform('');
            setUsername('');
            setPassword('');
            setUrl('');
        } catch (err: any) {
            console.error('Submission Error:', err);
            setError(err.message || err.error_description || 'Error al guardar credencial en la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-surface)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--border-color)] shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-surface)] z-10">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Nueva Credencial</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <form id="credForm" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Plataforma / Servicio
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={platform}
                                    onChange={e => setPlatform(e.target.value)}
                                    className="input-field"
                                    placeholder="ej. AWS, Notion, GitHub"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Usuario / Correo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="input-field"
                                    placeholder="admin@empresa.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    URL de Acceso (Opcional)
                                </label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    className="input-field"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                    Contraseña (Requerido: mínimo 8 caracteres)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input-field font-mono"
                                />
                            </div>
                        </form>

                        <div>
                            <PasswordGenerator onGenerate={setPassword} />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border-color)] flex justify-end gap-3 sticky bottom-0 bg-[var(--bg-surface)] z-10">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" form="credForm" disabled={loading} className="btn-primary min-w-[120px]">
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
