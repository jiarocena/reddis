import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import InteractiveMap from '../components/Map/InteractiveMap';
import Timeline from '../components/Project/Timeline';
import { CATEGORIES, PROJECT_STATUSES } from '../data/seedData';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Users, Handshake, Building, ChevronRight } from 'lucide-react';

export default function BarrierDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { barriers, projects, createProject, loading } = useData();
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimData, setClaimData] = useState({
        title: '',
        objective: '',
        leader: '',
        resources: '',
        needsHelp: false,
        helpDescription: '',
    });

    const barrier = barriers.find(b => String(b.id) === String(id));
    const project = projects.find(p => String(p.barrierId) === String(id));

    if (loading) {
        return (
            <div className="barrier-detail" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!barrier) {
        return (
            <div className="barrier-detail" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <h2>Barrera no encontrada</h2>
                <Link to="/mapa" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
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
            navigate(`/proyecto/${newProject.id}`);
        }
    };

    return (
        <div className="barrier-detail animate-fadeIn">
            <Link to="/mapa" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--gray-500)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
                <ArrowLeft size={16} /> Volver al mapa
            </Link>

            <div className="barrier-detail-header">
                <div className="barrier-detail-badges">
                    <span className={`badge badge-${barrier.category}`}>{category?.label}</span>
                    <span className={`badge badge-${barrier.status}`}>{status?.label}</span>
                    <span className={`badge badge-${barrier.type}`}>
                        {barrier.type === 'estructural' ? '🏛️ Estructural' : '👤 Individual'}
                    </span>
                    {barrier.urgency === 'alta' && (
                        <span className="badge badge-urgente"><AlertTriangle size={10} /> Urgente</span>
                    )}
                </div>
                <h1>{barrier.title}</h1>
            </div>

            {/* Info Grid */}
            <div className="barrier-detail-info">
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

            {/* Description */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-3)', color: 'var(--gray-800)' }}>
                    Descripción
                </h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>{barrier.description}</p>
            </div>

            {/* Map */}
            <div style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '250px', boxShadow: 'var(--shadow-md)' }}>
                <InteractiveMap barriers={[barrier]} compact />
            </div>

            {/* Project Link or Claim Button */}
            {project ? (
                <div className="card" style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)' }}>
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
                    <Link to={`/proyecto/${project.id}`} className="btn btn-primary btn-sm">
                        Ver proyecto <ChevronRight size={14} />
                    </Link>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                    <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--gray-800)' }}>
                        Esta barrera aún no tiene un proyecto asociado
                    </h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-sm)' }}>
                        ¿Tu institución u organización puede trabajar en esta barrera?
                    </p>
                    <button className="btn btn-accent btn-lg" onClick={() => setShowClaimModal(true)}>
                        <Handshake size={18} /> Trabajar en esto
                    </button>
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
                            <label className="form-label">¿Quién lidera este proyecto? *</label>
                            <input
                                className="form-input"
                                placeholder="Ej: Lic. María García - OSC Inclusión Flores"
                                value={claimData.leader}
                                onChange={e => setClaimData(prev => ({ ...prev, leader: e.target.value }))}
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
                            <label className="form-label">Recursos disponibles</label>
                            <input
                                className="form-input"
                                placeholder="Ej: Equipo técnico, financiamiento parcial..."
                                value={claimData.resources}
                                onChange={e => setClaimData(prev => ({ ...prev, resources: e.target.value }))}
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
                                disabled={!claimData.leader}
                                style={{ opacity: claimData.leader ? 1 : 0.5 }}
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
