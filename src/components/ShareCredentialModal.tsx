import { useState, useEffect } from 'react';
import { X, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    credentialId: string | null;
}

interface Profile {
    id: string;
    email: string;
    role: string;
}

export function ShareCredentialModal({ isOpen, onClose, credentialId }: ShareModalProps) {
    const [viewers, setViewers] = useState<Profile[]>([]);
    const [sharedWith, setSharedWith] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && credentialId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, credentialId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch all viewers
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, email, role')
                .eq('role', 'viewer');

            setViewers(profilesData || []);

            // 2. Fetch current shares for this credential
            const { data: sharesData } = await supabase
                .from('credential_shares')
                .select('viewer_id')
                .eq('credential_id', credentialId);

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
        if (!credentialId) return;
        setSaving(true);
        try {
            // Simplest way: Delete all existing shares for this cred, then insert new ones
            await supabase
                .from('credential_shares')
                .delete()
                .eq('credential_id', credentialId);

            if (sharedWith.length > 0) {
                const inserts = sharedWith.map(viewerId => ({
                    credential_id: credentialId,
                    viewer_id: viewerId
                }));

                await supabase
                    .from('credential_shares')
                    .insert(inserts);
            }
            onClose();
        } catch (error) {
            console.error('Error saving shares', error);
            alert('Error al guardar permisos');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const filteredViewers = viewers.filter(v => v.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-surface)] rounded-xl w-full max-w-md border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[var(--accent-green)]" />
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Compartir Acceso</h2>
                    </div>
                    <button onClick={onClose} className="btn-icon">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
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
                            <p className="text-center text-[var(--text-secondary)] py-4 text-sm">No se encontraron usuarios Viewer.</p>
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
