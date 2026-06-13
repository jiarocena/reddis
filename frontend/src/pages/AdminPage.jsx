import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CATEGORIES, PROJECT_STATUSES } from '../data/seedData';
import {
    Shield, BarChart3, AlertTriangle, CheckCircle, Users,
    RefreshCw, Eye, Search, Filter, Trash2, MailCheck, Briefcase, MapPin, MessageSquare
} from 'lucide-react';
import * as api from '../api/api';

export default function AdminPage() {
    const { barriers, projects, stats, resetData, deleteBarrier, deleteProject, backendAvailable, showToast, loading } = useData();

    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'barriers' | 'projects' | 'users'
    const [loggedTimeFilter, setLoggedTimeFilter] = useState('dia');
    const [guestTimeFilter, setGuestTimeFilter] = useState('dia');

    // Lists and filters
    const [barrierSearch, setBarrierSearch] = useState('');
    const [barrierCategory, setBarrierCategory] = useState('todas');

    const [projectSearch, setProjectSearch] = useState('');
    const [projectStatus, setProjectStatus] = useState('todos');

    const [userSearch, setUserSearch] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [metrics, setMetrics] = useState(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);

    const loadMetrics = async () => {
        if (!backendAvailable) {
            setLoadingMetrics(false);
            return;
        }
        setLoadingMetrics(true);
        try {
            const data = await api.fetchAdminMetrics();
            setMetrics(data);
        } catch (err) {
            console.error('Error fetching admin metrics:', err);
        } finally {
            setLoadingMetrics(false);
        }
    };

    // Load users from API when user tab is active
    const loadUsers = async () => {
        if (!backendAvailable) {
            // Mock Users fallback
            setUsersList([
                { id: 1, nombre: 'Administrador General', email: 'admin@reddis.gub.uy', rol: 'ADMIN', activo: true, emailConfirmed: true, departamento: 'Montevideo', createdAt: '2025-01-01' },
                { id: 2, nombre: 'Referente Canelones', email: 'referente.canelones@reddis.gub.uy', rol: 'REFERENTE', departamento: 'Canelones', activo: true, emailConfirmed: true, createdAt: '2025-01-10' },
                { id: 3, nombre: 'Colaborador Fray Bentos', email: 'colab.fraybentos@reddis.gub.uy', rol: 'COLABORADOR', departamento: 'Río Negro', activo: true, emailConfirmed: true, createdAt: '2025-02-15' },
                { id: 4, nombre: 'María Inés', email: 'maria.ines@gmail.com', rol: 'CIUDADANO', departamento: 'San José', activo: true, emailConfirmed: false, createdAt: '2025-03-20' },
                { id: 5, nombre: 'José Pedro', email: 'jose.pedro@hotmail.com', rol: 'CIUDADANO', departamento: 'Flores', activo: true, emailConfirmed: true, createdAt: '2025-04-01' }
            ]);
            return;
        }

        setLoadingUsers(true);
        try {
            const list = await api.fetchAllUsers();
            // The API returns fields mapping, sort by ID descending
            const sorted = list.sort((a, b) => b.id - a.id);
            setUsersList(sorted);
        } catch (err) {
            console.error('Error fetching users:', err);
            showToast('Error al cargar lista de usuarios', 'error');
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'dashboard') {
            loadUsers();
        }
        if (activeTab === 'dashboard') {
            loadMetrics();
        }
    }, [activeTab, backendAvailable]);

    // Handlers for deletions
    const handleDeleteBarrier = async (id, title) => {
        if (window.confirm(`¿Estás seguro de que querés eliminar la barrera "${title}"?\n\n¡ATENCIÓN! Si tiene un proyecto de resolución asociado, también se eliminará.`)) {
            const ok = await deleteBarrier(id);
            if (ok) {
                showToast('Barrera eliminada con éxito', 'success');
            }
        }
    };

    const handleDeleteProject = async (id, title) => {
        if (window.confirm(`¿Estás seguro de que querés eliminar el proyecto "${title}"?\n\nLa barrera asociada volverá a estar en estado "denuncia".`)) {
            const ok = await deleteProject(id);
            if (ok) {
                showToast('Proyecto eliminado con éxito', 'success');
            }
        }
    };

    const handleDeleteUser = async (id, email) => {
        if (window.confirm(`¿Estás seguro de que querés eliminar al usuario con correo "${email}"?`)) {
            if (backendAvailable) {
                try {
                    await api.deleteUsuario(id);
                    showToast('Usuario eliminado con éxito', 'success');
                    loadUsers();
                } catch (err) {
                    console.error('Error deleting user:', err);
                    showToast(err.message || 'Error al eliminar usuario', 'error');
                }
            } else {
                setUsersList(prev => prev.filter(u => u.id !== id));
                showToast('Usuario eliminado (modo local)', 'success');
            }
        }
    };

    const handleConfirmEmail = async (email) => {
        if (backendAvailable) {
            try {
                await api.confirmUsuarioEmail(email);
                showToast(`Email verificado para ${email}`, 'success');
                loadUsers();
            } catch (err) {
                console.error('Error confirming email:', err);
                showToast('Error al confirmar email', 'error');
            }
        } else {
            setUsersList(prev => prev.map(u => u.email === email ? { ...u, emailConfirmed: true } : u));
            showToast(`Email verificado para ${email} (modo local)`, 'success');
        }
    };

    // Filter calculations
    const barriersByCategory = Object.entries(CATEGORIES).map(([key, cat]) => ({
        ...cat, key, count: barriers.filter(b => b.category === key).length
    }));

    const barriersByStatus = Object.entries(PROJECT_STATUSES).map(([key, st]) => ({
        ...st, key, count: barriers.filter(b => b.status === key).length
    }));

    // Filtered lists
    const filteredBarriers = barriers.filter(b => {
        const matchSearch = b.title?.toLowerCase().includes(barrierSearch.toLowerCase()) ||
                            b.address?.toLowerCase().includes(barrierSearch.toLowerCase()) ||
                            b.departamento?.toLowerCase().includes(barrierSearch.toLowerCase());
        const matchCategory = barrierCategory === 'todas' || b.category === barrierCategory;
        return matchSearch && matchCategory;
    });

    const filteredProjects = projects.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(projectSearch.toLowerCase()) ||
                            p.leader?.toLowerCase().includes(projectSearch.toLowerCase());
        const matchStatus = projectStatus === 'todos' || p.status === projectStatus;
        return matchSearch && matchStatus;
    });

    const filteredUsers = usersList.filter(u => {
        const name = u.nombre || u.nombreCompleto || '';
        const matchSearch = name.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.rol?.toLowerCase().includes(userSearch.toLowerCase());
        return matchSearch;
    });

    const loggedData = (metrics && metrics.logged) ? metrics.logged : LOGGED_IN_DATA;
    const guestData = (metrics && metrics.guest) ? metrics.guest : GUEST_DATA;
    const featuresData = (metrics && metrics.features) ? metrics.features : null;
    const userActivitiesData = (metrics && metrics.userActivities) ? metrics.userActivities : null;

    return (
        <div className="admin-page animate-fadeIn">
            <div className="container">
                <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1>
                                <Shield size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary-600)' }} />
                                Panel de Administración
                            </h1>
                            <p style={{ color: 'var(--gray-500)' }}>REDDIS - Consola del Administrador</p>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={resetData}>
                            <RefreshCw size={14} /> Reiniciar datos demo
                        </button>
                    </div>
                </div>

                {/* Tabs Selector */}
                <div className="admin-tabs">
                    <button className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <BarChart3 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Resumen
                    </button>
                    <button className={`admin-tab-btn ${activeTab === 'barriers' ? 'active' : ''}`} onClick={() => setActiveTab('barriers')}>
                        <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Barreras ({loading ? '...' : barriers.length})
                    </button>
                    <button className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
                        <Briefcase size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Proyectos ({loading ? '...' : projects.length})
                    </button>
                    <button className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Usuarios ({loadingUsers || loading ? '...' : usersList.length})
                    </button>
                </div>

                {loading ? (
                    <div className="pending-empty" style={{ padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', textAlign: 'center', marginTop: '1.5rem' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando información del panel...</p>
                    </div>
                ) : (
                    <>
                        {/* TAB 1: DASHBOARD */}
                        {activeTab === 'dashboard' && (
                    <div className="animate-fadeIn">
                        {/* Stats Grid */}
                        <div className="admin-grid">
                            <div className="admin-stat">
                                <div className="admin-stat-number">{stats.totalBarriers}</div>
                                <div className="admin-stat-label">Total de barreras</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-number" style={{ color: 'var(--status-en-proceso)' }}>{stats.activeProjects}</div>
                                <div className="admin-stat-label">Proyectos activos</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-number" style={{ color: 'var(--success-500)' }}>{stats.resolvedProjects}</div>
                                <div className="admin-stat-label">Resueltos</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-number" style={{ color: 'var(--accent-500)' }}>{stats.totalCollaborators}</div>
                                <div className="admin-stat-label">Actores involucrados</div>
                            </div>
                        </div>

                        {/* Distributions */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Por Categoría</h3>
                                {barriersByCategory.map(cat => (
                                    <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                                            <span style={{ fontSize: '0.875rem' }}>{cat.label}</span>
                                        </div>
                                        <strong style={{ fontSize: '0.875rem' }}>{cat.count}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Por Estado</h3>
                                {barriersByStatus.map(st => (
                                    <div key={st.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: st.color }} />
                                            <span style={{ fontSize: '0.875rem' }}>{st.label}</span>
                                        </div>
                                        <strong style={{ fontSize: '0.875rem' }}>{st.count}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Application Usage Metrics Section */}
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '2rem 0 1rem', color: 'var(--gray-900)' }}>
                            Métricas de Uso de la Aplicación
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(325px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {/* Chart 1: Logged-in Users */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={18} style={{ color: 'var(--primary-500)' }} />
                                        Usuarios Logueados
                                    </h3>
                                    <div style={{ display: 'flex', background: 'var(--gray-100)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
                                        {['dia', 'semana', 'mes', 'ano'].map(key => (
                                            <button
                                                key={key}
                                                onClick={() => setLoggedTimeFilter(key)}
                                                style={{
                                                    padding: '4px 10px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: loggedTimeFilter === key ? 'var(--white)' : 'transparent',
                                                    color: loggedTimeFilter === key ? 'var(--primary-600)' : 'var(--gray-500)',
                                                    boxShadow: loggedTimeFilter === key ? 'var(--shadow-sm)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {key === 'dia' ? 'Día' : key === 'semana' ? 'Semana' : key === 'mes' ? 'Mes' : 'Año'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <TimeSeriesChart data={loggedData[loggedTimeFilter]} colorTheme="primary" />
                            </div>

                            {/* Chart 2: Guest Users */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Eye size={18} style={{ color: 'var(--accent-500)' }} />
                                        Usuarios No Logueados (Invitados)
                                    </h3>
                                    <div style={{ display: 'flex', background: 'var(--gray-100)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
                                        {['dia', 'semana', 'mes', 'ano'].map(key => (
                                            <button
                                                key={key}
                                                onClick={() => setGuestTimeFilter(key)}
                                                style={{
                                                    padding: '4px 10px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: guestTimeFilter === key ? 'var(--white)' : 'transparent',
                                                    color: guestTimeFilter === key ? 'var(--accent-600)' : 'var(--gray-500)',
                                                    boxShadow: guestTimeFilter === key ? 'var(--shadow-sm)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {key === 'dia' ? 'Día' : key === 'semana' ? 'Semana' : key === 'mes' ? 'Mes' : 'Año'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <TimeSeriesChart data={guestData[guestTimeFilter]} colorTheme="accent" />
                            </div>

                            {/* Chart 3: Feature Usage Frequency */}
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart3 size={18} style={{ color: 'var(--success-500)' }} />
                                    Uso de cada Funcionalidad
                                </h3>
                                <FeatureUsageChart featuresData={featuresData} />
                            </div>

                            {/* Chart 4: Usage per User */}
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={18} style={{ color: 'var(--accent-600)' }} />
                                    Uso por Usuario
                                </h3>
                                <UserActivityRanking usersList={usersList} userActivitiesData={userActivitiesData} />
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: BARRERAS */}
                {activeTab === 'barriers' && (
                    <div className="admin-table animate-fadeIn">
                        {/* Filters toolbar */}
                        <div style={{ padding: '1rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Buscar por título, dirección, dpto..."
                                    value={barrierSearch}
                                    onChange={(e) => setBarrierSearch(e.target.value)}
                                    style={{ paddingLeft: '2.25rem', fontSize: 'var(--font-sm)' }}
                                />
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={14} style={{ color: 'var(--gray-400)' }} />
                                <select
                                    className="form-select"
                                    value={barrierCategory}
                                    onChange={(e) => setBarrierCategory(e.target.value)}
                                    style={{ fontSize: 'var(--font-sm)', padding: '0.25rem 0.5rem' }}
                                >
                                    <option value="todas">Todas las categorías</option>
                                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                                        <option key={key} value={key}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginLeft: 'auto' }}>
                                {filteredBarriers.length} barreras encontradas
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Barrera</th>
                                    <th>Categoría</th>
                                    <th>Estado</th>
                                    <th>Dpto / Localidad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBarriers.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>#{b.id}</td>
                                        <td style={{ maxWidth: '280px' }}>
                                            <strong style={{ fontSize: '0.85rem', display: 'block' }}>{b.title}</strong>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{b.address}</span>
                                        </td>
                                        <td><span className={`badge badge-${b.category}`}>{CATEGORIES[b.category]?.label}</span></td>
                                        <td><span className={`badge badge-${b.status}`}>{PROJECT_STATUSES[b.status]?.label || b.status}</span></td>
                                        <td style={{ fontSize: '0.8rem' }}>📍 {b.departamento || 'No asignado'}{b.localidad ? ` - ${b.localidad}` : ''}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link to={`/barrera/${b.id}`} className="btn btn-secondary btn-sm" title="Ver detalle">
                                                    <Eye size={12} />
                                                </Link>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleDeleteBarrier(b.id, b.title)}
                                                    style={{ color: 'var(--danger-500)' }}
                                                    title="Eliminar barrera"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBarriers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                                            No se encontraron barreras.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 3: PROYECTOS */}
                {activeTab === 'projects' && (
                    <div className="admin-table animate-fadeIn">
                        {/* Filters toolbar */}
                        <div style={{ padding: '1rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Buscar por título, líder..."
                                    value={projectSearch}
                                    onChange={(e) => setProjectSearch(e.target.value)}
                                    style={{ paddingLeft: '2.25rem', fontSize: 'var(--font-sm)' }}
                                />
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={14} style={{ color: 'var(--gray-400)' }} />
                                <select
                                    className="form-select"
                                    value={projectStatus}
                                    onChange={(e) => setProjectStatus(e.target.value)}
                                    style={{ fontSize: 'var(--font-sm)', padding: '0.25rem 0.5rem' }}
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="iniciando">Iniciando</option>
                                    <option value="en-proceso">En proceso</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginLeft: 'auto' }}>
                                {filteredProjects.length} proyectos encontrados
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Proyecto</th>
                                    <th>Estado</th>
                                    <th>Líder / Encargado</th>
                                    <th>Fecha Inicio</th>
                                    <th>Colaboradores</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>#{p.id}</td>
                                        <td style={{ maxWidth: '280px' }}>
                                            <strong style={{ fontSize: '0.85rem', display: 'block' }}>{p.title}</strong>
                                        </td>
                                        <td><span className={`badge badge-${p.status}`}>{PROJECT_STATUSES[p.status]?.label || p.status}</span></td>
                                        <td style={{ fontSize: '0.8rem' }}>👤 {p.leader || 'Sin asignar'}</td>
                                        <td style={{ fontSize: '0.8rem' }}>{p.startDate}</td>
                                        <td style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                            <span style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                                                {p.collaborators?.length || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link to={`/proyecto/${p.id}`} className="btn btn-secondary btn-sm" title="Ver detalle">
                                                    <Eye size={12} />
                                                </Link>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleDeleteProject(p.id, p.title)}
                                                    style={{ color: 'var(--danger-500)' }}
                                                    title="Eliminar proyecto"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                                            No se encontraron proyectos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 4: USUARIOS */}
                {activeTab === 'users' && (
                    <div className="admin-table animate-fadeIn">
                        {/* Filters toolbar */}
                        <div style={{ padding: '1rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Buscar por nombre, email, rol..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    style={{ paddingLeft: '2.25rem', fontSize: 'var(--font-sm)' }}
                                />
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginLeft: 'auto' }}>
                                {filteredUsers.length} usuarios encontrados
                            </div>
                        </div>

                        {loadingUsers ? (
                            <div className="pending-empty" style={{ padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando usuarios...</p>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Departamento</th>
                                        <th>Verificado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => {
                                        const name = u.nombre || u.nombreCompleto || 'Usuario';
                                        const isSystem = u.rol === 'ADMIN' || u.rol === 'REFERENTE';
                                        return (
                                            <tr key={u.id}>
                                                <td style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>#{u.id}</td>
                                                <td><strong style={{ fontSize: '0.85rem' }}>{name}</strong></td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{u.email}</td>
                                                <td>
                                                    <span style={{
                                                        fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                                                        background: u.rol === 'ADMIN' ? '#fee2e2' : u.rol === 'REFERENTE' ? '#fef3c7' : u.rol === 'COLABORADOR' ? '#dbeafe' : '#f3f4f6',
                                                        color: u.rol === 'ADMIN' ? '#991b1b' : u.rol === 'REFERENTE' ? '#92400e' : u.rol === 'COLABORADOR' ? '#1e40af' : '#374151'
                                                    }}>
                                                        {u.rol}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.8rem' }}>📍 {u.departamento || 'No especificado'}</td>
                                                <td>
                                                    <span className={`badge badge-sm badge-${u.emailConfirmed ? 'finalizado' : 'denuncia'}`}>
                                                        {u.emailConfirmed ? 'Confirmado' : 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {!u.emailConfirmed && (
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => handleConfirmEmail(u.email)}
                                                                style={{ color: 'var(--success-600)' }}
                                                                title="Verificar email manualmente"
                                                            >
                                                                <MailCheck size={12} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                                            disabled={isSystem}
                                                            style={{
                                                                color: isSystem ? 'var(--gray-300)' : 'var(--danger-500)',
                                                                cursor: isSystem ? 'not-allowed' : 'pointer'
                                                            }}
                                                            title={isSystem ? "Cuentas de sistema no se pueden eliminar" : "Eliminar usuario"}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Internal Custom Chart Components & Mock Datasets (Analytics)
// ============================================================

function getDynamicMetrics() {
    const now = new Date();
    
    // --- 1. DIA (Últimas 24 horas en intervalos de 3h) ---
    const diaLogged = [];
    const diaGuest = [];
    for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);
        const hour = d.getHours();
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        
        const isToday = d.getDate() === now.getDate();
        const label = `${isToday ? 'Hoy' : 'Ayer'} ${hourStr}`;
        
        const baseValue = hour >= 9 && hour <= 22 ? 40 : 10;
        const randomFactor = Math.floor(Math.sin(hour / 3) * 15) + Math.floor(Math.random() * 10);
        
        diaLogged.push({ label, value: Math.max(2, baseValue + randomFactor) });
        diaGuest.push({ label, value: Math.max(5, (baseValue + randomFactor) * 2 + Math.floor(Math.random() * 15)) });
    }

    // --- 2. SEMANA (Últimos 7 días finalizando hoy) ---
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const semanaLogged = [];
    const semanaGuest = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = weekdays[d.getDay()];
        
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const baseValue = isWeekend ? 65 : 85;
        const randomFactor = Math.floor(Math.random() * 20) - 10;
        
        semanaLogged.push({ label, value: Math.max(30, baseValue + randomFactor) });
        semanaGuest.push({ label, value: Math.max(80, (baseValue + randomFactor) * 2.5 + Math.floor(Math.random() * 30)) });
    }

    // --- 3. MES (Últimas 4 semanas) ---
    const mesLogged = [];
    const mesGuest = [];
    for (let i = 3; i >= 0; i--) {
        const start = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        
        const formatLabel = (date) => `${date.getDate()} ${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][date.getMonth()]}`;
        const label = i === 0 ? 'Esta sem.' : `${formatLabel(start)} a ${formatLabel(end)}`;
        
        const baseValue = 350 + (3 - i) * 30;
        const randomFactor = Math.floor(Math.random() * 40) - 20;
        
        mesLogged.push({ label, value: baseValue + randomFactor });
        mesGuest.push({ label, value: Math.round((baseValue + randomFactor) * 2.8 + Math.random() * 50) });
    }

    // --- 4. AÑO (Últimos 12 meses) ---
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const anoLogged = [];
    const anoGuest = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        
        const monthIndex = d.getMonth();
        const seasonality = (monthIndex === 0 || monthIndex === 1) ? 0.75 : (monthIndex === 6) ? 0.88 : 1.0;
        
        const trend = 400 + (11 - i) * 35;
        const baseValue = Math.round(trend * seasonality);
        const randomFactor = Math.floor(Math.random() * 50) - 25;
        
        anoLogged.push({ label, value: Math.max(100, baseValue + randomFactor) });
        anoGuest.push({ label, value: Math.max(250, Math.round((baseValue + randomFactor) * 2.9 + Math.random() * 80)) });
    }

    return {
        logged: { dia: diaLogged, semana: semanaLogged, mes: mesLogged, ano: anoLogged },
        guest: { dia: diaGuest, semana: semanaGuest, mes: mesGuest, ano: anoGuest }
    };
}

const dynamicMetrics = getDynamicMetrics();
const LOGGED_IN_DATA = dynamicMetrics.logged;
const GUEST_DATA = dynamicMetrics.guest;

function TimeSeriesChart({ data, colorTheme = 'primary' }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const config = {
        primary: {
            stroke: 'var(--primary-500)',
            fillGradStart: 'rgba(45, 90, 184, 0.4)',
            fillGradEnd: 'rgba(45, 90, 184, 0.0)',
            dotColor: 'var(--primary-600)'
        },
        accent: {
            stroke: 'var(--accent-500)',
            fillGradStart: 'rgba(245, 158, 11, 0.4)',
            fillGradEnd: 'rgba(245, 158, 11, 0.0)',
            dotColor: 'var(--accent-600)'
        }
    }[colorTheme];

    if (!data || data.length === 0) return null;

    const margin = { top: 20, right: 15, bottom: 30, left: 35 };
    const width = 500;
    const height = 220;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 10);
    const minValue = 0;
    const valueRange = maxValue - minValue;

    const points = data.map((d, i) => {
        const x = margin.left + (i / (data.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
        return { x, y, label: d.label, value: d.value };
    });

    let linePathStr = '';
    let areaPathStr = '';

    if (points.length > 0) {
        linePathStr = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        areaPathStr = `${linePathStr} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`;
    }

    const yGridCount = 4;
    const yGridLines = Array.from({ length: yGridCount + 1 }).map((_, i) => {
        const val = minValue + (i / yGridCount) * valueRange;
        const y = margin.top + chartHeight - (i / yGridCount) * chartHeight;
        return { y, value: Math.round(val) };
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id={`grad-${colorTheme}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={config.fillGradStart} />
                        <stop offset="100%" stopColor={config.fillGradEnd} />
                    </linearGradient>
                </defs>

                {/* Y Grid Lines */}
                {yGridLines.map((line, i) => (
                    <g key={i}>
                        <line 
                            x1={margin.left} 
                            y1={line.y} 
                            x2={width - margin.right} 
                            y2={line.y} 
                            stroke="var(--gray-100)" 
                            strokeDasharray="4 4" 
                        />
                        <text 
                            x={margin.left - 8} 
                            y={line.y + 4} 
                            textAnchor="end" 
                            fontSize="10" 
                            fill="var(--gray-400)"
                            fontWeight="600"
                        >
                            {line.value}
                        </text>
                    </g>
                ))}

                {/* X Labels */}
                {points.map((p, i) => (
                    <text 
                        key={i} 
                        x={p.x} 
                        y={height - 10} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fill="var(--gray-400)"
                        fontWeight="600"
                    >
                        {p.label}
                    </text>
                ))}

                {/* Fill Area */}
                {areaPathStr && (
                    <path 
                        d={areaPathStr} 
                        fill={`url(#grad-${colorTheme})`} 
                    />
                )}

                {/* Stroke Line */}
                {linePathStr && (
                    <path 
                        d={linePathStr} 
                        fill="none" 
                        stroke={config.stroke} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Hover Trigger Areas */}
                {points.map((p, i) => {
                    const barWidth = chartWidth / data.length;
                    return (
                        <rect
                            key={i}
                            x={p.x - barWidth / 2}
                            y={margin.top}
                            width={barWidth}
                            height={chartHeight}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    );
                })}

                {/* Vertical Cursor & Highlight Dot */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                    <g>
                        <line 
                            x1={points[hoveredIndex].x} 
                            y1={margin.top} 
                            x2={points[hoveredIndex].x} 
                            y2={margin.top + chartHeight} 
                            stroke="var(--gray-300)" 
                            strokeWidth="1.5" 
                            strokeDasharray="2 2"
                        />
                        <circle 
                            cx={points[hoveredIndex].x} 
                            cy={points[hoveredIndex].y} 
                            r="6" 
                            fill={config.dotColor} 
                            stroke="var(--white)" 
                            strokeWidth="2"
                        />
                    </g>
                )}
            </svg>

            {/* Float Tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
                <div style={{
                    position: 'absolute',
                    left: `${(points[hoveredIndex].x / width) * 100}%`,
                    top: `${(points[hoveredIndex].y / height) * 100 - 45}%`,
                    transform: 'translateX(-50%)',
                    background: 'var(--gray-900)',
                    color: 'var(--white)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    boxShadow: 'var(--shadow-lg)',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: 'normal', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {points[hoveredIndex].label}
                    </div>
                    <div>{points[hoveredIndex].value} usuarios</div>
                </div>
            )}
        </div>
    );
}

function FeatureUsageChart({ featuresData }) {
    const defaultFeatures = [
        { name: 'Mapa y Consulta de Barreras', value: 1420, percentage: 54, color: 'var(--primary-500)', icon: 'map' },
        { name: 'Registro / Denuncia de Barreras', value: 348, percentage: 13, color: 'var(--barrier-actitudinal)', icon: 'report' },
        { name: 'Colaboración en Proyectos', value: 284, percentage: 11, color: 'var(--status-iniciando)', icon: 'project' },
        { name: 'Chat y Mensajería de Proyectos', value: 512, percentage: 19, color: 'var(--barrier-comunicacional)', icon: 'chat' },
        { name: 'Consola de Administración', value: 96, percentage: 3, color: 'var(--primary-700)', icon: 'admin' }
    ];

    const features = featuresData || defaultFeatures;

    const getIcon = (type) => {
        switch (type) {
            case 'map': return <MapPin size={16} style={{ color: 'var(--primary-500)' }} />;
            case 'report': return <AlertTriangle size={16} style={{ color: 'var(--barrier-actitudinal)' }} />;
            case 'project': return <Briefcase size={16} style={{ color: 'var(--status-iniciando)' }} />;
            case 'chat': return <MessageSquare size={16} style={{ color: 'var(--barrier-comunicacional)' }} />;
            case 'admin': return <Shield size={16} style={{ color: 'var(--primary-700)' }} />;
            default: return null;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.25rem 0' }}>
            {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getIcon(f.icon)}
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>{f.name}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                            <strong style={{ color: 'var(--gray-800)' }}>{f.value}</strong> <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({f.percentage}%)</span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--gray-100)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div 
                            style={{ 
                                height: '100%', 
                                width: `${f.percentage}%`, 
                                background: f.color, 
                                borderRadius: '999px',
                                transition: 'width 1s ease-out'
                            }} 
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function UserActivityRanking({ usersList, userActivitiesData }) {
    const [viewAll, setViewAll] = useState(false);

    // Dynamic generation based on real loaded system users
    const getActivities = () => {
        if (userActivitiesData && userActivitiesData.length > 0) {
            return userActivitiesData;
        }

        const defaultUsers = [
            { id: 101, nombre: 'Administrador General', email: 'admin@reddis.gub.uy', rol: 'ADMIN' },
            { id: 102, nombre: 'Referente Canelones', email: 'referente.canelones@reddis.gub.uy', rol: 'REFERENTE' },
            { id: 103, nombre: 'Colaborador Fray Bentos', email: 'colab.fraybentos@reddis.gub.uy', rol: 'COLABORADOR' },
            { id: 104, nombre: 'María Inés', email: 'maria.ines@gmail.com', rol: 'CIUDADANO' },
            { id: 105, nombre: 'José Pedro', email: 'jose.pedro@hotmail.com', rol: 'CIUDADANO' },
            { id: 106, nombre: 'Juan Pérez', email: 'juan.perez@gmail.com', rol: 'CIUDADANO' }
        ];

        const uniqueEmails = new Set();
        const merged = [];

        if (usersList && usersList.length > 0) {
            usersList.forEach(u => {
                if (u.email && !uniqueEmails.has(u.email.toLowerCase())) {
                    uniqueEmails.add(u.email.toLowerCase());
                    merged.push({
                        id: u.id,
                        nombre: u.nombre || u.nombreCompleto || u.email.split('@')[0],
                        email: u.email,
                        rol: u.rol || 'CIUDADANO'
                    });
                }
            });
        }

        defaultUsers.forEach(u => {
            if (!uniqueEmails.has(u.email.toLowerCase())) {
                uniqueEmails.add(u.email.toLowerCase());
                merged.push(u);
            }
        });

        return merged.map((u, index) => {
            const hash = u.id || index;
            const baseActions = 25 + (hash % 17) * 9 + (u.rol === 'ADMIN' ? 60 : u.rol === 'REFERENTE' ? 40 : 15);
            
            let breakdown = [0.4, 0.2, 0.2, 0.1, 0.1];
            if (u.rol === 'ADMIN') {
                breakdown = [0.15, 0.1, 0.2, 0.25, 0.3];
            } else if (u.rol === 'REFERENTE') {
                breakdown = [0.2, 0.2, 0.35, 0.2, 0.05];
            } else if (u.rol === 'COLABORADOR') {
                breakdown = [0.3, 0.25, 0.3, 0.15, 0.0];
            }

            const actions = {
                map: Math.round(baseActions * breakdown[0]),
                report: Math.round(baseActions * breakdown[1]),
                projects: Math.round(baseActions * breakdown[2]),
                chat: Math.round(baseActions * breakdown[3]),
                admin: Math.round(baseActions * breakdown[4])
            };
            
            const total = actions.map + actions.report + actions.projects + actions.chat + actions.admin;

            return {
                ...u,
                actions,
                total
            };
        }).sort((a, b) => b.total - a.total);
    };

    const activities = getActivities();
    const visibleActivities = viewAll ? activities : activities.slice(0, 5);

    return (
        <div className="admin-table" style={{ border: 'none', background: 'transparent' }}>
            <table style={{ width: '100%' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-100)' }}>
                        <th style={{ background: 'transparent', padding: '0.75rem 0.5rem', width: '50px' }}>Rank</th>
                        <th style={{ background: 'transparent', padding: '0.75rem 0.5rem' }}>Usuario</th>
                        <th style={{ background: 'transparent', padding: '0.75rem 0.5rem', textAlign: 'center', width: '80px' }}>Acciones</th>
                        <th style={{ background: 'transparent', padding: '0.75rem 0.5rem', width: '160px' }}>Frecuencia de Uso</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleActivities.map((user, idx) => {
                        const mapPct = user.total ? (user.actions.map / user.total) * 100 : 0;
                        const reportPct = user.total ? (user.actions.report / user.total) * 100 : 0;
                        const projectPct = user.total ? (user.actions.projects / user.total) * 100 : 0;
                        const chatPct = user.total ? (user.actions.chat / user.total) * 100 : 0;
                        const adminPct = user.total ? (user.actions.admin / user.total) * 100 : 0;

                        return (
                            <tr key={user.email} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: idx === 0 ? 'var(--accent-600)' : idx === 1 ? 'var(--primary-500)' : 'var(--gray-400)' }}>
                                    #{idx + 1}
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: user.rol === 'ADMIN' ? '#fee2e2' : user.rol === 'REFERENTE' ? '#fef3c7' : '#dbeafe',
                                            color: user.rol === 'ADMIN' ? '#b91c1c' : user.rol === 'REFERENTE' ? '#d97706' : '#2563eb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            flexShrink: 0
                                        }}>
                                            {user.nombre.substring(0, 2)}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.825rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nombre}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    {user.total}
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', width: '100%', background: 'var(--gray-100)' }}>
                                        {mapPct > 0 && <div style={{ width: `${mapPct}%`, background: 'var(--primary-500)' }} title={`Mapa: ${user.actions.map}`} />}
                                        {reportPct > 0 && <div style={{ width: `${reportPct}%`, background: 'var(--barrier-actitudinal)' }} title={`Reportar: ${user.actions.report}`} />}
                                        {projectPct > 0 && <div style={{ width: `${projectPct}%`, background: 'var(--status-iniciando)' }} title={`Proyectos: ${user.actions.projects}`} />}
                                        {chatPct > 0 && <div style={{ width: `${chatPct}%`, background: 'var(--barrier-comunicacional)' }} title={`Chat: ${user.actions.chat}`} />}
                                        {adminPct > 0 && <div style={{ width: `${adminPct}%`, background: 'var(--primary-700)' }} title={`Admin: ${user.actions.admin}`} />}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', fontSize: '7px', color: 'var(--gray-400)', marginTop: '4px', flexWrap: 'wrap' }}>
                                        <span>🔵 Mapa</span>
                                        <span>🟠 Reportes</span>
                                        <span>🟢 Proy</span>
                                        <span>🟣 Chat</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {activities.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewAll(!viewAll)}
                        style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    >
                        {viewAll ? 'Ver menos' : `Ver todos (${activities.length})`}
                    </button>
                </div>
            )}
        </div>
    );
}
