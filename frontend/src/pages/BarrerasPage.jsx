import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import InteractiveMap from '../components/Map/InteractiveMap';
import { MapPin, List, Clock, AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '../data/seedData';

export default function BarrerasPage() {
    const { barriers, loading } = useData();
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

    return (
        <div className="barreras-page">
            {/* View Toggle */}
            <div className="view-toggle">
                <button
                    className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                    onClick={() => setViewMode('map')}
                >
                    <MapPin size={16} /> Mapa
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                >
                    <List size={16} /> Listado
                </button>
            </div>

            {/* Map View */}
            {viewMode === 'map' && (
                <div className="barreras-map-container">
                    <InteractiveMap barriers={barriers} />
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="barreras-list-container">
                    {loading ? (
                        <div className="pending-empty" style={{ padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando barreras...</p>
                        </div>
                    ) : barriers.length === 0 ? (
                        <div className="empty-state">
                            <AlertTriangle size={48} />
                            <p>No hay barreras reportadas aún</p>
                        </div>
                    ) : (
                        <div className="barreras-list">
                            {barriers.map(b => (
                                <Link key={b.id} to={`/barrera/${b.id}`} className="barrera-list-item">
                                    <div className="barrera-list-icon" style={{
                                        background: CATEGORIES[b.category]?.color || 'var(--gray-400)'
                                    }}>
                                        <MapPin size={14} color="white" />
                                    </div>
                                    <div className="barrera-list-content">
                                        <h4>{b.title}</h4>
                                        <p>{b.address}</p>
                                        <div className="barrera-list-meta">
                                            <span className={`badge badge-sm badge-${b.category}`}>
                                                {CATEGORIES[b.category]?.label}
                                            </span>
                                            {b.urgency === 'alta' && (
                                                <span className="badge badge-sm badge-urgente">Urgente</span>
                                            )}
                                            <span className="barrera-list-date">
                                                <Clock size={12} /> {b.date}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
