import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import * as api from '../api/api';
import { Mail, Shield, MapPin, LogOut, Bell, CheckCircle, AlertTriangle } from 'lucide-react';

const ROLE_LABELS = {
    ADMIN: { label: 'Administrador', color: '#dc2626', bg: '#fee2e2' },
    REFERENTE: { label: 'Referente Departamental', color: '#7c3aed', bg: '#ede9fe' },
    COLABORADOR: { label: 'Colaborador', color: '#059669', bg: '#d1fae5' },
    USUARIO: { label: 'Usuario', color: '#6b7280', bg: '#f3f4f6' },
};

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { showToast } = useData();
    const navigate = useNavigate();

    const [pushSupported, setPushSupported] = useState(false);
    const [permission, setPermission] = useState('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loadingPush, setLoadingPush] = useState(false);

    useEffect(() => {
        if (!user) return;
        const checkSupport = async () => {
            const supported = ('serviceWorker' in navigator) && ('Notification' in window) && ('PushManager' in window);
            setPushSupported(supported);
            if (supported) {
                setPermission(Notification.permission);
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const sub = await registration.pushManager.getSubscription();
                    setIsSubscribed(!!sub);
                } catch (err) {
                    console.error('Error checking push subscription:', err);
                }
            }
        };
        checkSupport();
    }, [user]);

    if (!user) return null;

    const roleInfo = ROLE_LABELS[user.rol] || ROLE_LABELS.USUARIO;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleSubscribe = async () => {
        if (!pushSupported) return;
        setLoadingPush(true);
        try {
            const reqPerm = await Notification.requestPermission();
            setPermission(reqPerm);
            if (reqPerm !== 'granted') {
                showToast('Permiso de notificaciones denegado', 'error');
                setLoadingPush(false);
                return;
            }

            const keyData = await api.getVapidPublicKey();
            const registration = await navigator.serviceWorker.ready;
            
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
                });
            }

            await api.subscribePush(subscription);
            setIsSubscribed(true);
            showToast('Notificaciones activadas con éxito', 'success');
        } catch (err) {
            console.error('Error subscribing to push:', err);
            showToast('Error al activar notificaciones: ' + (err.message || err), 'error');
        } finally {
            setLoadingPush(false);
        }
    };

    const handleUnsubscribe = async () => {
        if (!pushSupported) return;
        setLoadingPush(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
            }
            setIsSubscribed(false);
            showToast('Notificaciones desactivadas', 'info');
        } catch (err) {
            console.error('Error unsubscribing from push:', err);
            showToast('Error al desactivar notificaciones', 'error');
        } finally {
            setLoadingPush(false);
        }
    };

    const handleCheckAgain = () => {
        if (!pushSupported) return;
        const currentPerm = Notification.permission;
        setPermission(currentPerm);
        if (currentPerm === 'granted') {
            handleSubscribe();
        } else if (currentPerm === 'denied') {
            showToast('Permiso aún bloqueado. Cámbialo en la configuración del navegador.', 'warning');
        } else {
            showToast('Permiso restablecido. Ya puedes activarlo.', 'info');
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

                {/* Notificaciones Push Settings Section */}
                <div style={{
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-6)',
                    borderTop: '1px solid var(--gray-200)',
                    textAlign: 'left'
                }}>
                    <h3 style={{
                        fontSize: 'var(--font-sm)',
                        fontWeight: 700,
                        color: 'var(--gray-800)',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Bell size={16} /> Notificaciones del Chat
                    </h3>
                    
                    {!pushSupported ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: 0 }}>
                            Las notificaciones no están soportadas en este dispositivo o navegador.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {permission === 'denied' && (
                                <div style={{
                                    padding: '10px 12px',
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2',
                                    borderRadius: 'var(--radius-lg)',
                                    color: '#991b1b',
                                    fontSize: '0.78rem',
                                    lineHeight: 1.4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                        <AlertTriangle size={14} /> Permiso Bloqueado
                                    </span>
                                    <span>
                                        Bloqueaste las notificaciones en tu navegador. Para recibirlas, haz clic en el ícono del candado junto a la dirección web en la barra superior y activa las Notificaciones.
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={handleCheckAgain} 
                                        className="btn btn-secondary btn-sm" 
                                        style={{ alignSelf: 'flex-start', padding: '4px 10px', minHeight: 'auto', border: '1px solid #fca5a5', background: 'white', color: '#991b1b', marginTop: '4px' }}
                                    >
                                        Verificar de nuevo
                                    </button>
                                </div>
                            )}

                            {permission === 'granted' && isSubscribed && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--success-600)', fontWeight: 600 }}>
                                        <CheckCircle size={16} /> Activadas en este dispositivo
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={handleUnsubscribe} 
                                        disabled={loadingPush}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 'auto' }}
                                    >
                                        Desactivar
                                    </button>
                                </div>
                            )}

                            {permission === 'granted' && !isSubscribed && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                                        El permiso está concedido, pero falta registrar este dispositivo.
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={handleSubscribe} 
                                        disabled={loadingPush}
                                        className="btn btn-primary btn-sm"
                                        style={{ alignSelf: 'stretch', justifyContent: 'center' }}
                                    >
                                        {loadingPush ? 'Registrando...' : 'Registrar Dispositivo'}
                                    </button>
                                </div>
                            )}

                            {permission === 'default' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.3 }}>
                                        Recibí alertas instantáneas cuando otros colaboradores envíen mensajes en el chat de tus proyectos.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={handleSubscribe} 
                                        disabled={loadingPush}
                                        className="btn btn-primary btn-sm"
                                        style={{ alignSelf: 'stretch', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Bell size={14} /> {loadingPush ? 'Activando...' : 'Activar Notificaciones'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button className="btn btn-secondary" onClick={handleLogout} style={{ marginTop: 'var(--space-6)', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
