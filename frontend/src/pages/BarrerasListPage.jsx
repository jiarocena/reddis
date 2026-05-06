import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CATEGORIES, PROJECT_STATUSES } from '../data/seedData';
import { List, Search, MapPin, AlertTriangle, Filter, ChevronRight } from 'lucide-react';

export default function BarrerasListPage() {
    const { barriers } = useData();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('todas');
    const [statusFilter, setStatusFilter] = useState('todos');

    const filtered = barriers.filter(b => {
        if (categoryFilter !== 'todas' && b.category !== categoryFilter) return false;
        if (statusFilter !== 'todos' && b.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="pending-page animate-fadeIn">
            <div className="pending-header">
                <h1><List size={24} /> Barreras Registradas</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-sm)' }}>
                    {filtered.length} barrera{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--gray-400)' }} />
                <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar por nombre, descripción o dirección..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-1)' }}>
                        <Filter size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Categoría
                    </label>
                    <div className="map-filters">
                        <button className={`filter-btn ${categoryFilter === 'todas' ? 'active' : ''}`} onClick={() => setCategoryFilter('todas')}>Todas</button>
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                            <button key={key} className={`filter-btn ${categoryFilter === key ? `active-${key}` : ''}`} onClick={() => setCategoryFilter(key)}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-1)' }}>
                        Estado
                    </label>
                    <div className="map-filters">
                        <button className={`filter-btn ${statusFilter === 'todos' ? 'active' : ''}`} onClick={() => setStatusFilter('todos')}>Todos</button>
                        {Object.entries(PROJECT_STATUSES).map(([key, st]) => (
                            <button key={key} className={`filter-btn ${statusFilter === key ? 'active' : ''}`} onClick={() => setStatusFilter(key)}>
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="pending-list">
                {filtered.length === 0 ? (
                    <div className="pending-empty">
                        <MapPin size={40} color="var(--gray-300)" />
                        <p>No se encontraron barreras con estos filtros</p>
                    </div>
                ) : filtered.map(b => (
                    <Link key={b.id} to={`/gestion/barrera/${b.id}`} style={{ textDecoration: 'none' }}>
                        <div className="pending-card">
                            <div className="pending-card-header">
                                <h3>{b.title}</h3>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0 }}>
                                    <span className={`badge badge-${b.category}`}>{CATEGORIES[b.category]?.label}</span>
                                    <span className={`badge badge-${b.status}`}>{PROJECT_STATUSES[b.status]?.label}</span>
                                    {b.urgency === 'alta' && (
                                        <span className="badge badge-urgente"><AlertTriangle size={10} /> Urgente</span>
                                    )}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                                {b.description?.substring(0, 150)}{b.description?.length > 150 ? '...' : ''}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={12} /> {b.address}
                                </span>
                                <ChevronRight size={16} color="var(--gray-400)" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
