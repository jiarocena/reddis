import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import * as api from '../api/api';
import { Shield, CheckCircle, XCircle, Clock, MapPin, Users, Trash2, UserPlus, Plus } from 'lucide-react';

export default function PendingBarriersPage() {
    const { user, hasRole } = useAuth();
    const { showToast, refreshData, projects, barriers } = useData();
    const [pendingBarriers, setPendingBarriers] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('barriers');

    // State for collaborator association form
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [collabOrganization, setCollabOrganization] = useState('');
    const [submittingCollab, setSubmittingCollab] = useState(false);

    useEffect(() => {
        loadData(false);

        // Poll every 8 seconds to update the lists in real-time
        const interval = setInterval(() => {
            loadData(true);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    async function loadData(silent = false) {
        if (!silent) setLoading(true);
        try {
            const [barriersRes, usersRes] = await Promise.all([
                api.fetchPendingBarriers(),
                api.fetchAllUsers(),
            ]);
            setPendingBarriers(barriersRes);
            // Sort users by name
            const sortedUsers = (usersRes || []).sort((a, b) => {
                const nameA = a.nombre || '';
                const nameB = b.nombre || '';
                return nameA.localeCompare(nameB);
            });
            setUsersList(sortedUsers);
        } catch (err) {
            if (!silent) showToast('Error cargando datos: ' + err.message, 'error');
        } finally {
            if (!silent) setLoading(false);
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

    async function handleRemoveCollaborator(id, name, projectName) {
        if (!window.confirm(`¿Estás seguro de que querés quitar a ${name} del proyecto "${projectName}"?`)) {
            return;
        }
        try {
            await api.removeCollaborator(id);
            showToast('Colaborador quitado con éxito', 'success');
            refreshData(); // Reload context data to update projects state
            loadData(true); // Reload local list of users
        } catch (err) {
            showToast('Error al quitar colaborador: ' + err.message, 'error');
        }
    }

    async function handleAddCollaboratorSubmit(e) {
        e.preventDefault();
        if (!selectedUser || !selectedProject) {
            showToast('Seleccioná un usuario y un proyecto', 'error');
            return;
        }
        setSubmittingCollab(true);
        try {
            await api.addCollaboratorToProject(selectedProject, selectedUser, collabOrganization.trim());
            showToast('Colaborador asociado con éxito', 'success');
            setSelectedUser('');
            setSelectedProject('');
            setCollabOrganization('');
            refreshData(); // Reload context data to update projects state
            loadData(true); // Reload local list of users
        } catch (err) {
            showToast('Error al asociar colaborador: ' + err.message, 'error');
        } finally {
            setSubmittingCollab(false);
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
                    Hola, {user?.nombre}. Administrá las solicitudes de barreras y colaboradores de proyectos.
                </p>
            </div>

            {/* Tabs */}
            <div className="pending-tabs">
                <button className={`tab-btn ${tab === 'barriers' ? 'active' : ''}`}
                    onClick={() => setTab('barriers')}>
                    <MapPin size={16} /> Identificación de barreras
                    {pendingBarriers.length > 0 && <span className="tab-badge">{pendingBarriers.length}</span>}
                </button>
                <button className={`tab-btn ${tab === 'collaborators' ? 'active' : ''}`}
                    onClick={() => setTab('collaborators')}>
                    <Users size={16} /> Gestión de Colaboradores
                </button>
            </div>

            {loading ? (
                <div className="pending-empty" style={{ padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', textAlign: 'center', margin: '2rem 0' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando información del panel...</p>
                </div>
            ) : (
                <>
                    {tab === 'barriers' && (
                        <div className="pending-list">
                            {pendingBarriers.length === 0 ? (
                                <div className="pending-empty">
                                    <CheckCircle size={40} color="var(--success)" />
                                    <p>No hay solicitudes pendientes de identificación de barreras</p>
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

                    {tab === 'collaborators' && (
                        <div className="collaborators-management-container animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Card: Add Collaborator Form */}
                            <div className="card" style={{ background: 'var(--white)', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', margin: '0 0 1.25rem 0', color: 'var(--gray-800)', fontWeight: 600 }}>
                                    <UserPlus size={18} style={{ color: 'var(--primary-600)' }} /> Asociar usuario a un proyecto
                                </h3>
                                <form onSubmit={handleAddCollaboratorSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                                    <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)' }}>Usuario *</label>
                                        <select
                                            className="form-select"
                                            value={selectedUser}
                                            onChange={e => setSelectedUser(e.target.value)}
                                            required
                                            style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
                                        >
                                            <option value="">Seleccionar usuario...</option>
                                            {usersList.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.nombre} ({u.email}) [{u.rol}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)' }}>Proyecto *</label>
                                        <select
                                            className="form-select"
                                            value={selectedProject}
                                            onChange={e => setSelectedProject(e.target.value)}
                                            required
                                            style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
                                        >
                                            <option value="">Seleccionar proyecto...</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)' }}>Organización (Opcional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej. ONG, Cooperativa..."
                                            value={collabOrganization}
                                            onChange={e => setCollabOrganization(e.target.value)}
                                            style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submittingCollab}
                                        style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 1.25rem', flexShrink: 0 }}
                                    >
                                        <Plus size={16} /> Asociar
                                    </button>
                                </form>
                            </div>

                            {/* Section: Projects & Collaborators list */}
                            <div>
                                <h3 style={{ fontSize: '1.05rem', margin: '0 0 1rem 0', color: 'var(--gray-800)', fontWeight: 600 }}>
                                    Colaboradores por Proyecto
                                </h3>
                                <div className="pending-list">
                                    {projects.length === 0 ? (
                                        <div className="pending-empty">
                                            <Users size={40} color="var(--gray-300)" />
                                            <p>No hay proyectos activos registrados</p>
                                        </div>
                                    ) : (
                                        projects.map(p => (
                                            <div key={p.id} className="pending-card" style={{ padding: '1.25rem' }}>
                                                <div className="pending-card-header" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--gray-900)' }}>{p.title}</h4>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                                            Estado: <strong style={{ color: 'var(--primary-600)' }}>{p.status}</strong>
                                                        </span>
                                                    </div>
                                                    <span className="badge badge-denuncia" style={{ fontSize: '0.7rem' }}>
                                                        {p.collaborators?.length || 0} integrantes
                                                    </span>
                                                </div>

                                                {/* Collaborators items */}
                                                {!p.collaborators || p.collaborators.length === 0 ? (
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', fontStyle: 'italic', margin: '0.5rem 0' }}>
                                                        Este proyecto aún no tiene colaboradores asociados.
                                                    </p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {p.collaborators.map(c => (
                                                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <div className="collaborator-avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.7rem' }}>
                                                                        {c.initials}
                                                                    </div>
                                                                    <div>
                                                                        <strong style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>{c.name}</strong>
                                                                        {c.organization && (
                                                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginLeft: '0.5rem' }}>
                                                                                ({c.organization})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={() => handleRemoveCollaborator(c.id, c.name, p.title)}
                                                                    style={{ color: 'var(--danger-500)', borderColor: 'var(--danger-200)', background: 'transparent', padding: '4px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    title="Quitar del proyecto"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
