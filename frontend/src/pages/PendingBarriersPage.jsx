import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import * as api from '../api/api';
import { Shield, CheckCircle, XCircle, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';

export default function PendingBarriersPage() {
    const { user, hasRole } = useAuth();
    const { showToast, refreshData } = useData();
    const [pendingBarriers, setPendingBarriers] = useState([]);
    const [roleRequests, setRoleRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('barriers');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [barriers, roles] = await Promise.all([
                api.fetchPendingBarriers(),
                api.fetchRoleRequests(),
            ]);
            setPendingBarriers(barriers);
            setRoleRequests(roles);
        } catch (err) {
            showToast('Error cargando datos: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleApproveBarrier(id) {
        try {
            await api.approveBarrier(id);
            showToast('Barrera aprobada y publicada', 'success');
            setPendingBarriers(prev => prev.filter(b => b.id !== id));
            refreshData(); // Reload public barriers so map updates
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        }
    }

    async function handleRejectBarrier(id) {
        try {
            await api.rejectBarrier(id);
            showToast('Barrera rechazada', 'info');
            setPendingBarriers(prev => prev.filter(b => b.id !== id));
            refreshData(); // Reload public barriers
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        }
    }

    async function handleApproveRole(id) {
        try {
            await api.approveRoleRequest(id);
            showToast('Rol aprobado', 'success');
            setRoleRequests(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        }
    }

    async function handleRejectRole(id) {
        try {
            await api.rejectRoleRequest(id, 'Solicitud no aprobada en esta instancia');
            showToast('Solicitud rechazada', 'info');
            setRoleRequests(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        }
    }

    if (!hasRole('REFERENTE')) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Acceso restringido</h2>
                <p style={{ color: 'var(--gray-500)' }}>Solo referentes departamentales y administradores pueden acceder.</p>
            </div>
        );
    }

    return (
        <div className="pending-page animate-fadeIn">
            <div className="pending-header">
                <h1><Shield size={24} /> Panel de Gestión</h1>
                <p style={{ color: 'var(--gray-500)' }}>
                    Hola, {user?.nombre}. Revisá las barreras pendientes y solicitudes de rol.
                </p>
            </div>

            {/* Tabs */}
            <div className="pending-tabs">
                <button className={`tab-btn ${tab === 'barriers' ? 'active' : ''}`}
                    onClick={() => setTab('barriers')}>
                    <MapPin size={16} /> Barreras pendientes
                    {pendingBarriers.length > 0 && <span className="tab-badge">{pendingBarriers.length}</span>}
                </button>
                <button className={`tab-btn ${tab === 'roles' ? 'active' : ''}`}
                    onClick={() => setTab('roles')}>
                    <Users size={16} /> Solicitudes de rol
                    {roleRequests.length > 0 && <span className="tab-badge">{roleRequests.length}</span>}
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p>
            ) : (
                <>
                    {tab === 'barriers' && (
                        <div className="pending-list">
                            {pendingBarriers.length === 0 ? (
                                <div className="pending-empty">
                                    <CheckCircle size={40} color="var(--success)" />
                                    <p>No hay barreras pendientes de aprobación</p>
                                </div>
                            ) : pendingBarriers.map(b => (
                                <div key={b.id} className="pending-card">
                                    <div className="pending-card-header">
                                        <h3>{b.title}</h3>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span className={`badge badge-${b.category}`}>{b.category}</span>
                                            <span className={`badge badge-${b.urgency === 'alta' ? 'urgente' : 'denuncia'}`}>
                                                {b.urgency}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                                        {b.description}
                                    </p>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>
                                        <span>{b.address}</span> · <span>Reportada por: {b.reportedByUserName || b.reportedBy || 'Anónimo'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button className="btn btn-success btn-sm" onClick={() => handleApproveBarrier(b.id)}>
                                            <CheckCircle size={14} /> Aprobar
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleRejectBarrier(b.id)}>
                                            <XCircle size={14} /> Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'roles' && (
                        <div className="pending-list">
                            {roleRequests.length === 0 ? (
                                <div className="pending-empty">
                                    <CheckCircle size={40} color="var(--success)" />
                                    <p>No hay solicitudes de rol pendientes</p>
                                </div>
                            ) : roleRequests.map(r => (
                                <div key={r.id} className="pending-card">
                                    <div className="pending-card-header">
                                        <h3>{r.userName}</h3>
                                        <span className="badge badge-denuncia">Solicita: {r.requestedRole}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                                        {r.userEmail}
                                    </p>
                                    {r.message && (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontStyle: 'italic', marginBottom: '1rem' }}>
                                            "{r.message}"
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button className="btn btn-success btn-sm" onClick={() => handleApproveRole(r.id)}>
                                            <CheckCircle size={14} /> Aprobar
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleRejectRole(r.id)}>
                                            <XCircle size={14} /> Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
