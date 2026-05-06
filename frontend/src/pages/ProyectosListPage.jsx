import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { PROJECT_STATUSES, CATEGORIES } from '../data/seedData';
import { Briefcase, Search, ChevronRight, Users, Clock, CheckCircle, HelpCircle, Target } from 'lucide-react';

export default function ProyectosListPage() {
    const { projects, barriers } = useData();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const filtered = projects.filter(p => {
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

    return (
        <div className="pending-page animate-fadeIn">
            <div className="pending-header">
                <h1><Briefcase size={24} /> Proyectos</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-sm)' }}>
                    {filtered.length} proyecto{filtered.length !== 1 ? 's' : ''} · Barreras que se están trabajando
                </p>
            </div>

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
                                        {barrier && (
                                            <span className={`badge badge-${barrier.category}`}>
                                                {CATEGORIES[barrier.category]?.label}
                                            </span>
                                        )}
                                        {p.needsHelp && (
                                            <span className="badge badge-urgente"><HelpCircle size={10} /> Necesita ayuda</span>
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
                                        justifyContent: 'space-between'
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
                })}
            </div>
        </div>
    );
}
