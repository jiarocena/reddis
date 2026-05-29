import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PROJECT_STATUSES, CATEGORIES } from '../data/seedData';
import { Briefcase, Search, ChevronRight, Users, Clock, CheckCircle, HelpCircle, Target } from 'lucide-react';

export default function ProyectosListPage() {
    const { projects, barriers, addCollaborator, showToast } = useData();
    const { user, requestCollaboratorRole, hasRole } = useAuth();
    const userDepto = user?.departamento || null;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const handlePostular = async (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        
        const confirmed = window.confirm(`¿Confirmás tu postulación para colaborar en el proyecto: "${project.title}"?`);
        if (!confirmed) return;
        
        try {
            await requestCollaboratorRole(`[PROYECTO_ID:${project.id}] Postulación para colaborar en el proyecto: ${project.title}`);
            showToast('¡Postulación enviada con éxito! Un referente la revisará.', 'success');
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Error al enviar postulación', 'error');
        }
    };

    const handleSumarme = async (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        
        const confirmed = window.confirm(`¿Confirmás sumarte como colaborador en el proyecto: "${project.title}"?`);
        if (!confirmed) return;
        
        try {
            await addCollaborator(project.id);
            showToast(`Te sumaste al proyecto como colaborador`, 'success');
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Error al sumarse al proyecto', 'error');
        }
    };

    const filtered = projects.filter(p => {
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

    const isUsuarioComun = user?.rol === 'USUARIO';
    const hasPending = user?.hasPendingRoleRequest;

    return (
        <div className="pending-page animate-fadeIn">
            <div className="pending-header">
                <h1><Briefcase size={24} /> Proyectos</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-sm)' }}>
                    {filtered.length} proyecto{filtered.length !== 1 ? 's' : ''} · Barreras que se están trabajando
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

            {isUsuarioComun && !hasPending && (
                <div style={{
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
                    {['iniciando', 'en-proceso', 'finalizado'].map(s => (
                        <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                            {PROJECT_STATUSES[s]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="pending-list">
                {filtered.length === 0 ? (
                    <div className="pending-empty">
                        <Briefcase size={40} color="var(--gray-300)" />
                        <p>No hay proyectos{statusFilter !== 'todos' ? ' con este estado' : ''}</p>
                    </div>
                ) : filtered.map(p => {
                    const barrier = barriers.find(b => String(b.id) === String(p.barrierId));
                    const lastEntry = p.timeline?.[p.timeline.length - 1];
                    const completedEntries = p.timeline?.filter(t => t.completed).length || 0;

                    const isUserCollaborator = user && p.collaborators?.some(c => c.userId === user?.id);

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
                            <div className="pending-card">
                                <div className="pending-card-header">
                                    <div>
                                        <h3 style={{ marginBottom: '0.25rem' }}>{p.title}</h3>
                                        {barrier && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                                Barrera: {barrier.title}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0, alignItems: 'flex-start' }}>
                                        <span className={`badge badge-${p.status}`}>
                                            {PROJECT_STATUSES[p.status]?.label}
                                        </span>
                                        {p.needsHelp && (
                                            <span className="badge badge-urgente"><HelpCircle size={10} /> Necesita ayuda</span>
                                        )}
                                        {isUsuarioComun && hasPendingForThisProject && (
                                            <span className="badge" style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={10} /> Postulación Pendiente
                                            </span>
                                        )}
                                        {isUserCollaborator && (
                                            <span className="badge" style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={10} /> Colaborás aquí
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                                    {p.description?.substring(0, 120)}{p.description?.length > 120 ? '...' : ''}
                                </p>

                                {/* Quick stats */}
                                <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={12} /> {p.collaborators?.length || 0} colaboradores
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={12} /> {completedEntries}/{p.timeline?.length || 0} hitos
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Target size={12} /> Líder: {p.leader}
                                    </span>
                                </div>

                                {/* Last timeline entry */}
                                {lastEntry && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--gray-500)',
                                        padding: '0.5rem 0.75rem',
                                        background: 'var(--gray-50)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        justifyContent: 'space-between',
                                        marginBottom: (isUserCollaborator || (isUsuarioComun && hasPendingForThisProject)) ? '0.5rem' : '0'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} />
                                            Último avance: {lastEntry.text?.substring(0, 60)}{lastEntry.text?.length > 60 ? '...' : ''}
                                        </span>
                                        <ChevronRight size={14} />
                                    </div>
                                )}

                                {isUserCollaborator && (
                                    <div style={{
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
                                        onClick={(e) => isUsuarioComun ? handlePostular(e, p) : handleSumarme(e, p)}
                                        className="btn btn-accent btn-sm"
                                        style={{
                                            marginTop: '0.75rem',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '0.5rem'
                                        }}
                                    >
                                        <Users size={14} /> Ser colaborador
                                    </button>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
