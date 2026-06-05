import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import InteractiveMap from '../components/Map/InteractiveMap';
import Timeline from '../components/Project/Timeline';
import { CATEGORIES, PROJECT_STATUSES } from '../data/seedData';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Users, Handshake, Building, ChevronRight } from 'lucide-react';

export default function BarrierDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { barriers, projects, createProject, loading } = useData();
    const { isAuthenticated, hasRole } = useAuth();
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');
    const prefix = isGestion ? '/gestion' : '';

    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimData, setClaimData] = useState({
        title: '',
        objective: '',
        needsHelp: false,
        helpDescription: '',
    });

    const barrier = barriers.find(b => String(b.id) === String(id));
    const project = projects.find(p => String(p.barrierId) === String(id));

    // Can work on this barrier: must be in gestion mode + logged in + correct role
    const canWork = isGestion && isAuthenticated && (hasRole('COLABORADOR') || hasRole('REFERENTE') || hasRole('ADMIN'));

    if (loading) {
        return (
            <div className="barrier-detail animate-fadeIn" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', margin: '2rem 0' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando barrera...</p>
            </div>
        );
    }

    if (!barrier) {
        return (
            <div className="barrier-detail" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <h2>Barrera no encontrada</h2>
                <Link to={`${prefix}/barreras`} className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                    Volver al mapa
                </Link>
            </div>
        );
    }

    const category = CATEGORIES[barrier.category];
    const status = PROJECT_STATUSES[barrier.status];

    const handleClaim = async () => {
        const projectData = {
            ...claimData,
            title: claimData.title || barrier.title,
            description: barrier.description,
        };
        const newProject = await createProject(barrier.id, projectData);
        setShowClaimModal(false);
        if (newProject) {
            navigate(`${prefix}/proyecto/${newProject.id}`);
        }
    };

    return (
        <div className="barrier-detail animate-fadeIn">
            <Link to={`${prefix}/barreras`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--gray-500)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
                <ArrowLeft size={16} /> Volver al mapa
            </Link>

            <div className="barrier-detail-header">
                <div className="barrier-detail-badges">
                    <span className={`badge badge-${barrier.category}`}>{category?.label}</span>
                    <span className={`badge badge-${barrier.status}`}>{status?.label}</span>
                    {barrier.urgency === 'alta' && (
                        <span className="badge badge-urgente"><AlertTriangle size={10} /> Urgente</span>
                    )}
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--gray-900)', margin: '0.25rem 0', lineHeight: 1.3 }}>{barrier.title}</h1>
            </div>

            {/* ═══ PROJECT / CLAIM — AT THE TOP for staff ═══ */}
            {project ? (
                <div className="card" style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)', marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', color: 'var(--primary-700)' }}>
                        <Handshake size={20} /> Proyecto en curso
                    </h3>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-sm)' }}>
                        {project.title}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                        <span className={`badge badge-${project.status}`}>
                            {PROJECT_STATUSES[project.status]?.label}
                        </span>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)' }}>
                            {project.collaborators.length} colaboradores
                        </span>
                    </div>
                    <Link to={`${prefix}/proyecto/${project.id}`} className="btn btn-primary btn-sm">
                        Ver proyecto <ChevronRight size={14} />
                    </Link>
                </div>
            ) : canWork ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', background: 'var(--accent-50)', borderColor: 'var(--accent-200)' }}>
                    <h3 style={{ marginBottom: 'var(--space-2)', color: 'var(--gray-800)', fontSize: 'var(--font-base)' }}>
                        Esta barrera aún no tiene un proyecto asociado
                    </h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-sm)' }}>
                        ¿Tu institución u organización puede trabajar en esta barrera?
                    </p>
                    <button className="btn btn-accent" onClick={() => setShowClaimModal(true)}>
                        <Handshake size={18} /> Trabajar en esto
                    </button>
                </div>
            ) : null}

            {/* Info Grid Card */}
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <div className="barrier-detail-info" style={{ marginBottom: 0 }}>
                    <div className="info-item">
                        <label><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Ubicación</label>
                        <span>{barrier.address}</span>
                    </div>
                    <div className="info-item">
                        <label><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Fecha de reporte</label>
                        <span>{barrier.date}</span>
                    </div>
                    <div className="info-item">
                        <label><Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Personas afectadas</label>
                        <span>{barrier.affectedPeople}</span>
                    </div>
                    <div className="info-item">
                        <label>Reportado por</label>
                        <span>{barrier.reportedBy}</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-3)', color: 'var(--gray-800)' }}>
                    Descripción
                </h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>{barrier.description}</p>
            </div>

            {/* Photo */}
            {barrier.photoBase64 && (
                <div style={{ marginBottom: 'var(--space-8)' }}>
                    <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-3)', color: 'var(--gray-800)' }}>
                        Foto
                    </h3>
                    <img src={barrier.photoBase64} alt="Foto de la barrera" style={{ maxWidth: '100%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }} />
                </div>
            )}

            {/* Map */}
            {barrier.location && barrier.location.lat !== null && barrier.location.lat !== undefined && barrier.location.lng !== null && barrier.location.lng !== undefined && !isNaN(Number(barrier.location.lat)) && !isNaN(Number(barrier.location.lng)) ? (
                <div style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '250px', boxShadow: 'var(--shadow-md)' }}>
                    <InteractiveMap barriers={[barrier]} compact />
                </div>
            ) : (
                <div style={{
                    marginBottom: 'var(--space-8)',
                    borderRadius: 'var(--radius-xl)',
                    height: '250px',
                    boxShadow: 'var(--shadow-md)',
                    background: 'var(--gray-50)',
                    border: '1px dashed var(--gray-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gray-400)',
                    gap: 'var(--space-2)'
                }}>
                    <MapPin size={32} />
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>Ubicación geográfica no disponible en el mapa</span>
                </div>
            )}

            {/* Claim Modal */}
            {showClaimModal && (
                <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Comprometerse con esta barrera</h2>
                        <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-sm)' }}>
                            Al comprometerte, esta barrera se transforma en un proyecto colaborativo visible para todos.
                        </p>

                        <div className="form-group">
                            <label className="form-label">Título del proyecto</label>
                            <input
                                className="form-input"
                                placeholder={barrier.title}
                                value={claimData.title}
                                onChange={e => setClaimData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Objetivo</label>
                            <textarea
                                className="form-textarea"
                                placeholder="¿Qué se proponen lograr?"
                                value={claimData.objective}
                                onChange={e => setClaimData(prev => ({ ...prev, objective: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={claimData.needsHelp}
                                    onChange={e => setClaimData(prev => ({ ...prev, needsHelp: e.target.checked }))}
                                />
                                <span className="form-label" style={{ margin: 0 }}>Necesitamos colaboración de otros actores</span>
                            </label>
                        </div>

                        {claimData.needsHelp && (
                            <div className="form-group">
                                <label className="form-label">¿Qué tipo de ayuda necesitan?</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Describí qué recursos o apoyo necesitan..."
                                    value={claimData.helpDescription}
                                    onChange={e => setClaimData(prev => ({ ...prev, helpDescription: e.target.value }))}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                            <button className="btn btn-secondary" onClick={() => setShowClaimModal(false)}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={handleClaim}
                            >
                                <Handshake size={16} /> Crear Proyecto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
