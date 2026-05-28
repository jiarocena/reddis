import { useAuth } from '../context/AuthContext';
import { Mail, Shield, MapPin } from 'lucide-react';

const ROLE_LABELS = {
    ADMIN: { label: 'Administrador', color: '#dc2626', bg: '#fee2e2' },
    REFERENTE: { label: 'Referente Departamental', color: '#7c3aed', bg: '#ede9fe' },
    COLABORADOR: { label: 'Colaborador', color: '#059669', bg: '#d1fae5' },
    USUARIO: { label: 'Usuario', color: '#6b7280', bg: '#f3f4f6' },
};

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    const roleInfo = ROLE_LABELS[user.rol] || ROLE_LABELS.USUARIO;

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
            </div>
        </div>
    );
}
