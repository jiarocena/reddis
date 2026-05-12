import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { PlusCircle, MapPin, Users, CheckCircle, AlertTriangle, Zap, Eye, BookOpen } from 'lucide-react';

export default function HomePage() {
    const { stats } = useData();

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content animate-fadeInUp">
                        <h1>
                            <span className="highlight">Comunidad</span><br />
                            sin barreras
                        </h1>
                        <p>
                            REDDIS conecta a quienes identifican barreras con quienes pueden resolverlas.
                            Un ciclo virtuoso de identificación, acción, seguimiento y aprendizaje colectivo.
                        </p>
                        <div className="hero-actions">
                            <Link to="/barreras" className="btn btn-primary btn-lg">
                                <MapPin size={20} /> Explorar Mapa
                            </Link>
                            <Link to="/reportar" className="btn btn-secondary btn-lg">
                                <PlusCircle size={20} /> Reportar Barrera
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card animate-fadeInUp animate-delay-1">
                            <div className="stat-number">{stats.totalBarriers}</div>
                            <div className="stat-label">Barreras Reportadas</div>
                        </div>
                        <div className="stat-card animate-fadeInUp animate-delay-2">
                            <div className="stat-number">{stats.activeProjects}</div>
                            <div className="stat-label">Proyectos Activos</div>
                        </div>
                        <div className="stat-card animate-fadeInUp animate-delay-3">
                            <div className="stat-number">{stats.resolvedProjects}</div>
                            <div className="stat-label">Barreras Resueltas</div>
                        </div>
                        <div className="stat-card animate-fadeInUp animate-delay-4">
                            <div className="stat-number">{stats.totalCollaborators}</div>
                            <div className="stat-label">Actores Involucrados</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section" style={{ background: 'var(--gray-100)' }}>
                <div className="container text-center">
                    <h2 style={{ fontSize: 'var(--font-3xl)', color: 'var(--gray-900)', marginBottom: 'var(--space-3)' }}>
                        ¿Cómo funciona?
                    </h2>
                    <p style={{ color: 'var(--gray-500)', maxWidth: '600px', margin: '0 auto' }}>
                        Del problema a la solución en tres momentos conectados
                    </p>

                    <div className="steps-grid">
                        <div className="step-card step-1 animate-fadeInUp animate-delay-1">
                            <div className="step-icon" style={{ background: '#fef2f2' }}>
                                <AlertTriangle size={28} color="#ef4444" />
                            </div>
                            <div className="step-number">1</div>
                            <h3>Identificar</h3>
                            <p>
                                Cualquier persona reporta una barrera: accesibilidad física, comunicacional, actitudinal o institucional. La barrera queda visible en el mapa.
                            </p>
                        </div>

                        <div className="step-card step-2 animate-fadeInUp animate-delay-2">
                            <div className="step-icon" style={{ background: '#dbeafe' }}>
                                <Users size={28} color="#3b82f6" />
                            </div>
                            <div className="step-number">2</div>
                            <h3>Colaborar</h3>
                            <p>
                                Instituciones, organizaciones o personas se comprometen a trabajar en la resolución. Se forma un equipo y se abre a la colaboración.
                            </p>
                        </div>

                        <div className="step-card step-3 animate-fadeInUp animate-delay-3">
                            <div className="step-icon" style={{ background: '#d1fae5' }}>
                                <CheckCircle size={28} color="#10b981" />
                            </div>
                            <div className="step-number">3</div>
                            <h3>Resolver</h3>
                            <p>
                                El progreso se registra públicamente. La barrera se marca como resuelta y queda documentada como caso de éxito para futuras referencias.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section">
                <div className="container text-center">
                    <h2 style={{ fontSize: 'var(--font-3xl)', color: 'var(--gray-900)', marginBottom: 'var(--space-3)' }}>
                        Efectos virtuosos
                    </h2>
                    <p style={{ color: 'var(--gray-500)', maxWidth: '600px', margin: '0 auto var(--space-10)' }}>
                        Un ecosistema que se fortalece con cada participación
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
                        {[
                            { icon: <Zap size={24} />, title: 'Incentiva la identificación de la barrera', desc: 'Hay claridad de que será atendida' },
                            { icon: <Users size={24} />, title: 'Facilita la articulación', desc: 'Conecta necesidades con capacidades' },
                            { icon: <Eye size={24} />, title: 'Promueve transparencia', desc: 'Todo el proceso es visible' },
                            { icon: <BookOpen size={24} />, title: 'Acumula conocimiento', desc: 'Los casos resueltos son referencia' }
                        ].map((item, i) => (
                            <div key={i} className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                                    background: 'var(--primary-50)', color: 'var(--primary-500)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto var(--space-4)'
                                }}>
                                    {item.icon}
                                </div>
                                <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>{item.title}</h4>
                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
