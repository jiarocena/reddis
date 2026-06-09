import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, MapPin, Users, CheckCircle, AlertTriangle, Zap, Eye, BookOpen, User, Network } from 'lucide-react';
import Footer from '../components/Layout/Footer';

export default function HomePage() {
    const { stats } = useData();
    const { user, isAuthenticated } = useAuth();

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                {/* Glassmorphism decorative floating shapes */}
                <div className="hero-glass-shape hero-glass-shape-1" />
                <div className="hero-glass-shape hero-glass-shape-2" />
                <div className="hero-glass-shape hero-glass-shape-3" />
                <div className="hero-glass-shape hero-glass-shape-4" />

                <div className="container hero-container">
                    {/* Branding logo */}
                    <div className="hero-brand">
                        <div className="hero-brand-icon">
                            <svg viewBox="0 0 100 100" className="hero-logo-svg" style={{ width: '48px', height: '48px' }}>
                                <circle cx="50" cy="50" r="16" stroke="white" strokeWidth="5.5" fill="none" />
                                
                                {/* Left node */}
                                <line x1="34" y1="50" x2="18" y2="50" stroke="white" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="18" cy="50" r="6.5" fill="white" />
                                
                                {/* Top-Left node */}
                                <line x1="39" y1="39" x2="27" y2="27" stroke="white" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="27" cy="27" r="6.5" fill="white" />
                                
                                {/* Top node */}
                                <line x1="50" y1="34" x2="50" y2="18" stroke="white" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="50" cy="18" r="6.5" fill="white" />
                                
                                {/* Top-Right-ish white node */}
                                <line x1="61" y1="39" x2="73" y2="27" stroke="white" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="73" cy="27" r="6.5" fill="white" />
                                
                                {/* Top-Right double teal node */}
                                <line x1="65" y1="45" x2="79" y2="40" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" />
                                <line x1="79" y1="40" x2="89" y2="33" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="79" cy="40" r="6.5" fill="#14b8a6" />
                                <circle cx="89" cy="33" r="6.5" fill="#14b8a6" />
                                
                                {/* Bottom-Right node */}
                                <line x1="61" y1="61" x2="73" y2="73" stroke="white" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="73" cy="73" r="6.5" fill="white" />
                                
                                {/* Bottom node */}
                                <line x1="50" y1="66" x2="50" y2="82" stroke="white" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="50" cy="82" r="6.5" fill="white" />
                                
                                {/* Bottom-Left double teal node */}
                                <line x1="39" y1="61" x2="25" y2="75" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" />
                                <line x1="25" y1="75" x2="15" y2="85" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="25" cy="75" r="6.5" fill="#14b8a6" />
                                <circle cx="15" cy="85" r="6.5" fill="#14b8a6" />
                            </svg>
                        </div>
                        <div className="hero-brand-text">
                            <strong>REDDIS</strong>
                            <span>Red Digital de Inclusión Social</span>
                        </div>
                    </div>

                    <div className="hero-content animate-fadeInUp">
                        {isAuthenticated && user?.departamento && (
                            <Link to="/gestion/perfil" className="hero-user-pill">
                                <User size={14} />
                                <span>{user.nombre} — {user.departamento}</span>
                            </Link>
                        )}

                        <h1>
                            Comunidad<br />
                            sin barreras
                        </h1>
                        <p>
                            REDDIS conecta a quienes identifican barreras con quienes pueden resolverlas.
                        </p>
                        <div className="hero-actions">
                            <Link to="/reportar" className="btn btn-primary">
                                Reportar Barrera
                            </Link>
                            <Link to="/acerca" className="btn btn-secondary">
                                Cómo funciona
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section" style={{ background: 'var(--white)' }}>
                <div className="container text-center">
                    <h2 style={{ fontSize: 'var(--font-3xl)', color: 'var(--gray-900)', marginBottom: 'var(--space-3)' }}>
                        ¿Cómo funciona?
                    </h2>
                    <p style={{ color: 'var(--gray-500)', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
                        Del problema a la solución en cuatro momentos conectados
                    </p>

                    <div className="steps-grid">
                        <Link to="/barreras" className="step-card step-1 animate-fadeInUp animate-delay-1">
                            <div className="step-number">1</div>
                            <h3>Explorar Barreras</h3>
                            <p>
                                Visualizá las barreras de accesibilidad reportadas en el mapa, sus ubicaciones y el estado de sus proyectos de resolución para ver los avances.
                            </p>
                        </Link>

                        <Link to="/reportar" className="step-card step-2 animate-fadeInUp animate-delay-2">
                            <div className="step-number">2</div>
                            <h3>Identificar</h3>
                            <p>
                                Cualquier persona reporta una barrera: accesibilidad física, comunicacional, actitudinal o institucional. La barrera queda visible en el mapa.
                            </p>
                        </Link>

                        <Link to="/gestion/proyectos" className="step-card step-3 animate-fadeInUp animate-delay-3">
                            <div className="step-number">3</div>
                            <h3>Colaborar</h3>
                            <p>
                                Instituciones, organizaciones o personas se comprometen a trabajar en la resolución. Se forma un equipo y se abre a la colaboración.
                            </p>
                        </Link>

                        <Link to="/gestion/mis-proyectos" className="step-card step-4 animate-fadeInUp animate-delay-4">
                            <div className="step-number">4</div>
                            <h3>Resolver</h3>
                            <p>
                                El progreso se registra públicamente. La barrera se marca como resuelta y queda documentada como caso de éxito para futuras referencias.
                            </p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="section" style={{ background: 'var(--gray-100)', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
                <div className="container">
                    <div className="stats-grid" style={{ marginTop: 0, marginBottom: 0 }}>
                        <Link to="/barreras" className="stat-card animate-fadeInUp animate-delay-1" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div className="stat-number">{stats.totalBarriers}</div>
                            <div className="stat-label">Barreras Reportadas</div>
                        </Link>
                        <Link to="/gestion/proyectos" className="stat-card animate-fadeInUp animate-delay-2" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div className="stat-number">{stats.activeProjects}</div>
                            <div className="stat-label">Proyectos Activos</div>
                        </Link>
                        <Link to="/barreras?status=finalizado" className="stat-card animate-fadeInUp animate-delay-3" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div className="stat-number">{stats.resolvedProjects}</div>
                            <div className="stat-label">Barreras Resueltas</div>
                        </Link>
                        <div className="stat-card animate-fadeInUp animate-delay-4">
                            <div className="stat-number">{stats.totalCollaborators}</div>
                            <div className="stat-label">Actores Involucrados</div>
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

            <Footer />
        </div>
    );
}
