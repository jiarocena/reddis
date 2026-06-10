import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sideMargin = isMobile ? 'var(--space-4)' : 'var(--space-8)';

    const parseAction = (action) => {
        if (!action) return { isCompleted: false, text: '', time: '' };
        const isCompleted = action.startsWith('[x] ');
        let text = action;
        let time = '';
        if (isCompleted) {
            text = action.substring(4); // remove "[x] "
            const pipeIndex = text.lastIndexOf(' | ');
            if (pipeIndex !== -1) {
                time = text.substring(pipeIndex + 3);
                text = text.substring(0, pipeIndex);
            }
        }
        return { isCompleted, text, time };
    };

    const handleToggleAccion = async (idx) => {
        if (!canEdit) return;
        const currentActions = [...(project.accionesPrevistas || [])];
        const action = currentActions[idx];
        const { isCompleted, text } = parseAction(action);
        
        if (isCompleted) {
            currentActions[idx] = text;
        } else {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            currentActions[idx] = `[x] ${text} | ${timeStr}`;
        }
        await updateProject(project.id, { accionesPrevistas: currentActions });
    };

    const parseTimelineText = (text) => {
        if (!text) return { time: '', content: '' };
        const match = text.match(/^(\d{2}:\d{2}\s*(?:AM|PM|am|pm))\s*-\s*(.*)$/);
        if (match) {
            return { time: match[1], content: match[2] };
        }
        return { time: '', content: text };
    };

    const formatDateHeader = (dateStr) => {
        if (!dateStr) return '';
        const today = new Date().toISOString().split('T')[0];
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1];
        const year = parts[0];
        
        if (dateStr === today) {
            return `HOY - ${day} ${month}`;
        }
        return `${day} ${month.toUpperCase()} ${year}`;
    };

    const handleAddEntry = () => {
        if (!newEntry.trim()) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const textWithTime = `${timeStr} - ${newEntry.trim()}`;
        addTimelineEntry(project.id, { text: textWithTime, completed: true });
        setNewEntry('');
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(isGestion ? '/gestion/proyectos' : '/gestion/proyectos');
        }
    };

    return (
        <div className="project-panel animate-fadeIn" style={{ maxWidth: '100%', width: '100%', paddingTop: 0 }}>
            {/* Sticky Header: Dark Blue, Full-Width, Folder Tabs */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: '#0c1b3a',
                color: 'white',
                marginLeft: `calc(-1 * ${sideMargin})`,
                marginRight: `calc(-1 * ${sideMargin})`,
                paddingLeft: sideMargin,
                paddingRight: sideMargin,
                paddingTop: '16px',
                paddingBottom: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1rem'
            }}>
                {/* Header Title & Navigation Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <button 
                        onClick={handleBack} 
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'white', 
                            cursor: 'pointer',
                            padding: '8px',
                            marginLeft: '-8px',
                            display: 'flex',
                            alignItems: 'center',
                            outline: 'none'
                        }}
                        aria-label="Volver"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    
                    <div style={{ textAlign: 'center', flexGrow: 1, padding: '0 8px' }}>
                        <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>
                            {project.title}
                        </h1>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', display: 'block', marginTop: '2px' }}>
                            {project.collaborators?.length || 0} {project.collaborators?.length === 1 ? 'colaborador' : 'colaboradores'}
                        </span>
                    </div>
                    
                    <div style={{ width: '36px' }} />
                </div>
                
                {/* Folder Tabs row */}
                <div style={{ display: 'flex', width: '100%', gap: '4px', marginTop: '4px' }}>
                    {['proyecto', 'ejecucion', 'chat'].map((tab) => {
                        if (tab === 'chat' && !isCollaborator) return null;
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1,
                                    background: isActive ? 'white' : 'transparent',
                                    color: isActive ? '#0c1b3a' : 'rgba(255, 255, 255, 0.8)',
                                    border: 'none',
                                    borderRadius: '8px 8px 0 0',
                                    padding: '10px 4px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    textTransform: 'lowercase',
                                    transition: 'all 0.15s ease',
                                    outline: 'none'
                                }}
                            >
                                {tab}
                            </button>
                        );
                    })}
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
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0c1b3a', marginBottom: 'var(--space-2)' }}>
                                    Descripción
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
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0c1b3a', marginBottom: 'var(--space-2)' }}>
                                    Objetivo
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
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                                    ACCIONES PREVISTAS
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                    {(!project.accionesPrevistas || project.accionesPrevistas.length === 0) ? (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', fontStyle: 'italic', margin: 0 }}>Sin acciones previstas definidas</p>
                                    ) : (
                                        project.accionesPrevistas.map((accion, idx) => {
                                            const { isCompleted, text } = parseAction(accion);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'space-between', 
                                                        gap: '0.75rem', 
                                                        background: '#f8fafc', 
                                                        padding: '10px 14px', 
                                                        borderRadius: '8px', 
                                                        border: '1px solid #e2e8f0' 
                                                    }}
                                                >
                                                    <div 
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '12px', 
                                                            fontSize: '0.9rem', 
                                                            color: '#334155', 
                                                            lineHeight: 1.4,
                                                            cursor: 'default',
                                                            flexGrow: 1,
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {isCompleted ? (
                                                            <div style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                background: '#10b981',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                flexShrink: 0
                                                            }}>
                                                                ✓
                                                            </div>
                                                        ) : (
                                                            <div style={{
                                                                width: '18px',
                                                                height: '18px',
                                                                borderRadius: '4px',
                                                                border: '2px solid #94a3b8',
                                                                background: 'white',
                                                                flexShrink: 0
                                                            }} />
                                                        )}
                                                        <span>{text}</span>
                                                    </div>
                                                    {canEdit && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            style={{ 
                                                                padding: '4px 8px', 
                                                                minWidth: 'auto', 
                                                                color: '#ef4444', 
                                                                borderColor: '#fee2e2', 
                                                                background: '#fef2f2', 
                                                                fontSize: '11px',
                                                                borderRadius: '6px'
                                                            }}
                                                            onClick={() => handleRemoveAccionDirect(idx)}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
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
                    
                    {/* Checklist de Avance Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '20px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0c1b3a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={20} style={{ color: '#0c1b3a' }} /> Checklist de Avance
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(!project.accionesPrevistas || project.accionesPrevistas.length === 0) ? (
                                <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                                    No hay acciones planificadas en este proyecto.
                                </p>
                            ) : (
                                project.accionesPrevistas.map((accion, aIdx) => {
                                    const { isCompleted, text, time } = parseAction(accion);
                                    return (
                                        <div 
                                            key={aIdx} 
                                            onClick={() => handleToggleAccion(aIdx)}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between', 
                                                padding: '10px 0', 
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: canEdit ? 'pointer' : 'default',
                                                userSelect: 'none',
                                                gap: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1 }}>
                                                {isCompleted ? (
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        background: '#10b981',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        flexShrink: 0
                                                    }}>
                                                        ✓
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        borderRadius: '50%',
                                                        border: '2px solid #0d9488',
                                                        background: 'white',
                                                        flexShrink: 0
                                                    }} />
                                                )}
                                                <span style={{ 
                                                    fontSize: '0.92rem', 
                                                    color: isCompleted ? '#94a3b8' : '#1e293b',
                                                    textDecoration: isCompleted ? 'line-through' : 'none',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    {text}
                                                </span>
                                            </div>
                                            
                                            {isCompleted && time && (
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                                                    {time}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Bitácora de Avance Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '20px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div
                            onClick={() => setTimelineExpanded(!timelineExpanded)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', marginBottom: '16px' }}
                        >
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0c1b3a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={20} style={{ color: '#0c1b3a' }} /> Bitácora de Avance
                            </h3>
                            {timelineExpanded ? <ChevronUp size={18} style={{ color: '#64748b' }} /> : <ChevronDown size={18} style={{ color: '#64748b' }} />}
                        </div>

                        {timelineExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {(!project.timeline || project.timeline.length === 0) ? (
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                                        No hay avances registrados aún.
                                    </p>
                                ) : (
                                    (() => {
                                        const grouped = {};
                                        project.timeline.forEach(e => {
                                            const d = e.date || new Date().toISOString().split('T')[0];
                                            if (!grouped[d]) grouped[d] = [];
                                            grouped[d].push(e);
                                        });
                                        const sortedDates = Object.keys(grouped).sort().reverse();
                                        
                                        return sortedDates.map(dateStr => (
                                            <div key={dateStr} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 700, 
                                                    color: '#64748b', 
                                                    textTransform: 'uppercase', 
                                                    letterSpacing: '0.05em' 
                                                }}>
                                                    {formatDateHeader(dateStr)}
                                                </div>
                                                
                                                <div style={{ 
                                                    position: 'relative', 
                                                    borderLeft: '2px solid #e2e8f0', 
                                                    marginLeft: '9px', 
                                                    paddingLeft: '20px', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: '16px' 
                                                }}>
                                                    {grouped[dateStr].map((entry, eIdx) => {
                                                        const { time, content } = parseTimelineText(entry.text);
                                                        return (
                                                            <div key={eIdx} style={{ position: 'relative' }}>
                                                                <div style={{ 
                                                                    position: 'absolute', 
                                                                    left: '-29px', 
                                                                    top: '1px', 
                                                                    background: 'white', 
                                                                    borderRadius: '50%', 
                                                                    padding: '2px', 
                                                                    zIndex: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    <Clock size={15} style={{ color: '#64748b' }} />
                                                                </div>
                                                                
                                                                <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.4 }}>
                                                                    {time ? (
                                                                        <>
                                                                            <span style={{ fontWeight: 600, color: '#1e293b', marginRight: '6px' }}>{time}</span>
                                                                            <span style={{ color: '#94a3b8', marginRight: '6px' }}>·</span>
                                                                        </>
                                                                    ) : (
                                                                        entry.date && <span style={{ fontWeight: 600, color: '#1e293b', marginRight: '6px' }}>{entry.date}</span>
                                                                    )}
                                                                    <span>{content}</span>
                                                                    {entry.authorName && (
                                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px', fontStyle: 'italic' }}>
                                                                            — {entry.authorName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ));
                                    })()
                                )}

                                {/* Add Timeline entry */}
                                {(isCollaborator || hasRole('REFERENTE') || hasRole('ADMIN')) && project.status !== 'finalizado' && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                        <input
                                            className="form-input"
                                            placeholder="Escribe y registra un avance..."
                                            value={newEntry}
                                            onChange={e => setNewEntry(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddEntry()}
                                            style={{ fontSize: '0.875rem', flexGrow: 1 }}
                                        />
                                        <button className="btn btn-primary btn-sm" onClick={handleAddEntry} style={{ whiteSpace: 'nowrap' }}>
                                            <Plus size={14} style={{ marginRight: '4px' }} /> Registrar
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
            <div ref={containerRef} style={{
                flexGrow: 1,
                height: 'calc(100vh - 220px)',
                minHeight: '350px',
                overflowY: 'auto',
                background: '#f4f6f9',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                paddingBottom: '80px'
            }}>
                {messages.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', gap: 'var(--space-2)' }}>
                        <MessageSquare size={32} />
                        <span style={{ fontSize: 'var(--font-sm)' }}>No hay mensajes aún. ¡Comenzá la conversación!</span>
                    </div>
                ) : (
                    messages.map((m, idx) => {
                        const isMe = Number(m.senderId) === Number(user?.id);
                        return (
                            <div key={m.id || idx} style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignSelf: isMe ? 'flex-end' : 'flex-start', 
                                maxWidth: '75%',
                                alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}>
                                <span style={{ 
                                    fontSize: '11px', 
                                    color: '#64748b', 
                                    marginBottom: '4px', 
                                    fontWeight: 600,
                                    paddingLeft: isMe ? '0' : '4px',
                                    paddingRight: isMe ? '4px' : '0'
                                }}>
                                    {isMe ? 'Tú' : m.senderName}
                                </span>
                                <div style={{
                                    background: isMe ? '#2b76c2' : '#ffffff',
                                    color: isMe ? '#ffffff' : '#1e293b',
                                    padding: '10px 14px',
                                    borderRadius: '16px',
                                    borderTopRightRadius: isMe ? '4px' : '16px',
                                    borderTopLeftRadius: isMe ? '16px' : '4px',
                                    border: isMe ? 'none' : '1px solid #e2e8f0',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.4'
                                }}>
                                    {m.text}
                                </div>
                                <span style={{ 
                                    fontSize: '9px', 
                                    color: '#94a3b8', 
                                    marginTop: '4px',
                                    paddingLeft: isMe ? '0' : '4px',
                                    paddingRight: isMe ? '4px' : '0'
                                }}>
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input area fixed to bottom styled like WhatsApp */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#0c1b3a',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1000,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.15)'
            }}>
                <form onSubmit={handleSend} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                        <input
                            type="text"
                            placeholder="Escribir mensaje..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            disabled={sending}
                            style={{
                                width: '100%',
                                borderRadius: '24px',
                                border: 'none',
                                padding: '10px 42px 10px 16px',
                                fontSize: '0.92rem',
                                background: 'white',
                                color: '#333',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#8e8e93',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            userSelect: 'none'
                        }}>
                            📎
                        </span>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={sending || !text.trim()}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#2b76c2',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: 'var(--shadow-sm)',
                            opacity: text.trim() ? 1 : 0.6,
                            outline: 'none',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
