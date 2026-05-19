import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DEPARTAMENTOS } from '../data/seedData';
import { UserPlus, Mail, Lock, User, MapPin, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const { register, isAuthenticated } = useAuth();
    const { showToast } = useData();
    const navigate = useNavigate();
    const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '', departamento: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        if (!form.departamento) {
            setError('Debés seleccionar un departamento');
            return;
        }

        setLoading(true);
        try {
            await register(form.nombre, form.email, form.password, form.departamento);
            showToast('¡Registro exitoso! Ya podés usar la plataforma.', 'success');
            // Auto-login happens in AuthContext, redirect to map
            navigate('/reportar');
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
                        <label className="form-label"><MapPin size={14} /> Departamento</label>
                        <select className="form-select" required value={form.departamento}
                            onChange={e => setForm(p => ({ ...p, departamento: e.target.value }))}>
                            <option value="">Seleccioná tu departamento</option>
                            {DEPARTAMENTOS.map(d => (
                                <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
                            ))}
                        </select>
                        <small style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            Solo podrás reportar barreras en tu departamento
                        </small>
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

                    {/* Honeypot anti-bot — invisible to humans */}
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
                        <input type="text" name="website" tabIndex={-1} autoComplete="off"
                            value={form.website || ''}
                            onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
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
