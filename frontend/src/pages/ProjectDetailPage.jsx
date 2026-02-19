import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Timeline from '../components/Project/Timeline';
import { PROJECT_STATUSES, CATEGORIES } from '../data/seedData';
import { ArrowLeft, CheckCircle, Circle, Clock, Users, Plus, Target, Package, HelpCircle } from 'lucide-react';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { projects, barriers, updateProjectStatus, addTimelineEntry, addCollaborator, loading } = useData();
    const [newEntry, setNewEntry] = useState('');
    const [showAddCollab, setShowAddCollab] = useState(false);
    const [newCollab, setNewCollab] = useState({ name: '', role: '' });

    const project = projects.find(p => String(p.id) === String(id));
    const barrier = project ? barriers.find(b => String(b.id) === String(project.barrierId)) : null;

    if (loading) return (
        <div className="project-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p>Cargando...</p>
        </div>
    );

    if (!project) return (
        <div className="project-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Proyecto no encontrado</h2>
            <Link to="/mapa" className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver al mapa</Link>
        </div>
    );

    const statusOrder = ['iniciando', 'en-proceso', 'finalizado'];
    const idx = statusOrder.indexOf(project.status);

    const handleAddEntry = () => {
        if (!newEntry.trim()) return;
        addTimelineEntry(project.id, { text: newEntry, completed: true });
        setNewEntry('');
    };

    const handleAddCollab = () => {
        if (!newCollab.name) return;
        addCollaborator(project.id, {
            name: newCollab.name, role: newCollab.role,
            initials: newCollab.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
        });
        setNewCollab({ name: '', role: '' });
        setShowAddCollab(false);
    };

    return (
        <div className="project-panel animate-fadeIn">
            <Link to={barrier ? `/barrera/${barrier.id}` : '/mapa'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
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

            {project.status !== 'finalizado' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                    {project.status === 'iniciando' && <button className="btn btn-primary btn-sm" onClick={() => updateProjectStatus(project.id, 'en-proceso')}>Marcar "En Proceso"</button>}
                    {project.status === 'en-proceso' && <button className="btn btn-success btn-sm" onClick={() => updateProjectStatus(project.id, 'finalizado')}><CheckCircle size={14} /> Finalizar</button>}
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
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowAddCollab(!showAddCollab)}><Plus size={14} /> Sumarse</button>
                </div>
                {showAddCollab && (
                    <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end' }}>
                            <input className="form-input" placeholder="Nombre" value={newCollab.name} onChange={e => setNewCollab(p => ({ ...p, name: e.target.value }))} style={{ flex: 1 }} />
                            <input className="form-input" placeholder="Rol" value={newCollab.role} onChange={e => setNewCollab(p => ({ ...p, role: e.target.value }))} style={{ flex: 1 }} />
                            <button className="btn btn-success btn-sm" onClick={handleAddCollab}>Agregar</button>
                        </div>
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
                {project.status !== 'finalizado' && (
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
