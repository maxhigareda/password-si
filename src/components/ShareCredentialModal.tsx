import { useState, useEffect } from 'react';
import { X, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    credential: { id: string; client?: string; platform: string } | null;
}

interface Profile {
    id: string;
    email: string;
    role: string;
}

export function ShareCredentialModal({ isOpen, onClose, credential }: ShareModalProps) {
    const [viewers, setViewers] = useState<Profile[]>([]);
    const [sharedWith, setSharedWith] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [shareEntireClient, setShareEntireClient] = useState(false);

    useEffect(() => {
        if (isOpen && credential) {
            setSearchTerm('');
            setShareEntireClient(false);
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, credential]);

    const fetchData = async () => {
        if (!credential) return;
        setLoading(true);
        try {
            // 1. Fetch all viewers
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, email, role');

            setViewers(profilesData || []);

            // 2. Fetch current shares for this credential
            const { data: sharesData } = await supabase
                .from('credential_shares')
                .select('viewer_id')
                .eq('credential_id', credential.id);

            if (sharesData) {
                setSharedWith(sharesData.map(s => s.viewer_id));
            } else {
                setSharedWith([]);
            }
        } catch (error) {
            console.error('Error fetching share data', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleShare = (viewerId: string) => {
        setSharedWith(prev =>
            prev.includes(viewerId)
                ? prev.filter(id => id !== viewerId)
                : [...prev, viewerId]
        );
    };

    const handleSave = async () => {
        if (!credential) return;
        setSaving(true);
        try {
            if (shareEntireClient && credential.client) {
                // Compartir TODO el cliente
                // 1. Obtener todas las credenciales de este cliente
                const { data: clientCreds, error: fetchError } = await supabase
                    .from('credentials')
                    .select('id')
                    .eq('client', credential.client);

                if (fetchError) throw fetchError;
                const credIds = clientCreds?.map(c => c.id) || [];

                if (credIds.length > 0) {
                    const inserts = [];
                    for (const credId of credIds) {
                        // Borrar comparticiones previas de estas credenciales antes de insertar todo de nuevo
                        await supabase
                            .from('credential_shares')
                            .delete()
                            .eq('credential_id', credId);

                        for (const viewerId of sharedWith) {
                            inserts.push({
                                credential_id: credId,
                                viewer_id: viewerId
                            });
                        }
                    }

                    if (inserts.length > 0) {
                        await supabase
                            .from('credential_shares')
                            .insert(inserts);
                    }
                }
            } else {
                // Comportamiento normal: Compartir SOLO esta credencial
                await supabase
                    .from('credential_shares')
                    .delete()
                    .eq('credential_id', credential.id);

                if (sharedWith.length > 0) {
                    const inserts = sharedWith.map(viewerId => ({
                        credential_id: credential.id,
                        viewer_id: viewerId
                    }));

                    await supabase
                        .from('credential_shares')
                        .insert(inserts);
                }
            }
            onClose();
        } catch (error) {
            console.error('Error saving shares', error);
            alert('Error al guardar permisos en Supabase');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !credential) return null;

    const filteredViewers = viewers.filter(v => v.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-surface)] rounded-xl w-full max-w-md border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[var(--accent-green)]" />
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-tight truncate max-w-[200px]">
                                {credential.platform}
                            </h2>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Elige quién puede ver esto
                        </p>
                    </div>
                    <button onClick={onClose} className="btn-icon self-start">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
                    {credential.client && (
                        <div className="p-4 bg-[var(--bg-dark)] border border-[var(--accent-green)]/30 rounded-lg flex gap-3 items-start animate-fade-in shadow-inner shadow-[var(--accent-green)]/5">
                            <svg className="w-5 h-5 text-[var(--accent-green)] shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Agrupar por Cliente</h3>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    Esta credencial pertenece a <strong>{credential.client}</strong>. Puedes dar acceso a todas las contraseñas de este cliente a la vez.
                                </p>
                                <label className="flex items-center gap-2 mt-3 cursor-pointer group w-fit">
                                    <input
                                        type="checkbox"
                                        checked={shareEntireClient}
                                        onChange={(e) => setShareEntireClient(e.target.checked)}
                                        className="w-4 h-4 rounded bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--accent-green)] focus:ring-[var(--accent-green)] focus:ring-offset-[var(--bg-dark)]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-green)] transition-colors">
                                        Compartir TODO el cliente
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-[var(--accent-green)] text-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {loading ? (
                            <p className="text-center text-[var(--text-secondary)] py-4 text-sm">Cargando usuarios...</p>
                        ) : filteredViewers.length === 0 ? (
                            <p className="text-center text-[var(--text-secondary)] py-4 text-sm">No se encontraron usuarios.</p>
                        ) : (
                            filteredViewers.map(viewer => {
                                const isShared = sharedWith.includes(viewer.id);
                                return (
                                    <div
                                        key={viewer.id}
                                        onClick={() => toggleShare(viewer.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isShared
                                            ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/10'
                                            : 'border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)]'
                                            }`}
                                    >
                                        <div className="truncate pr-4">
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{viewer.email}</p>
                                            <p className="text-xs text-[var(--text-secondary)] capitalize">{viewer.role}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isShared ? 'border-[var(--accent-green)] bg-[var(--accent-green)]' : 'border-[var(--text-secondary)]'
                                            }`}>
                                            {isShared && <span className="w-2.5 h-2.5 bg-[#111b21] rounded-full"></span>}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-surface)] rounded-b-xl">
                    <button onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving || loading} className="btn-primary min-w-[120px]">
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
