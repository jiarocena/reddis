import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { User, Mail, Shield, Send, CheckCircle, Clock, MapPin } from 'lucide-react';

const ROLE_LABELS = {
    ADMIN: { label: 'Administrador', color: '#dc2626', bg: '#fee2e2' },
    REFERENTE: { label: 'Referente Departamental', color: '#7c3aed', bg: '#ede9fe' },
    COLABORADOR: { label: 'Colaborador', color: '#059669', bg: '#d1fae5' },
    USUARIO: { label: 'Usuario', color: '#6b7280', bg: '#f3f4f6' },
};

export default function ProfilePage() {
    const { user, hasRole, requestCollaboratorRole, refreshUser } = useAuth();
    const { showToast } = useData();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [requested, setRequested] = useState(user?.hasPendingRoleRequest || false);

    if (!user) return null;

    const roleInfo = ROLE_LABELS[user.rol] || ROLE_LABELS.USUARIO;

    const handleRequestRole = async () => {
        setLoading(true);
        try {
            await requestCollaboratorRole(message);
            showToast('Solicitud enviada. Un referente la revisará.', 'success');
            setRequested(true);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page animate-fadeIn">
            <div className="profile-card">
                <div className="profile-avatar">
                    {user.nombre?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <h1>{user.nombre}</h1>

                <div className="profile-info">
                    <div className="profile-item">
                        <Mail size={16} /> <span>{user.email}</span>
                    </div>
                    <div className="profile-item">
                        <Shield size={16} />
                        <span className="role-badge" style={{ background: roleInfo.bg, color: roleInfo.color }}>
                            {roleInfo.label}
                        </span>
                    </div>
                    {user.departamento && (
                        <div className="profile-item">
                            <MapPin size={16} /> <span>Departamento: <strong>{user.departamento}</strong></span>
                        </div>
                    )}
                </div>

                {/* Role upgrade section */}
                {user.rol === 'USUARIO' && !requested && (
                    <div className="profile-upgrade">
                        <h3>¿Querés colaborar en proyectos?</h3>
                        <p>Solicitá el rol de <strong>Colaborador</strong> para poder crear proyectos y sumarte a equipos de trabajo.</p>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Mensaje (opcional)</label>
                            <textarea className="form-textarea" value={message} onChange={e => setMessage(e.target.value)}
                                placeholder="Contá brevemente por qué querés colaborar, tu experiencia o institución..." rows={3} />
                        </div>
                        <button className="btn btn-accent" onClick={handleRequestRole} disabled={loading}>
                            <Send size={16} /> {loading ? 'Enviando...' : 'Solicitar rol Colaborador'}
                        </button>
                    </div>
                )}

                {user.rol === 'USUARIO' && requested && (
                    <div className="profile-upgrade" style={{ background: '#fef9c3', borderColor: '#fde68a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
                            <Clock size={18} />
                            <strong>Solicitud pendiente</strong>
                        </div>
                        <p style={{ color: '#78350f', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Tu solicitud de rol Colaborador está siendo revisada por un referente departamental.
                        </p>
                    </div>
                )}

                {hasRole('COLABORADOR') && (
                    <div className="profile-upgrade" style={{ background: '#d1fae5', borderColor: '#a7f3d0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                            <CheckCircle size={18} />
                            <strong>Rol activo: {roleInfo.label}</strong>
                        </div>
                        <p style={{ color: '#064e3b', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Podés crear proyectos, sumarte a equipos y gestionar barreras.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
