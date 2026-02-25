import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({ children }: { children?: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-[var(--bg-dark)]">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header title="Password SI" />
                <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-dark)]">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
}
