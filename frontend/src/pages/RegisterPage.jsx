import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [confirmUrl, setConfirmUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const data = await register(form.nombre, form.email, form.password);
            setSuccess(true);
            if (data.confirmUrl) setConfirmUrl(data.confirmUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page animate-fadeIn">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-icon" style={{ background: 'var(--success-bg)' }}>
                        <CheckCircle size={28} color="var(--success)" />
                    </div>
                    <h1>¡Registro exitoso!</h1>
                    <p style={{ color: 'var(--gray-500)', margin: '1rem 0' }}>
                        Enviamos un email de confirmación a <strong>{form.email}</strong>.
                        Revisá tu bandeja de entrada y hacé clic en el enlace para activar tu cuenta.
                    </p>
                    {confirmUrl && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', fontSize: '0.8rem' }}>
                            <p style={{ color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                                <strong>Modo piloto</strong> — Link de confirmación:
                            </p>
                            <a href={confirmUrl} style={{ wordBreak: 'break-all', color: 'var(--primary-600)' }}>
                                {confirmUrl}
                            </a>
                        </div>
                    )}
                    <Link to="/gestion" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        Ir a iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page animate-fadeIn">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon"><UserPlus size={28} /></div>
                    <h1>Crear Cuenta</h1>
                    <p>Registrate para reportar barreras y colaborar</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label"><User size={14} /> Nombre completo</label>
                        <input className="form-input" required value={form.nombre}
                            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                            placeholder="Ej: María García" />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Mail size={14} /> Email</label>
                        <input className="form-input" type="email" required value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="tu@email.com" />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Lock size={14} /> Contraseña</label>
                        <input className="form-input" type="password" required value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            placeholder="Mínimo 6 caracteres" />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Lock size={14} /> Confirmar contraseña</label>
                        <input className="form-input" type="password" required value={form.confirmPassword}
                            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                            placeholder="Repetí la contraseña" />
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit"
                        disabled={loading} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/gestion">Iniciá sesión</Link>
                </p>
            </div>
        </div>
    );
}
