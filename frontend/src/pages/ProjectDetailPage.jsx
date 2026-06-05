import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/api';
import Timeline from '../components/Project/Timeline';
import { PROJECT_STATUSES, CATEGORIES } from '../data/seedData';
import {
    ArrowLeft, CheckCircle, Circle, Clock, Users, Plus, Target,
    Package, HelpCircle, ChevronDown, ChevronUp, Briefcase, Activity, MessageSquare
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

    const isCollaborator = isAuthenticated && project?.collaborators?.some(c => Number(c.userId) === Number(user?.id));
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
        <div className="project-panel animate-fadeIn" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', margin: '2rem 0' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando proyecto...</p>
        </div>
    );

    if (!project) return (
        <div className="project-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Proyecto no encontrado</h2>
            <Link to={`${prefix}/barreras`} className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver al mapa</Link>
        </div>
    );

    const statusOrder = ['denuncia', 'iniciando', 'en-proceso', 'finalizado'];
    const idx = statusOrder.indexOf(project.status);

    const handleAddEntry = () => {
        if (!newEntry.trim()) return;
        addTimelineEntry(project.id, { text: newEntry, completed: true });
        setNewEntry('');
    };

    return (
        <div className="project-panel animate-fadeIn" style={{ maxWidth: '100%', width: '100%' }}>
            {/* Sticky Header: Title and Tab Menu */}
            <div className="project-sticky-header">
                {/* Title Section */}
                <div className="pending-header" style={{ marginTop: 0, marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Briefcase size={24} /> {project.title}
                        </h1>
                    </div>
                </div>

                {/* Tabbed Navigation Bar (Pill style Segmented Control) */}
                <div style={{ display: 'flex', width: '100%', borderBottom: 'none' }}>
                    <div style={{ 
                        display: 'flex', 
                        width: '100%',
                        background: 'var(--gray-100)', 
                        padding: '4px', 
                        borderRadius: 'var(--radius-lg)', 
                        gap: '4px',
                        border: '1px solid var(--gray-200)'
                    }}>
                        <button
                            type="button"
                            className={`project-menu-btn ${activeTab === 'proyecto' ? 'active' : ''}`}
                            onClick={() => setActiveTab('proyecto')}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '6px', 
                                padding: '8px 12px', 
                                fontSize: '0.95rem', 
                                fontWeight: 600, 
                                border: 'none', 
                                borderRadius: 'var(--radius-md)', 
                                cursor: 'pointer',
                                background: activeTab === 'proyecto' ? 'var(--white)' : 'transparent',
                                color: activeTab === 'proyecto' ? 'var(--primary-700)' : 'var(--gray-600)',
                                boxShadow: activeTab === 'proyecto' ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.15s',
                                outline: 'none',
                                whiteSpace: 'nowrap',
                                flex: 1
                            }}
                        >
                            <Briefcase size={14} /> Proyecto
                        </button>
                        <button
                            type="button"
                            className={`project-menu-btn ${activeTab === 'ejecucion' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ejecucion')}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '6px', 
                                padding: '8px 12px', 
                                fontSize: '0.95rem', 
                                fontWeight: 600, 
                                border: 'none', 
                                borderRadius: 'var(--radius-md)', 
                                cursor: 'pointer',
                                background: activeTab === 'ejecucion' ? 'var(--white)' : 'transparent',
                                color: activeTab === 'ejecucion' ? 'var(--primary-700)' : 'var(--gray-600)',
                                boxShadow: activeTab === 'ejecucion' ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.15s',
                                outline: 'none',
                                whiteSpace: 'nowrap',
                                flex: 1
                            }}
                        >
                            <Activity size={14} /> Ejecución
                        </button>
                        {isCollaborator && (
                            <button
                                type="button"
                                className={`project-menu-btn ${activeTab === 'chat' ? 'active' : ''}`}
                                onClick={() => setActiveTab('chat')}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    gap: '6px', 
                                    padding: '8px 12px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: 600, 
                                    border: 'none', 
                                    borderRadius: 'var(--radius-md)', 
                                    cursor: 'pointer',
                                    background: activeTab === 'chat' ? 'var(--white)' : 'transparent',
                                    color: activeTab === 'chat' ? 'var(--primary-700)' : 'var(--gray-600)',
                                    boxShadow: activeTab === 'chat' ? 'var(--shadow-sm)' : 'none',
                                    transition: 'all 0.15s',
                                    outline: 'none',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                }}
                            >
                                <MessageSquare size={14} /> Chat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* TAB CONTENT: PROYECTO */}
            {activeTab === 'proyecto' && (
                <div className="project-detail-grid animate-fadeIn">
                    {/* Left Column: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* Metadata row (moved from top) */}
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '1rem', 
                            borderBottom: '1px solid var(--gray-200)', 
                            paddingBottom: '0.75rem', 
                            marginBottom: '0.25rem',
                            color: 'var(--gray-500)',
                            fontSize: '0.85rem'
                        }}>
                            <span>
                                📅 <strong>Inicio:</strong> {project.startDate} {project.endDate && ` · <strong>Fin:</strong> ${project.endDate}`}
                            </span>
                            {(() => {
                                const orgs = Array.from(new Set(project.collaborators?.map(c => c.organization).filter(o => o && o.trim() !== '')));
                                if (orgs.length > 0) {
                                    return (
                                        <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                                            🏛️ {orgs.join(' / ')}
                                        </span>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', padding: 'var(--space-2) 0' }}>


                            {/* Descripción */}
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 'var(--space-2)' }}>
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
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 'var(--space-2)' }}>
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
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 'var(--space-2)' }}>
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
                        <div style={{ padding: 'var(--space-2) 0' }}>
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
                <div className="animate-fadeIn" style={{ padding: 'var(--space-2) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    
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

                    {/* Status Box */}
                    <div style={{ 
                        padding: '0.75rem 1rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        gap: '1rem', 
                        flexWrap: 'wrap',
                        background: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                Estado del proyecto:
                            </span>
                            <span className={`badge badge-${project.status}`}>
                                {PROJECT_STATUSES[project.status]?.label}
                            </span>
                        </div>

                        {/* Interactive Status Dropdown for collaborators */}
                        {canEdit && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)' }}>
                                    Cambiar:
                                </span>
                                <select
                                    className="form-select"
                                    value={project.status}
                                    onChange={async (e) => {
                                        await updateProject(project.id, { status: e.target.value });
                                    }}
                                    style={{ 
                                        fontSize: 'var(--font-xs)', 
                                        padding: '4px 8px', 
                                        width: 'auto', 
                                        border: '1px solid var(--gray-300)',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--white)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="denuncia">Identificada</option>
                                    <option value="iniciando">Iniciando</option>
                                    <option value="en-proceso">En Proceso</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Project Finalized impact card */}
                    {project.status === 'finalizado' && (
                        <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
                            <h3 style={{ color: '#065f46', marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}><CheckCircle size={20} /> Proyecto Finalizado</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                                {project.impact && <p style={{ fontSize: '0.875rem', color: '#064e3b', margin: 0 }}><strong>Impacto:</strong> {project.impact}</p>}
                                {project.lessons && <p style={{ fontSize: '0.875rem', color: '#064e3b', margin: 0 }}><strong>Aprendizajes:</strong> {project.lessons}</p>}
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* TAB CONTENT: CHAT */}
            {activeTab === 'chat' && isCollaborator && (
                <ProjectChatSection projectId={project.id} />
            )}
        </div>
    );
}

function ProjectChatSection({ projectId }) {
    const { getChatMessages, sendProjectMessage } = useData();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const containerRef = useRef(null);
    const prevCountRef = useRef(0);
    const isFirstLoadRef = useRef(true);

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

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

        const registerPush = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

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
            } catch (err) {
                console.error('Push notification registration error:', err);
            }
        };

        registerPush();
    }, []);

    const loadMessages = useCallback(async () => {
        const msgs = await getChatMessages(projectId);
        setMessages(msgs);
    }, [projectId, getChatMessages]);

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [loadMessages]);

    useEffect(() => {
        if (!containerRef.current) return;

        // If messages count increased or first load
        if (messages.length > prevCountRef.current || isFirstLoadRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
            isFirstLoadRef.current = false;
        }
        prevCountRef.current = messages.length;
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        const sent = await sendProjectMessage(projectId, text.trim());
        setSending(false);
        if (sent) {
            setText('');
            setMessages(prev => [...prev, sent]);
        }
    };

    return (
        <div className="animate-fadeIn" style={{ padding: 'var(--space-2) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: '450px' }}>
            <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MessageSquare size={16} style={{ color: 'var(--primary-500)' }} /> Chat del Equipo del Proyecto
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowHelp(!showHelp)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: showHelp ? 'var(--accent-600)' : 'var(--gray-400)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                            outline: 'none'
                        }}
                        title="Ayuda sobre privacidad"
                    >
                        <HelpCircle size={16} />
                    </button>
                </div>
                {showHelp && (
                    <p className="animate-fadeIn" style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-700)', background: 'var(--accent-50)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--accent-100)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                        Solo los integrantes autorizados de este proyecto pueden ver e intercambiar mensajes aquí.
                    </p>
                )}
            </div>

            {/* Messages box */}
            <div ref={containerRef} style={{ flexGrow: 1, height: '350px', overflowY: 'auto', background: 'var(--gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', gap: 'var(--space-2)' }}>
                        <MessageSquare size={32} />
                        <span style={{ fontSize: 'var(--font-sm)' }}>No hay mensajes aún. ¡Comenzá la conversación!</span>
                    </div>
                ) : (
                    messages.map((m, idx) => {
                        const isMe = Number(m.senderId) === Number(user?.id);
                        return (
                            <div key={m.id || idx} style={{ display: 'flex', flexDirection: 'column', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                <span style={{ fontSize: '10px', color: 'var(--gray-400)', alignSelf: isMe ? 'flex-end' : 'flex-start', marginBottom: '2px', fontWeight: 500 }}>
                                    {isMe ? 'Tú' : m.senderName}
                                </span>
                                <div style={{
                                    background: isMe ? 'var(--primary-600)' : 'var(--white)',
                                    color: isMe ? 'var(--white)' : 'var(--gray-800)',
                                    padding: 'var(--space-2) var(--space-4)',
                                    borderRadius: '16px',
                                    borderTopRightRadius: isMe ? '4px' : '16px',
                                    borderTopLeftRadius: isMe ? '16px' : '4px',
                                    border: isMe ? 'none' : '1px solid var(--gray-200)',
                                    fontSize: 'var(--font-sm)',
                                    boxShadow: 'var(--shadow-sm)',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.4'
                                }}>
                                    {m.text}
                                </div>
                                <span style={{ fontSize: '8px', color: 'var(--gray-400)', alignSelf: isMe ? 'flex-end' : 'flex-start', marginTop: '2px' }}>
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Escribí un mensaje..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={sending}
                    style={{ flexGrow: 1, fontSize: 'var(--font-sm)' }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !text.trim()}
                    style={{ padding: '0 var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}
