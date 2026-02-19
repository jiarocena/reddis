import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CATEGORIES, PROJECT_STATUSES } from '../data/seedData';
import { Shield, BarChart3, AlertTriangle, CheckCircle, Clock, Users, RefreshCw, Eye, Download } from 'lucide-react';

export default function AdminPage() {
    const { barriers, projects, stats, resetData } = useData();

    const barriersByCategory = Object.entries(CATEGORIES).map(([key, cat]) => ({
        ...cat, key, count: barriers.filter(b => b.category === key).length
    }));

    const barriersByStatus = Object.entries(PROJECT_STATUSES).map(([key, st]) => ({
        ...st, key, count: barriers.filter(b => b.status === key).length
    }));

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1><Shield size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Panel de Administración</h1>
                            <p style={{ color: 'var(--gray-500)' }}>INADIS - Equipo de Planificación</p>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={resetData}>
                            <RefreshCw size={14} /> Reiniciar datos demo
                        </button>
                    </div>
                </div>

                {/* Stats */}
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

                {/* Distribution */}
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

                {/* Barriers table */}
                <div className="admin-table">
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Todas las barreras</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Barrera</th>
                                <th>Categoría</th>
                                <th>Estado</th>
                                <th>Urgencia</th>
                                <th>Fecha</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {barriers.map(b => (
                                <tr key={b.id}>
                                    <td style={{ maxWidth: '250px' }}>
                                        <strong style={{ fontSize: '0.8rem', display: 'block' }}>{b.title}</strong>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{b.address}</span>
                                    </td>
                                    <td><span className={`badge badge-${b.category}`}>{CATEGORIES[b.category]?.label}</span></td>
                                    <td><span className={`badge badge-${b.status}`}>{PROJECT_STATUSES[b.status]?.label || b.status}</span></td>
                                    <td>{b.urgency === 'alta' ? <span className="badge badge-urgente">Alta</span> : <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{b.urgency}</span>}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{b.date}</td>
                                    <td><Link to={`/barrera/${b.id}`} className="btn btn-secondary btn-sm"><Eye size={12} /></Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
