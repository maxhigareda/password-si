import { useState, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

interface GeneratorProps {
    onGenerate: (password: string) => void;
}

export function PasswordGenerator({ onGenerate }: GeneratorProps) {
    const [length, setLength] = useState(16);
    const [useUppercase, setUseUppercase] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [password, setPassword] = useState('');

    const generatePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let chars = lowercase;
        if (useUppercase) chars += uppercase;
        if (useNumbers) chars += numbers;
        if (useSymbols) chars += symbols;

        let generated = '';
        for (let i = 0; i < length; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setPassword(generated);
        onGenerate(generated);
    };

    // Generate on mount or options change
    useEffect(() => {
        generatePassword();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length, useUppercase, useNumbers, useSymbols]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
    };

    return (
        <div className="card p-6 border border-[var(--border-color)]">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Generador de Contraseñas</h3>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={password}
                    readOnly
                    className="input-field font-mono text-center text-lg tracking-wider bg-[var(--bg-dark)] flex-1"
                />
                <button onClick={copyToClipboard} className="btn-secondary" title="Copiar">
                    <Copy className="w-5 h-5" />
                </button>
                <button onClick={generatePassword} className="btn-primary" title="Generar Nueva">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm text-[var(--text-secondary)]">Longitud</label>
                        <span className="text-sm text-[var(--text-primary)] font-mono">{length}</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full accent-[var(--accent-green)]"
                    />
                </div>

                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useUppercase}
                            onChange={(e) => setUseUppercase(e.target.checked)}
                            className="accent-[var(--accent-green)] w-4 h-4 rounded"
                        />
                        <span className="text-sm text-[var(--text-primary)]">A-Z</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useNumbers}
                            onChange={(e) => setUseNumbers(e.target.checked)}
                            className="accent-[var(--accent-green)] w-4 h-4 rounded"
                        />
                        <span className="text-sm text-[var(--text-primary)]">0-9</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useSymbols}
                            onChange={(e) => setUseSymbols(e.target.checked)}
                            className="accent-[var(--accent-green)] w-4 h-4 rounded"
                        />
                        <span className="text-sm text-[var(--text-primary)]">@#$</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
