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
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');

    // If user is logged in, default to their department
    const userDepto = user?.departamento || null;
    const userDeptoData = userDepto ? DEPARTAMENTOS.find(d => d.nombre === userDepto) : null;

    const isListPath = location.pathname === '/gestion/barreras';
    const [viewMode, setViewMode] = useState(isListPath ? 'list' : 'map'); // 'map' or 'list'
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [selectedStatus, setSelectedStatus] = useState('todos');
    const [selectedDepartamento, setSelectedDepartamento] = useState(userDepto || 'todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBarrierId, setSelectedBarrierId] = useState(null);
    const [mapCenter, setMapCenter] = useState(userDeptoData ? userDeptoData.center : null);
    const [mapZoom, setMapZoom] = useState(userDeptoData ? userDeptoData.zoom : null);
    const [initializedForUser, setInitializedForUser] = useState(false);

    // Auto-center map: user department if authenticated, otherwise browser geolocation
    useEffect(() => {
        if (loading || initializedForUser) return;

        if (isAuthenticated) {
            if (user?.departamento) {
                const depto = DEPARTAMENTOS.find(d => d.nombre === user.departamento);
                if (depto) {
                    setSelectedDepartamento(user.departamento);
                    setMapCenter(depto.center);
                    setMapZoom(depto.zoom);
                    setInitializedForUser(true);
                }
            } else {
                setInitializedForUser(true);
            }
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setMapCenter([latitude, longitude]);
                        setMapZoom(14); // Closer zoom for device location
                        setInitializedForUser(true);
                    },
                    (error) => {
                        console.warn("Error getting geolocation:", error);
                        setInitializedForUser(true); // Don't loop if error/denied
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
                );
            } else {
                setInitializedForUser(true);
            }
        }
    }, [loading, isAuthenticated, user, initializedForUser]);

    // Sync viewMode with URL path changes (e.g. Map vs List menu options)
    useEffect(() => {
        const isList = location.pathname === '/gestion/barreras';
        setViewMode(isList ? 'list' : 'map');
    }, [location.pathname]);

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

    const handleMarkerClick = (barrierId) => {
        setSelectedBarrierId(barrierId);
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
        <div className="map-page-layout">
            {/* View toggle header stuck to the top bar */}
            <div className="map-toggle-header">
                <div className="map-toggle-buttons">
                    <button
                        className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                        onClick={() => setViewMode('map')}
                    >
                        Mapa de barreras
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        Listado de barreras
                    </button>
                </div>
            </div>

            <div className="map-page-content">
                {viewMode === 'map' && (
                    <div className="map-container full-view animate-fadeIn">
                        <InteractiveMap
                            barriers={filteredBarriers}
                            selectedBarrierId={selectedBarrierId}
                            onMarkerClick={handleMarkerClick}
                            externalCenter={mapCenter}
                            externalZoom={mapZoom}
                        />
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="map-list-container animate-fadeIn">
                        {/* Filters grid */}
                        <div className="list-filters-section">
                            {/* Department Selector */}
                            <div className="filter-group-item">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={12} /> Departamento
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
                            <div className="filter-group-item">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Filter size={12} /> Categoría
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
                            <div className="filter-group-item">
                                <label>Estado</label>
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
                        </div>

                        {/* Search and Count */}
                        <div className="list-meta-section">
                            <div className="search-bar-container">
                                <input
                                    type="text"
                                    className="form-input search-input"
                                    placeholder="Buscar por título, dirección, descripción..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ fontSize: 'var(--font-sm)', padding: 'var(--space-2) var(--space-8) var(--space-2) var(--space-3)' }}
                                />
                                {searchTerm ? (
                                    <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                                        <X size={16} />
                                    </button>
                                ) : (
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
                                        <Search size={16} />
                                    </span>
                                )}
                            </div>
                            <div className="results-count-text">
                                {filteredBarriers.length} barrera{filteredBarriers.length !== 1 ? 's' : ''} encontrada{filteredBarriers.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Responsive grid of barrier cards */}
                        <div className="list-cards-grid">
                            {filteredBarriers.map(barrier => (
                                <div
                                    key={barrier.id}
                                    id={`barrier-${barrier.id}`}
                                    className="grid-card-wrapper"
                                    style={{
                                        border: selectedBarrierId === barrier.id ? '2px solid var(--primary-400)' : undefined,
                                        borderRadius: selectedBarrierId === barrier.id ? 'var(--radius-lg)' : undefined,
                                    }}
                                >
                                    <BarrierCard barrier={barrier} />
                                </div>
                            ))}
                            {filteredBarriers.length === 0 && (
                                <div className="empty-state-container">
                                    <p>No se encontraron barreras con estos filtros.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
