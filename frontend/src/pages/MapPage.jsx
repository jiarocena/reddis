import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import InteractiveMap from '../components/Map/InteractiveMap';
import BarrierCard from '../components/Barrier/BarrierCard';
import { CATEGORIES, PROJECT_STATUSES, DEPARTAMENTOS } from '../data/seedData';
import { Filter, X, Search, MapPin } from 'lucide-react';

export default function MapPage() {
    const { barriers } = useData();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');

    // If user is logged in, default to their department
    const userDepto = user?.departamento || null;
    const userDeptoData = userDepto ? DEPARTAMENTOS.find(d => d.nombre === userDepto) : null;

    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [selectedStatus, setSelectedStatus] = useState('todos');
    const [selectedDepartamento, setSelectedDepartamento] = useState(userDepto || 'todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBarrierId, setSelectedBarrierId] = useState(null);
    const [mapCenter, setMapCenter] = useState(userDeptoData ? userDeptoData.center : null);
    const [mapZoom, setMapZoom] = useState(userDeptoData ? userDeptoData.zoom : null);
    const [initializedForUser, setInitializedForUser] = useState(false);

    // Auto-center on user's department when user loads
    useEffect(() => {
        if (user?.departamento && !initializedForUser) {
            const depto = DEPARTAMENTOS.find(d => d.nombre === user.departamento);
            if (depto) {
                setSelectedDepartamento(user.departamento);
                setMapCenter(depto.center);
                setMapZoom(depto.zoom);
                setInitializedForUser(true);
            }
        }
    }, [user, initializedForUser]);

    const filteredBarriers = barriers.filter(b => {
        if (!b.isPublic) return false;
        // Exclude barriers without valid coordinates to prevent map rendering issues
        if (!b.location || b.location.lat === null || b.location.lat === undefined || b.location.lng === null || b.location.lng === undefined || isNaN(Number(b.location.lat)) || isNaN(Number(b.location.lng))) {
            return false;
        }
        // In public mode, only show approved barriers
        if (!isGestion && b.approved === false) return false;
        // If user is logged in, always filter by their department
        if (userDepto && b.departamento !== userDepto) return false;
        if (selectedCategory !== 'todas' && b.category !== selectedCategory) return false;
        if (selectedStatus !== 'todos' && b.status !== selectedStatus) return false;
        if (!userDepto && selectedDepartamento !== 'todos' && b.departamento !== selectedDepartamento) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchTitle = b.title?.toLowerCase().includes(term);
            const matchDesc = b.description?.toLowerCase().includes(term);
            const matchDepto = b.departamento?.toLowerCase().includes(term);
            const matchLocalidad = b.localidad?.toLowerCase().includes(term);
            const matchAddress = b.address?.toLowerCase().includes(term);
            if (!matchTitle && !matchDesc && !matchDepto && !matchLocalidad && !matchAddress) return false;
        }
        return true;
    });

    // Get unique departments from barriers
    const barrierDeptos = [...new Set(barriers.filter(b => b.departamento).map(b => b.departamento))].sort();

    const handleMarkerClick = (barrierId) => {
        setSelectedBarrierId(barrierId);
        const el = document.getElementById(`barrier-${barrierId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleDepartamentoChange = (deptoName) => {
        setSelectedDepartamento(deptoName);
        if (deptoName !== 'todos') {
            const depto = DEPARTAMENTOS.find(d => d.nombre === deptoName);
            if (depto) {
                setMapCenter(depto.center);
                setMapZoom(depto.zoom);
            }
        } else {
            setMapCenter(null);
            setMapZoom(null);
        }
    };

    return (
        <div className="map-page">
            <div className="map-container">
                <InteractiveMap
                    barriers={filteredBarriers}
                    selectedBarrierId={selectedBarrierId}
                    onMarkerClick={handleMarkerClick}
                    externalCenter={mapCenter}
                    externalZoom={mapZoom}
                />
            </div>

            <div className="map-sidebar">
                <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-4)', color: 'var(--gray-900)' }}>
                    Barreras Reportadas
                </h2>

                {/* Department Selector */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                    <label style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                        <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        Departamento
                    </label>
                    {userDepto ? (
                        <>
                            <input
                                type="text"
                                className="form-input"
                                value={userDepto}
                                disabled
                                style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', cursor: 'not-allowed', fontSize: 'var(--font-sm)', padding: 'var(--space-2) var(--space-3)' }}
                            />
                            <small style={{ color: 'var(--gray-400)', fontSize: '0.7rem' }}>Filtrado por tu departamento</small>
                        </>
                    ) : (
                        <select
                            className="form-select"
                            value={selectedDepartamento}
                            onChange={(e) => handleDepartamentoChange(e.target.value)}
                            style={{ fontSize: 'var(--font-sm)', padding: 'var(--space-2) var(--space-3)' }}
                        >
                            <option value="todos">Todos los departamentos</option>
                            {DEPARTAMENTOS.map(d => (
                                <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Category Filters */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                    <label style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                        <Filter size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        Categoría
                    </label>
                    <div className="map-filters">
                        <button
                            className={`filter-btn ${selectedCategory === 'todas' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('todas')}
                        >Todas</button>
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                            <button
                                key={key}
                                className={`filter-btn ${selectedCategory === key ? `active-${key}` : ''}`}
                                onClick={() => setSelectedCategory(key)}
                            >{cat.label}</button>
                        ))}
                    </div>
                </div>

                {/* Status Filters */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                        Estado
                    </label>
                    <div className="map-filters">
                        <button
                            className={`filter-btn ${selectedStatus === 'todos' ? 'active' : ''}`}
                            onClick={() => setSelectedStatus('todos')}
                        >Todos</button>
                        {Object.entries(PROJECT_STATUSES).map(([key, st]) => (
                            <button
                                key={key}
                                className={`filter-btn ${selectedStatus === key ? `active` : ''}`}
                                onClick={() => setSelectedStatus(key)}
                            >{st.label}</button>
                        ))}
                    </div>
                </div>

                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                    {filteredBarriers.length} barrera{filteredBarriers.length !== 1 ? 's' : ''} encontrada{filteredBarriers.length !== 1 ? 's' : ''}
                </div>

                {/* Barrier List */}
                <div className="barrier-list">
                    {filteredBarriers.map(barrier => (
                        <div
                            key={barrier.id}
                            id={`barrier-${barrier.id}`}
                            style={{
                                border: selectedBarrierId === barrier.id ? '2px solid var(--primary-400)' : undefined,
                                borderRadius: selectedBarrierId === barrier.id ? 'var(--radius-lg)' : undefined,
                            }}
                        >
                            <BarrierCard barrier={barrier} compact />
                        </div>
                    ))}
                    {filteredBarriers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-400)' }}>
                            <p>No se encontraron barreras con estos filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
