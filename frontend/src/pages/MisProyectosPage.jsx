import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PROJECT_STATUSES } from '../data/seedData';
import { Briefcase, Search, ChevronRight, Users, CheckCircle, Clock } from 'lucide-react';

export default function MisProyectosPage() {
    const { projects, barriers, loading } = useData();
    const { user } = useAuth();
    const [search, setSearch] = useState('');

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

    return (
        <div className="pending-page animate-fadeIn">
            {/* Title Section */}
            <div className="pending-header" style={{ marginTop: 0 }}>
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
                {loading ? (
                    <div className="pending-empty" style={{ padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando mis proyectos...</p>
                    </div>
                ) : filtered.length === 0 ? (
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
                        const completedEntries = p.timeline?.filter(t => t.completed).length || 0;

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

                                    {/* Quick stats */}
                                    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={12} /> {p.collaborators?.length || 0} colaboradores
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={12} /> {completedEntries}/{p.timeline?.length || 0} hitos
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
