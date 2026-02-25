import { Search, User } from 'lucide-react';

export function Header({ title }: { title: string }) {
    return (
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-dark)] flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-xl font-semibold">{title}</h2>

            <div className="flex items-center gap-4">
                {/* Mock Search */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-[var(--bg-surface)] border-none text-sm text-[var(--text-primary)] rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)] placeholder-[var(--text-secondary)]"
                    />
                </div>

                {/* User Avatar Mock */}
                <div className="w-9 h-9 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--accent-green)] border border-[var(--border-color)]">
                    <User className="w-5 h-5" />
                </div>
            </div>
        </header>
    );
}
