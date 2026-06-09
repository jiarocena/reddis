import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PROJECT_STATUSES, CATEGORIES } from '../data/seedData';
import { Briefcase, Search, ChevronRight, Users, Clock, CheckCircle, HelpCircle, Target } from 'lucide-react';

export default function ProyectosListPage() {
    const { projects, barriers, addCollaborator, showToast, loading } = useData();
    const { user, requestCollaboratorRole, hasRole, isAuthenticated } = useAuth();

    const getProjectImage = (p, barrier) => {
        if (barrier?.photoBase64) {
            return barrier.photoBase64;
        }
        const titleLower = p.title?.toLowerCase() || '';
        if (titleLower.includes('rampa') || titleLower.includes('escuela')) {
            return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80';
        }
        if (titleLower.includes('vereda') || titleLower.includes('calle') || titleLower.includes('vía') || titleLower.includes('camino')) {
            return 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=300&q=80';
        }
        if (titleLower.includes('parada') || titleLower.includes('ómnibus') || titleLower.includes('bus') || titleLower.includes('ruta')) {
            return 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=300&q=80';
        }
        if (titleLower.includes('silla') || titleLower.includes('ruedas') || titleLower.includes('motorizada')) {
            return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=300&q=80';
        }
        if (titleLower.includes('intérprete') || titleLower.includes('lsu') || titleLower.includes('sordos') || titleLower.includes('auditiva')) {
            return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';
        }
        return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80';
    };
    
    if (!isAuthenticated) {
        return (
            <div className="pending-page animate-fadeIn text-center" style={{ padding: '4rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(45, 90, 184, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                    color: 'var(--primary-500)'
                }}>
                    <Users size={32} />
                </div>
                <h2 style={{ fontSize: 'var(--font-2xl)', color: 'var(--gray-900)', marginBottom: '1rem', fontWeight: 700 }}>
                    Colaborar en REDDIS
                </h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', lineHeight: 1.6, fontSize: 'var(--font-sm)' }}>
                    Para participar activamente en la resolución de las barreras reportadas, sumarte a equipos de trabajo y registrar avances, debés registrarte como usuario.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link to="/gestion/registro?redirect=/gestion/proyectos" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
                        Registrarse como usuario
                    </Link>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.5rem 0' }}>
                        ¿Ya tenés una cuenta?
                    </span>
                    <Link to="/gestion?redirect=/gestion/proyectos" className="btn btn-secondary btn-lg" style={{ justifyContent: 'center' }}>
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    const userDepto = user?.departamento || null;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [postulateProject, setPostulateProject] = useState(null);
    const [orgInput, setOrgInput] = useState('');
    const [motiveInput, setMotiveInput] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const isUsuarioComun = user?.rol === 'USUARIO' || user?.rol === 'COLABORADOR';

    const handleButtonClick = (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        setPostulateProject(project);
        setOrgInput('');
        setMotiveInput('');
    };

    const handleModalSubmit = async () => {
        if (isUsuarioComun) {
            try {
                await requestCollaboratorRole(
                    `[PROYECTO_ID:${postulateProject.id}] Postulación para colaborar en el proyecto: ${postulateProject.title}`,
                    orgInput.trim(),
                    motiveInput.trim()
                );
                showToast('¡Te sumaste al proyecto como colaborador!', 'success');
                setPostulateProject(null);
            } catch (err) {
                console.error(err);
                showToast(err.message || 'Error al enviar postulación', 'error');
            }
        } else {
            try {
                await addCollaborator(postulateProject.id, orgInput.trim());
                setPostulateProject(null);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = projects.filter(p => {
        // Exclude projects where the user is already collaborating
        const isUserCollaborator = user && p.collaborators?.some(c => Number(c.userId) === Number(user?.id));
        if (isUserCollaborator) return false;

        // Filter by user's department if logged in
        if (userDepto) {
            const barrier = barriers.find(b => String(b.id) === String(p.barrierId));
            if (barrier && barrier.departamento !== userDepto) return false;
        }
        if (statusFilter !== 'todos' && p.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            const barrier = barriers.find(b => String(b.id) === String(p.barrierId));
            return p.title.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                barrier?.title?.toLowerCase().includes(q);
        }
        return true;
    });

    const hasPending = user?.hasPendingRoleRequest;

    return (
        <div className="pending-page animate-fadeIn">
            <div className="pending-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Briefcase size={24} /> Colaborar</h1>
                </div>
                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-sm)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    Busca en la lista la barrera/proyecto que sea de tu interés, y hacé clic en botón 'Postularme' para enviar tu solicitud.
                </p>
            </div>

            {isUsuarioComun && hasPending && (() => {
                const msg = user?.pendingRoleRequestMessage || '';
                const match = msg.match(/\[PROYECTO_ID:(\d+)\]/);
                let targetProjectName = "un proyecto";
                if (match) {
                    const targetProj = projects.find(proj => String(proj.id) === String(match[1]));
                    if (targetProj) targetProjectName = `"${targetProj.title}"`;
                } else {
                    const found = projects.find(proj => msg.includes(proj.title));
                    if (found) targetProjectName = `"${found.title}"`;
                }
                return (
                    <div style={{
                        padding: '1rem',
                        background: '#fffbeb',
                        border: '1px solid #fef3c7',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        <h4 style={{ color: '#b45309', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                            <Clock size={16} /> Postulación Pendiente
                        </h4>
                        <p style={{ color: '#d97706', margin: 0, fontSize: '0.8rem', lineHeight: 1.4 }}>
                            Tu solicitud para colaborar en el proyecto <strong>{targetProjectName}</strong> está siendo evaluada por un referente departamental. Una vez aprobada, podrás participar activamente.
                        </p>
                    </div>
                );
            })()}

            {isUsuarioComun && showHelp && !hasPending && (
                <div className="animate-fadeIn" style={{
                    padding: '1rem',
                    background: 'var(--accent-50)',
                    border: '1px solid var(--accent-100)',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    <h4 style={{ color: 'var(--accent-700)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                        💡 ¿Querés colaborar en algún proyecto?
                    </h4>
                    <p style={{ color: 'var(--accent-600)', margin: 0, fontSize: '0.8rem', lineHeight: 1.4 }}>
                        Ingresá a cualquier proyecto de la lista que sea de tu interés y hacé clic en el botón <strong>"Postularme para colaborar"</strong> para enviar tu solicitud.
                    </p>
                </div>
            )}

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--gray-400)' }} />
                <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar proyectos..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                />
            </div>

            {/* Status filter */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-1)' }}>
                    Estado
                </label>
                <div className="map-filters">
                    <button className={`filter-btn ${statusFilter === 'todos' ? 'active' : ''}`} onClick={() => setStatusFilter('todos')}>Todos</button>
                    {['denuncia', 'iniciando', 'en-proceso'].map(s => (
                        <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                            {PROJECT_STATUSES[s]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="pending-list">
                {loading ? (
                    <div className="pending-empty" style={{ padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando proyectos...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="pending-empty">
                        <Briefcase size={40} color="var(--gray-300)" />
                        <p>No hay proyectos{statusFilter !== 'todos' ? ' con este estado' : ''}</p>
                    </div>
                ) : filtered.map(p => {
                    const barrier = barriers.find(b => String(b.id) === String(p.barrierId));
                    const lastEntry = p.timeline?.[p.timeline.length - 1];
                    const completedEntries = p.timeline?.filter(t => t.completed).length || 0;

                    const isUserCollaborator = user && p.collaborators?.some(c => Number(c.userId) === Number(user?.id));

                    const hasPendingForThisProject = isUsuarioComun && hasPending && (() => {
                        const msgs = user?.pendingRoleRequestMessages || (user?.pendingRoleRequestMessage ? [user.pendingRoleRequestMessage] : []);
                        return msgs.some(msg => {
                            const match = msg.match(/\[PROYECTO_ID:(\d+)\]/);
                            if (match) {
                                return String(match[1]) === String(p.id);
                            }
                            return p.title && msg.includes(p.title);
                        });
                    })();

                    return (
                        <Link key={p.id} to={`/gestion/proyecto/${p.id}`} style={{ textDecoration: 'none' }}>
                            <div className="pending-card" style={{ padding: '12px', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <img 
                                        src={getProjectImage(p, barrier)} 
                                        alt={p.title} 
                                        style={{ 
                                            width: '110px', 
                                            height: '110px', 
                                            borderRadius: '8px', 
                                            objectFit: 'cover', 
                                            flexShrink: 0 
                                        }} 
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Proyecto</span>
                                            <span style={{ 
                                                fontSize: '0.65rem', 
                                                fontWeight: 800, 
                                                padding: '2px 8px', 
                                                borderRadius: '6px', 
                                                textTransform: 'uppercase',
                                                background: p.status === 'iniciando' ? '#eff6ff' : p.status === 'en-proceso' ? '#fef9c3' : p.status === 'finalizado' ? '#d1fae5' : '#fee2e2',
                                                color: p.status === 'iniciando' ? '#1d4ed8' : p.status === 'en-proceso' ? '#a16207' : p.status === 'finalizado' ? '#065f46' : '#991b1b'
                                            }}>
                                                {PROJECT_STATUSES[p.status]?.label.toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 style={{ 
                                            margin: '0 0 2px 0', 
                                            fontSize: '0.95rem', 
                                            fontWeight: 800, 
                                            color: 'var(--gray-900)', 
                                            lineHeight: 1.25,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {p.title}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gray-500)', fontSize: '0.75rem', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>📍</span>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                Ubicación: {barrier?.address || 'Sin dirección'}
                                            </span>
                                        </div>
                                        <p style={{ 
                                            margin: 0, 
                                            fontSize: '0.7rem', 
                                            color: 'var(--gray-500)', 
                                            lineHeight: 1.35, 
                                            display: '-webkit-box', 
                                            WebkitLineClamp: 3, 
                                            WebkitBoxOrient: 'vertical', 
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            Descripción: {p.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                </div>

                                {isUserCollaborator && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.5rem 0.75rem',
                                        background: '#ecfdf5',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#047857',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>
                                        <CheckCircle size={14} /> Sos colaborador en este proyecto
                                    </div>
                                )}

                                {isUsuarioComun && hasPendingForThisProject && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.5rem 0.75rem',
                                        background: '#fffbeb',
                                        border: '1px solid #fde68a',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#b45309',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>
                                        <Clock size={14} /> Solicitud de colaboración pendiente
                                    </div>
                                )}

                                {!isUserCollaborator && !hasPendingForThisProject && (
                                    <button
                                        onClick={(e) => handleButtonClick(e, p)}
                                        className="btn btn-primary"
                                        style={{
                                            marginTop: '0.75rem',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0.6rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            boxShadow: 'none'
                                        }}
                                    >
                                        Postularme para colaborar
                                    </button>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {postulateProject && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }} onClick={() => setPostulateProject(null)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.75rem',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        animation: 'fadeIn 0.2s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--gray-800)' }}>
                                {isUsuarioComun ? 'Postularse como Colaborador' : 'Sumarse al Proyecto'}
                            </h3>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--gray-400)', outline: 'none' }} onClick={() => setPostulateProject(null)}>✕</button>
                        </div>
                        
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                            {isUsuarioComun ? 'Estás postulándote para colaborar en:' : 'Vas a sumarte como colaborador en:'} <strong style={{ color: 'var(--gray-800)' }}>{postulateProject.title}</strong>
                        </p>
                        
                        <div>
                            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Organización de la que provenís (Opcional)</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Ej. ONG Inclusión, Cooperativa, Vecinal, etc." 
                                value={orgInput} 
                                onChange={e => setOrgInput(e.target.value)} 
                                style={{ width: '100%' }}
                            />
                        </div>
                        
                        {isUsuarioComun && (
                            <div>
                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Motivo por el que querés colaborar</label>
                                <textarea 
                                    className="form-input" 
                                    rows={4} 
                                    placeholder="Contanos brevemente por qué querés sumarte a este proyecto y cómo podés aportar..." 
                                    value={motiveInput} 
                                    onChange={e => setMotiveInput(e.target.value)} 
                                    style={{ width: '100%', resize: 'none', fontFamily: 'inherit' }}
                                    required
                                />
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPostulateProject(null)}>
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary btn-sm" 
                                onClick={handleModalSubmit} 
                                disabled={isUsuarioComun && !motiveInput.trim()}
                            >
                                {isUsuarioComun ? 'Enviar Postulación' : 'Sumarme'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
