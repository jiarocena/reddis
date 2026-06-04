import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PROJECT_STATUSES } from '../data/seedData';
import { Briefcase, Search, ChevronRight, Users, CheckCircle, Clock, LogOut, Settings } from 'lucide-react';

export default function MisProyectosPage() {
    const { projects, barriers, showToast } = useData();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const handleLogout = () => {
        logout();
        showToast('Sesión cerrada con éxito', 'info');
        navigate('/');
    };

    // Filter projects where current user is a collaborator
    const myCollaborations = projects.filter(p => 
        p.collaborators?.some(c => Number(c.userId) === Number(user?.id))
    );

    const filtered = myCollaborations.filter(p => {
        if (search) {
            const q = search.toLowerCase();
            const barrier = barriers.find(b => String(b.id) === String(p.barrierId));
            return p.title.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                barrier?.title?.toLowerCase().includes(q);
        }
        return true;
    });

    const userInitials = user?.nombre
        ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="pending-page animate-fadeIn">
            {/* Profile Header Card */}
            <div className="profile-header-card animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {userInitials}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--gray-900)', fontWeight: 700 }}>
                            ¡Hola, {user?.nombre}!
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            Rol: <strong>{user?.rol}</strong> · Depto: <strong>{user?.departamento || 'No asignado'}</strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link to="/gestion/perfil" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Settings size={12} /> Configurar Cuenta
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="btn btn-secondary btn-sm" 
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger-500)', borderColor: 'var(--danger-400)' }}
                        >
                            <LogOut size={12} /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Title Section */}
            <div className="pending-header" style={{ marginTop: 'var(--space-8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Briefcase size={24} /> Mis proyectos
                    </h1>
                </div>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-sm)', marginTop: '0.25rem' }}>
                    Estás colaborando en {myCollaborations.length} proyecto{myCollaborations.length !== 1 ? 's' : ''} active{myCollaborations.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--gray-400)' }} />
                <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar entre mis proyectos..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                />
            </div>

            {/* Project List */}
            <div className="pending-list">
                {filtered.length === 0 ? (
                    <div className="pending-empty" style={{ padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                        <Briefcase size={40} color="var(--gray-300)" style={{ marginBottom: '1rem' }} />
                        {myCollaborations.length === 0 ? (
                            <>
                                <p style={{ margin: '0 0 1rem 0', fontWeight: 600, color: 'var(--gray-700)' }}>Aún no estás colaborando en ningún proyecto</p>
                                <p style={{ margin: '0 0 1.5rem 0', fontSize: 'var(--font-sm)', color: 'var(--gray-500)', lineHeight: 1.5 }}>
                                    Explorá la sección de Colaborar para postularte y participar activamente.
                                </p>
                                <Link to="/gestion/proyectos" className="btn btn-primary">
                                    Explorar Proyectos
                                </Link>
                            </>
                        ) : (
                            <p style={{ margin: 0, color: 'var(--gray-500)' }}>No se encontraron proyectos con tu búsqueda.</p>
                        )}
                    </div>
                ) : (
                    filtered.map(p => {
                        const barrier = barriers.find(b => String(b.id) === String(p.barrierId));
                        const lastEntry = p.timeline?.[p.timeline.length - 1];
                        const completedEntries = p.timeline?.filter(t => t.completed).length || 0;

                        return (
                            <Link key={p.id} to={`/gestion/proyecto/${p.id}`} style={{ textDecoration: 'none' }}>
                                <div className="pending-card">
                                    <div className="pending-card-header">
                                        <div>
                                            <h3 style={{ marginBottom: '0.25rem', color: 'var(--gray-900)' }}>{p.title}</h3>
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
                                            <span className="badge" style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={10} /> Colaborador
                                            </span>
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
                                    </div>

                                    {/* Last timeline entry */}
                                    {lastEntry && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            padding: '0.5rem 0.75rem',
                                            background: 'var(--primary-600)',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            justifyContent: 'space-between',
                                            color: 'var(--white)'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} />
                                                Último avance: {lastEntry.text?.substring(0, 60)}{lastEntry.text?.length > 60 ? '...' : ''}
                                            </span>
                                            <ChevronRight size={14} />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
