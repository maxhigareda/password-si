import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/dashboard');
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;

                alert('Registro exitoso.');
                // Limpiar campos
                setEmail('');
                setPassword('');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error en la autenticación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-[var(--bg-dark)]">
            <div className="w-full max-w-md p-8 card">
                <div className="flex flex-col items-center mb-8">
                    <Shield className="w-12 h-12 text-[var(--accent-green)] mb-4" />
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Password SI</h2>
                    <p className="text-[var(--text-secondary)] mt-1">
                        {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="tu@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary mt-6 disabled:opacity-50">
                        {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setEmail('');
                            setPassword('');
                            setError('');
                        }}
                        className="text-sm text-[var(--accent-green)] hover:underline"
                        disabled={loading}
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
}
