import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ redirectTo = '/gestion/mapa' }) {
    const { login } = useAuth();
    const { showToast } = useData();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            showToast('¡Sesión iniciada!', 'success');
            navigate(redirectTo);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page animate-fadeIn">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon"><LogIn size={28} /></div>
                    <h1>Iniciar Sesión</h1>
                    <p>Accedé a tu cuenta REDDIS</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label"><Mail size={14} /> Email</label>
                        <input className="form-input" type="email" required value={email}
                            onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Lock size={14} /> Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input className="form-input" type={showPassword ? 'text' : 'password'} required
                                value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)'
                                }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit"
                        disabled={loading} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿No tenés cuenta?{' '}
                    <Link to="/gestion/registro">Registrate</Link>
                </p>



            </div>
        </div>
    );
}
