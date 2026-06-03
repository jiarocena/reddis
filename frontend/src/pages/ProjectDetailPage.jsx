import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Timeline from '../components/Project/Timeline';
import { PROJECT_STATUSES, CATEGORIES } from '../data/seedData';
import {
    ArrowLeft, CheckCircle, Circle, Clock, Users, Plus, Target,
    Package, HelpCircle, ChevronDown, ChevronUp, Briefcase, Activity
} from 'lucide-react';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { projects, barriers, updateProject, addTimelineEntry, loading } = useData();
    const { isAuthenticated, user, hasRole } = useAuth();
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');
    const prefix = isGestion ? '/gestion' : '';

    const [activeTab, setActiveTab] = useState('proyecto'); // 'proyecto' | 'ejecucion'
    const [newEntry, setNewEntry] = useState('');
    const [collabsExpanded, setCollabsExpanded] = useState(true);
    const [timelineExpanded, setTimelineExpanded] = useState(true);

    // Local states for inputs (autosave)
    const [descVal, setDescVal] = useState('');
    const [objVal, setObjVal] = useState('');
    const [newAccion, setNewAccion] = useState('');

    // Toggle edit states for Description and Objective
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [isEditingObj, setIsEditingObj] = useState(false);

    const project = projects.find(p => String(p.id) === String(id));
    const barrier = project ? barriers.find(b => String(b.id) === String(project.barrierId)) : null;

    // Synchronize local state with project data
    useEffect(() => {
        if (project) {
            setDescVal(project.description || '');
            setObjVal(project.objective || '');
        }
    }, [project?.id]);

    const isCollaborator = isAuthenticated && project?.collaborators?.some(c => c.userId === user?.id);
    const canEdit = isAuthenticated && (isCollaborator || hasRole('REFERENTE') || hasRole('ADMIN'));

    // Autosave handler
    const handleBlur = async (fieldName, currentValue, originalValue) => {
        if (currentValue.trim() !== (originalValue || '').trim()) {
            await updateProject(project.id, { [fieldName]: currentValue.trim() });
        }
    };

    const handleAddAccionDirect = async () => {
        if (!newAccion.trim()) return;
        const updatedAcciones = [...(project.accionesPrevistas || []), newAccion.trim()];
        await updateProject(project.id, { accionesPrevistas: updatedAcciones });
        setNewAccion('');
    };

    const handleRemoveAccionDirect = async (indexToRemove) => {
        const updatedAcciones = (project.accionesPrevistas || []).filter((_, i) => i !== indexToRemove);
        await updateProject(project.id, { accionesPrevistas: updatedAcciones });
    };

    const isUsuarioComun = user?.rol === 'USUARIO';
    const hasPending = user?.hasPendingRole;

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

    return (
        <div className="project-panel animate-fadeIn" style={{ maxWidth: '1000px' }}>
            <Link
                to={isGestion ? '/gestion/proyectos' : (barrier ? `/barrera/${barrier.id}` : '/barreras')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={16} /> Volver
            </Link>

            {/* Premium Header Card */}
            <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${project.status}`}>{PROJECT_STATUSES[project.status]?.label}</span>
                    {barrier && <span className={`badge badge-${barrier.category}`}>{CATEGORIES[barrier.category]?.label}</span>}
                    {project.needsHelp && <span className="badge badge-urgente"><HelpCircle size={10} /> Necesita colaboración</span>}
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gray-900)', margin: '0.25rem 0', lineHeight: 1.3 }}>{project.title}</h1>
                {(() => {
                    const orgs = Array.from(new Set(project.collaborators?.map(c => c.organization).filter(o => o && o.trim() !== '')));
                    if (orgs.length > 0) {
                        return (
                            <p style={{ color: 'var(--primary-600)', fontSize: '0.875rem', fontWeight: 600, margin: '0.4rem 0' }}>
                                🏛️ Organizaciones participantes: {orgs.join(' / ')}
                            </p>
                        );
                    }
                    return null;
                })()}
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-sm)', margin: '0.4rem 0 0 0' }}>
                    Inicio: <strong>{project.startDate}</strong> {project.endDate && ` · Fin: ${project.endDate}`}
                </p>
            </div>

            {/* Tabbed Navigation Bar */}
            <div className="admin-tabs" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', borderBottom: '2px solid var(--gray-200)', marginBottom: 'var(--space-6)', gap: 'var(--space-6)' }}>
                <button
                    className={`admin-tab-btn ${activeTab === 'proyecto' ? 'active' : ''}`}
                    onClick={() => setActiveTab('proyecto')}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', outline: 'none', whiteSpace: 'nowrap' }}
                >
                    <Briefcase size={16} /> El Proyecto
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'ejecucion' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ejecucion')}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', outline: 'none', whiteSpace: 'nowrap' }}
                >
                    <Activity size={16} /> Ejecución
                </button>
            </div>

            {/* TAB CONTENT: PROYECTO */}
            {activeTab === 'proyecto' && (
                <div className="project-detail-grid animate-fadeIn">
                    {/* Left Column: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            
                            {/* Descripción */}
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 'var(--space-2)' }}>
                                    <Package size={16} /> Descripción
                                    {canEdit && !isEditingDesc && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setIsEditingDesc(true)}
                                            style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', minWidth: 'auto', marginLeft: '0.5rem' }}
                                        >
                                            ✏️ Editar
                                        </button>
                                    )}
                                </h3>
                                {canEdit && isEditingDesc ? (
                                    <div className="autosave-field-wrapper">
                                        <textarea
                                            className="form-input"
                                            rows={4}
                                            value={descVal}
                                            onChange={e => setDescVal(e.target.value)}
                                            onBlur={async () => {
                                                await handleBlur('description', descVal, project.description);
                                                setIsEditingDesc(false);
                                            }}
                                            autoFocus
                                            placeholder="Detalla la barrera y las obras o planes..."
                                            style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
                                        />
                                        <small className="autosave-hint">Se guarda automáticamente al hacer clic fuera del campo.</small>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7, margin: 0 }}>{project.description}</p>
                                )}
                            </div>

                            {/* Objetivo */}
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 'var(--space-2)' }}>
                                    <Target size={16} /> Objetivo
                                    {canEdit && !isEditingObj && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setIsEditingObj(true)}
                                            style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', minWidth: 'auto', marginLeft: '0.5rem' }}
                                        >
                                            ✏️ Editar
                                        </button>
                                    )}
                                </h3>
                                {canEdit && isEditingObj ? (
                                    <div className="autosave-field-wrapper">
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            value={objVal}
                                            onChange={e => setObjVal(e.target.value)}
                                            onBlur={async () => {
                                                await handleBlur('objective', objVal, project.objective);
                                                setIsEditingObj(false);
                                            }}
                                            autoFocus
                                            placeholder="¿Qué meta o logro específico se proponen?"
                                            style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
                                        />
                                        <small className="autosave-hint">Se guarda automáticamente al hacer clic fuera del campo.</small>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7, margin: 0 }}>{project.objective || 'Sin definir'}</p>
                                )}
                            </div>

                            {/* Acciones Previstas */}
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 'var(--space-2)' }}>
                                    <CheckCircle size={16} /> Acciones Previstas
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    {(!project.accionesPrevistas || project.accionesPrevistas.length === 0) ? (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', fontStyle: 'italic', margin: 0 }}>Sin acciones previstas definidas</p>
                                    ) : (
                                        project.accionesPrevistas.map((accion, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'var(--gray-50)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                                                    <Circle size={6} style={{ marginTop: '0.4rem', fill: 'var(--gray-400)', stroke: 'none', minWidth: '6px' }} />
                                                    <span>{accion}</span>
                                                </div>
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ padding: '0.1rem 0.3rem', minWidth: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)', background: 'transparent', fontSize: '10px' }}
                                                        onClick={() => handleRemoveAccionDirect(idx)}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                {canEdit && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Agregar acción..."
                                            value={newAccion}
                                            onChange={e => setNewAccion(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddAccionDirect();
                                                }
                                            }}
                                            style={{ flexGrow: 1, fontSize: '0.875rem' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={handleAddAccionDirect}
                                            style={{ minWidth: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Collaborators */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* Help requested alert banner */}
                        {project.needsHelp && project.helpDescription && (
                            <div style={{ padding: '1.25rem', background: '#fffbeb', borderRadius: 'var(--radius-xl)', border: '1px solid #fef3c7', boxShadow: 'var(--shadow-sm)' }}>
                                <h4 style={{ fontSize: '0.875rem', color: '#b45309', marginBottom: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <HelpCircle size={16} /> Se solicita colaboración
                                </h4>
                                <p style={{ fontSize: '0.875rem', color: '#b45309', margin: 0, lineHeight: 1.5 }}>{project.helpDescription}</p>
                            </div>
                        )}

                        {/* Collaborators list */}
                        <div className="card" style={{ padding: 'var(--space-5)' }}>
                            <div
                                onClick={() => setCollabsExpanded(!collabsExpanded)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                            >
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', margin: 0 }}>
                                    <Users size={18} /> Colaboradores ({project.collaborators.length})
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {isCollaborator && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ Sos parte</span>
                                    )}
                                    {collabsExpanded ? <ChevronUp size={16} style={{ color: 'var(--gray-400)' }} /> : <ChevronDown size={16} style={{ color: 'var(--gray-400)' }} />}
                                </div>
                            </div>

                            {collabsExpanded && (
                                <div style={{ marginTop: 'var(--space-4)' }}>
                                    {isAuthenticated && isUsuarioComun && hasPendingForThisProject && (
                                        <div style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: '#b45309' }}>
                                            📝 Tu postulación está pendiente de aprobación por un referente departamental.
                                        </div>
                                    )}

                                    <div className="collaborator-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {project.collaborators.map((c, i) => (
                                            <div key={i} className="collaborator-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="collaborator-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                                                    {c.initials}
                                                </div>
                                                <div className="collaborator-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)' }}>{c.name}</h4>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{c.organization || 'OSC/Colaborador'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* TAB CONTENT: EJECUCION */}
            {activeTab === 'ejecucion' && (
                <div className="card animate-fadeIn" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    
                    {/* Status Step Bar */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 'var(--space-4)' }}>
                            Progreso del Proyecto
                        </h3>
                        <div className="project-status-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--gray-50)', padding: 'var(--space-4) var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                            {statusOrder.map((s, i) => (
                                <div key={s} style={{ display: 'contents' }}>
                                    <div className={`status-step ${idx >= i ? (idx > i ? 'completed' : 'active') : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', fontWeight: 500 }}>
                                        {idx > i ? <CheckCircle size={16} style={{ color: 'var(--success)' }} /> : <Circle size={16} />}
                                        <span>{PROJECT_STATUSES[s]?.label}</span>
                                    </div>
                                    {i < 2 && <div className="status-connector" style={{ flexGrow: 1, height: '2px', background: idx > i ? 'var(--success)' : 'var(--gray-200)' }} />}
                                </div>
                            ))}
                        </div>

                        {/* Interactive Status Dropdown for collaborators */}
                        {canEdit && (
                            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--gray-50)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', width: 'fit-content' }}>
                                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--gray-700)', textTransform: 'uppercase' }}>Cambiar estado del proyecto:</span>
                                <select
                                    className="form-select"
                                    value={project.status}
                                    onChange={async (e) => {
                                        await updateProject(project.id, { status: e.target.value });
                                    }}
                                    style={{ fontSize: 'var(--font-sm)', padding: 'var(--space-1) var(--space-2)', width: 'auto', border: '1px solid var(--gray-300)' }}
                                >
                                    <option value="denuncia">Identificada</option>
                                    <option value="iniciando">Iniciando</option>
                                    <option value="en-proceso">En Proceso</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Timeline (Avances) */}
                    <div>
                        <div
                            onClick={() => setTimelineExpanded(!timelineExpanded)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', cursor: 'pointer', userSelect: 'none' }}
                        >
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', margin: 0 }}>
                                <Clock size={18} /> Registro de Avances
                            </h3>
                            {timelineExpanded ? <ChevronUp size={16} style={{ color: 'var(--gray-400)' }} /> : <ChevronDown size={16} style={{ color: 'var(--gray-400)' }} />}
                        </div>

                        {timelineExpanded && (
                            <div style={{ paddingLeft: '0.5rem' }}>
                                <Timeline entries={project.timeline} />

                                {/* Add Timeline entry */}
                                {(isCollaborator || hasRole('REFERENTE') || hasRole('ADMIN')) && project.status !== 'finalizado' && (
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingLeft: '1rem' }}>
                                        <input
                                            className="form-input"
                                            placeholder="Escribe y registra un avance..."
                                            value={newEntry}
                                            onChange={e => setNewEntry(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddEntry()}
                                            style={{ fontSize: '0.875rem' }}
                                        />
                                        <button className="btn btn-primary btn-sm" onClick={handleAddEntry}>
                                            <Plus size={14} /> Registrar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Project Finalized impact card */}
                    {project.status === 'finalizado' && (
                        <div className="card" style={{ background: '#d1fae5', borderColor: '#a7f3d0', padding: '1.25rem' }}>
                            <h3 style={{ color: '#065f46', marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}><CheckCircle size={20} /> Proyecto Finalizado</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                                {project.impact && <p style={{ fontSize: '0.875rem', color: '#064e3b', margin: 0 }}><strong>Impacto:</strong> {project.impact}</p>}
                                {project.lessons && <p style={{ fontSize: '0.875rem', color: '#064e3b', margin: 0 }}><strong>Aprendizajes:</strong> {project.lessons}</p>}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
