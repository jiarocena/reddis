import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CATEGORIES, PROJECT_STATUSES } from '../data/seedData';
import {
    Shield, BarChart3, AlertTriangle, CheckCircle, Users,
    RefreshCw, Eye, Search, Filter, Trash2, MailCheck, Briefcase
} from 'lucide-react';
import * as api from '../api/api';

export default function AdminPage() {
    const { barriers, projects, stats, resetData, deleteBarrier, deleteProject, backendAvailable, showToast } = useData();

    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'barriers' | 'projects' | 'users'

    // Lists and filters
    const [barrierSearch, setBarrierSearch] = useState('');
    const [barrierCategory, setBarrierCategory] = useState('todas');

    const [projectSearch, setProjectSearch] = useState('');
    const [projectStatus, setProjectStatus] = useState('todos');

    const [userSearch, setUserSearch] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

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
        if (activeTab === 'users') {
            loadUsers();
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
                        Barreras ({barriers.length})
                    </button>
                    <button className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
                        <Briefcase size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Proyectos ({projects.length})
                    </button>
                    <button className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        Usuarios ({usersList.length || '...'})
                    </button>
                </div>

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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
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
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Cargando usuarios...</div>
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
            </div>
        </div>
    );
}
