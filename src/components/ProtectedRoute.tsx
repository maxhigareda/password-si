import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from './Layout';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: ('admin' | 'viewer')[] }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--bg-dark)]">
                <div className="w-10 h-10 border-4 border-[var(--accent-green)] border-t-transparent flex rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}
