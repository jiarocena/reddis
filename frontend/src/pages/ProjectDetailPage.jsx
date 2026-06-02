import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Timeline from '../components/Project/Timeline';
import { PROJECT_STATUSES, CATEGORIES } from '../data/seedData';
import { ArrowLeft, CheckCircle, Circle, Clock, Users, Plus, Target, Package, HelpCircle, UserPlus } from 'lucide-react';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { projects, barriers, updateProjectStatus, addTimelineEntry, addCollaborator, loading, showToast } = useData();
    const { isAuthenticated, user, hasRole, requestCollaboratorRole } = useAuth();
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');
    const prefix = isGestion ? '/gestion' : '';

    const [newEntry, setNewEntry] = useState('');
    const [showJoinConfirm, setShowJoinConfirm] = useState(false);
    const [joining, setJoining] = useState(false);

    const project = projects.find(p => String(p.id) === String(id));
    const barrier = project ? barriers.find(b => String(b.id) === String(project.barrierId)) : null;

    // Can interact (update status, add timeline): must be logged in + COLABORADOR/REFERENTE/ADMIN
    const canInteract = isAuthenticated && (hasRole('COLABORADOR') || hasRole('REFERENTE') || hasRole('ADMIN'));

    // Is already a collaborator on this project
    const isCollaborator = isAuthenticated && project?.collaborators?.some(c => c.userId === user?.id);

    const isUsuarioComun = user?.rol === 'USUARIO';
    const hasPending = user?.hasPendingRoleRequest;

    // Check if the pending request is specifically for this project
    const hasPendingForThisProject = isUsuarioComun && hasPending && (() => {
        const msgs = user?.pendingRoleRequestMessages || (user?.pendingRoleRequestMessage ? [user.pendingRoleRequestMessage] : []);
        return msgs.some(msg => {
            const match = msg.match(/\[PROYECTO_ID:(\d+)\]/);
            if (match) {
                return String(match[1]) === String(project.id);
            }
            return project?.title && msg.includes(project.title);
        });
    })();

    // Can join directly as collaborator: has role COLABORADOR/REFERENTE/ADMIN and not already joined
    const canJoinDirectly = isAuthenticated && !isCollaborator && (hasRole('COLABORADOR') || hasRole('REFERENTE') || hasRole('ADMIN'));
    
    // Can apply (postularse): is usuario comun, doesn't have pending request for THIS project
    const canApply = isAuthenticated && isUsuarioComun && !hasPendingForThisProject;

    if (loading) return (
        <div className="project-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p>Cargando...</p>
        </div>
    );

    if (!project) return (
        <div className="project-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Proyecto no encontrado</h2>
            <Link to={`${prefix}/barreras`} className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver al mapa</Link>
        </div>
    );

    const statusOrder = ['iniciando', 'en-proceso', 'finalizado'];
    const idx = statusOrder.indexOf(project.status);

    const handleAddEntry = () => {
        if (!newEntry.trim()) return;
        addTimelineEntry(project.id, { text: newEntry, completed: true });
        setNewEntry('');
    };

    const handleJoin = async () => {
        setJoining(true);
        if (isUsuarioComun) {
            try {
                await requestCollaboratorRole(`[PROYECTO_ID:${project.id}] Postulación para colaborar en el proyecto: ${project.title}`);
                showToast('¡Postulación enviada con éxito! Un referente la revisará.', 'success');
                setShowJoinConfirm(false);
            } catch (err) {
                console.error(err);
                showToast(err.message || 'Error al enviar postulación', 'error');
            }
        } else {
            await addCollaborator(project.id);
            setShowJoinConfirm(false);
        }
        setJoining(false);
    };

    return (
        <div className="project-panel animate-fadeIn">
            <Link to={isGestion ? '/gestion/proyectos' : (barrier ? `/barrera/${barrier.id}` : '/barreras')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Volver
            </Link>

            <div className="project-header">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${project.status}`}>{PROJECT_STATUSES[project.status]?.label}</span>
                    {barrier && <span className={`badge badge-${barrier.category}`}>{CATEGORIES[barrier.category]?.label}</span>}
                    {project.needsHelp && <span className="badge badge-urgente"><HelpCircle size={10} /> Necesita colaboración</span>}
                </div>
                <h1>{project.title}</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    Liderado por: <strong>{project.leader}</strong> · Inicio: {project.startDate}
                    {project.endDate && ` · Fin: ${project.endDate}`}
                </p>
            </div>

            {/* Status Bar */}
            <div className="project-status-bar">
                {statusOrder.map((s, i) => (
                    <div key={s} style={{ display: 'contents' }}>
                        <div className={`status-step ${idx >= i ? (idx > i ? 'completed' : 'active') : ''}`}>
                            {idx > i ? <CheckCircle size={18} /> : <Circle size={18} />}
                            <span>{PROJECT_STATUSES[s]?.label}</span>
                        </div>
                        {i < 2 && <div className={`status-connector ${idx > i ? 'completed' : ''}`} />}
                    </div>
                ))}
            </div>

            {/* Status change buttons — only for collaborators of this project */}
            {isCollaborator && project.status !== 'finalizado' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                    {project.status === 'iniciando' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateProjectStatus(project.id, 'en-proceso')}>
                            Marcar "En Proceso"
                        </button>
                    )}
                    {project.status === 'en-proceso' && (
                        <button className="btn btn-success btn-sm" onClick={() => updateProjectStatus(project.id, 'finalizado')}>
                            <CheckCircle size={14} /> Finalizar
                        </button>
                    )}
                </div>
            )}

            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}><Package size={16} /> Descripción</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>{project.description}</p>
                </div>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}><Target size={16} /> Objetivo</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>{project.objective || 'Sin definir'}</p>
                </div>
            </div>

            {project.resources && (
                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>Recursos</h4>
                    <p style={{ fontSize: '0.875rem' }}>{project.resources}</p>
                </div>
            )}

            {project.needsHelp && project.helpDescription && (
                <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#fef9c3', borderRadius: '0.75rem', border: '1px solid #fde68a' }}>
                    <h4 style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}><HelpCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Se necesita colaboración</h4>
                    <p style={{ fontSize: '0.875rem', color: '#78350f' }}>{project.helpDescription}</p>
                </div>
            )}

            {/* Collaborators */}
            <div className="collaborators-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Colaboradores ({project.collaborators.length})</h3>
                    {isCollaborator && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ Ya sos parte</span>
                    )}
                    {isAuthenticated && isUsuarioComun && hasPendingForThisProject && (
                        <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> Postulación Pendiente
                        </span>
                    )}
                </div>

                {isAuthenticated && isUsuarioComun && hasPendingForThisProject && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        background: '#fffbeb',
                        border: '1px solid #fef3c7',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: '#b45309'
                    }}>
                        📝 Tu postulación para colaborar en este proyecto está pendiente de aprobación por un referente departamental.
                    </div>
                )}

                <div className="collaborator-list">
                    {project.collaborators.map((c, i) => (
                        <div key={i} className="collaborator-item">
                            <div className="collaborator-avatar">{c.initials}</div>
                            <div className="collaborator-info"><h4>{c.name}</h4><span>{c.role}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Clock size={18} /> Registro de Avances</h3>
                <Timeline entries={project.timeline} />

                {/* Only collaborators of this project can add entries */}
                {isCollaborator && project.status !== 'finalizado' && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingLeft: '2rem' }}>
                        <input className="form-input" placeholder="Registrar avance..." value={newEntry} onChange={e => setNewEntry(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddEntry()} />
                        <button className="btn btn-primary btn-sm" onClick={handleAddEntry}><Plus size={14} /></button>
                    </div>
                )}
            </div>

            {project.status === 'finalizado' && (
                <div className="card" style={{ background: '#d1fae5', borderColor: '#a7f3d0' }}>
                    <h3 style={{ color: '#065f46', marginBottom: '1rem' }}><CheckCircle size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Proyecto Finalizado</h3>
                    {project.impact && <p style={{ fontSize: '0.875rem', color: '#064e3b', marginBottom: '0.75rem' }}><strong>Impacto:</strong> {project.impact}</p>}
                    {project.lessons && <p style={{ fontSize: '0.875rem', color: '#064e3b' }}><strong>Aprendizajes:</strong> {project.lessons}</p>}
                </div>
            )}
        </div>
    );
}
