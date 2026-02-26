import { useState, useEffect } from 'react';
import { Plus, Copy, Eye, KeyRound, ExternalLink, Trash2, Users, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CreateCredentialModal } from '../components/CreateCredentialModal';
import { ShareCredentialModal } from '../components/ShareCredentialModal';
import { ViewCredentialModal } from '../components/ViewCredentialModal';

interface Credential {
    id: string; // uuid from DB
    platform: string;
    username: string;
    password?: string;
    url: string | null;
}

export function Dashboard() {
    const { role } = useAuth();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
    const [shareModalCredId, setShareModalCredId] = useState<string | null>(null);
    const [viewingCredential, setViewingCredential] = useState<Credential | null>(null);
    const [expandedCredId, setExpandedCredId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedCredId(prev => (prev === id ? null : id));
    };

    const openCreateModal = () => {
        setEditingCredential(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (cred: Credential) => {
        setEditingCredential(cred);
        setIsCreateModalOpen(true);
    };

    const fetchCredentials = async () => {
        setLoading(true);
        // Gracias a RLS (Level Security), simplemente pedimos todas y supabase filtra
        const { data, error } = await supabase
            .from('credentials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching credentials:', error);
        } else {
            setCredentials(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line
        fetchCredentials();
    }, []);

    const copyToClipboard = (text?: string) => {
        if (text) navigator.clipboard.writeText(text);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta credencial?')) return;

        const { error } = await supabase.from('credentials').delete().eq('id', id);
        if (error) {
            alert('Error eliminando credencial');
        } else {
            fetchCredentials();
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tus Contraseñas</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Gestiona de forma segura los accesos corporativos</p>
                </div>
                {role === 'admin' && (
                    <button onClick={openCreateModal} className="btn-primary">
                        <Plus className="w-5 h-5" />
                        Nueva Credencial
                    </button>
                )}
            </div>

            {/* Vista para móviles */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="py-8 text-center text-[var(--text-secondary)] card">Cargando credenciales...</div>
                ) : credentials.length === 0 ? (
                    <div className="py-8 text-center text-[var(--text-secondary)] card">No hay credenciales guardadas</div>
                ) : (
                    credentials.map(cred => {
                        const isExpanded = expandedCredId === cred.id;
                        return (
                            <div key={`mobile-${cred.id}`} className="card p-4 flex flex-col gap-4">
                                {/* Header / Tappable Toggle Area */}
                                <div
                                    className="flex items-center justify-between gap-2 cursor-pointer select-none"
                                    onClick={() => toggleExpand(cred.id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-dark)] flex items-center justify-center border border-[var(--border-color)] flex-shrink-0">
                                            <KeyRound className="w-5 h-5 text-[var(--accent-green)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-medium text-[var(--text-primary)] truncate">{cred.platform}</span>
                                            {cred.url && (
                                                <a
                                                    href={cred.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-green)] flex items-center gap-1 mt-0.5 w-fit"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="truncate max-w-[150px] inline-block">{new URL(cred.url).hostname}</span>
                                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Copy button is always visible for quick access */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyToClipboard(cred.password);
                                            }}
                                            className="btn-icon focus:ring-2 focus:ring-[var(--accent-green)]"
                                            title="Copiar contraseña"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="animate-fade-in flex flex-col gap-4 mt-2 border-t border-[var(--border-color)] pt-4">
                                        <div className="bg-[var(--bg-dark)] rounded-lg p-3 border border-[var(--border-color)]">
                                            <div className="text-xs text-[var(--text-secondary)] mb-1">Usuario / Correo</div>
                                            <div className="text-sm font-mono text-[var(--text-primary)] break-all">{cred.username}</div>
                                        </div>

                                        <div className="bg-[var(--bg-dark)] rounded-lg p-3 border border-[var(--border-color)] flex justify-between items-center gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs text-[var(--text-secondary)] mb-1">Contraseña</div>
                                                <div className="text-sm font-mono tracking-widest text-[var(--text-primary)] truncate">
                                                    ••••••••
                                                </div>
                                            </div>
                                            <button onClick={() => setViewingCredential(cred)} className="btn-secondary text-sm flex-shrink-0" title="Ver Detalles">
                                                <Eye className="w-4 h-4 mr-1" />
                                                Ver
                                            </button>
                                        </div>

                                        {role === 'admin' && (
                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <button onClick={() => openEditModal(cred)} className="btn-secondary flex justify-center text-xs py-2.5 w-full" title="Editar">
                                                    <Edit className="w-4 h-4 mr-1.5" />
                                                    Editar
                                                </button>
                                                <button onClick={() => setShareModalCredId(cred.id)} className="btn-secondary flex justify-center text-xs py-2.5 w-full" title="Compartir">
                                                    <Users className="w-4 h-4 mr-1.5" />
                                                    Compartir
                                                </button>
                                                <button onClick={() => handleDelete(cred.id)} className="btn-secondary !text-red-400 hover:!bg-red-400/10 flex justify-center text-xs py-2.5 w-full col-span-2" title="Eliminar">
                                                    <Trash2 className="w-4 h-4 mr-1.5" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Vista para escritorio */}
            <div className="hidden md:block card overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-color)]">
                            <th className="py-4 px-6 font-semibold text-[var(--text-secondary)]">Plataforma</th>
                            <th className="py-4 px-6 font-semibold text-[var(--text-secondary)]">Usuario / Correo</th>
                            <th className="py-4 px-6 font-semibold text-[var(--text-secondary)]">Contraseña</th>
                            <th className="py-4 px-6 font-semibold text-[var(--text-secondary)] text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-[var(--text-secondary)]">Cargando credenciales...</td>
                            </tr>
                        ) : credentials.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-[var(--text-secondary)]">No hay credenciales guardadas</td>
                            </tr>
                        ) : (
                            credentials.map(cred => (
                                <tr key={cred.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md bg-[var(--bg-dark)] flex items-center justify-center border border-[var(--border-color)] flex-shrink-0">
                                                <KeyRound className="w-5 h-5 text-[var(--accent-green)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block font-medium text-[var(--text-primary)] truncate">{cred.platform}</span>
                                                {cred.url && (
                                                    <a href={cred.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-green)] flex items-center gap-1 mt-0.5 w-fit">
                                                        <span className="truncate max-w-[150px] inline-block">{new URL(cred.url).hostname}</span>
                                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-[var(--text-primary)] font-mono text-sm">{cred.username}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono tracking-widest text-[var(--text-primary)] bg-[var(--bg-dark)] px-3 py-1 rounded inline-block min-w-[120px] text-center select-none">
                                                ••••••••
                                            </span>
                                            <button onClick={() => setViewingCredential(cred)} className="btn-icon" title="Ver Detalles">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => copyToClipboard(cred.password)} className="btn-secondary text-sm">
                                                <Copy className="w-4 h-4" />
                                                Copiar
                                            </button>
                                            {role === 'admin' && (
                                                <>
                                                    <button onClick={() => openEditModal(cred)} className="btn-icon" title="Editar">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setShareModalCredId(cred.id)} className="btn-icon" title="Compartir">
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(cred.id)} className="btn-icon !text-red-400 hover:!bg-red-400/10" title="Eliminar">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CreateCredentialModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingCredential(null);
                }}
                onSuccess={fetchCredentials}
                initialData={editingCredential}
            />

            <ShareCredentialModal
                isOpen={!!shareModalCredId}
                onClose={() => setShareModalCredId(null)}
                credentialId={shareModalCredId}
            />

            <ViewCredentialModal
                isOpen={!!viewingCredential}
                onClose={() => setViewingCredential(null)}
                credential={viewingCredential}
            />
        </div>
    );
}
