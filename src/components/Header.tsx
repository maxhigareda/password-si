import { Search, User, Menu } from 'lucide-react';

export function Header({ title, onMenuClick }: { title: string, onMenuClick?: () => void }) {
    return (
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-dark)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 flex-shrink-0 w-full">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] truncate">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Mock Search */}
                <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-[var(--bg-surface)] border-none text-sm text-[var(--text-primary)] rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)] placeholder-[var(--text-secondary)] w-full max-w-[200px]"
                    />
                </div>

                {/* User Avatar Mock */}
                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--accent-green)] border border-[var(--border-color)]">
                    <User className="w-5 h-5" />
                </div>
            </div>
        </header>
    );
}
