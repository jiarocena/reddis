import { Link } from 'react-router-dom';
import { Network, Target, MapPin, Users, Eye, BookOpen, PlusCircle } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="about-page">
            <div className="container">
                <h1>Acerca de <span className="text-gradient">REDDIS (piloto)</span></h1>

                <div className="about-content">
                    <p>
                        <strong>REDDIS (piloto)</strong> (Red Digital de Inclusión Social) es una plataforma digital colaborativa que busca
                        conectar a quienes identifican barreras con quienes pueden contribuir a eliminarlas, generando un ciclo
                        virtuoso de identificación, acción, seguimiento y aprendizaje colectivo.
                    </p>

                    <p>
                        La idea es crear un espacio común donde las barreras a la inclusión de personas con discapacidad sean
                        visibles, donde los compromisos de acción sean públicos, y donde los avances se puedan seguir en tiempo real.
                    </p>

                    <h2><Target size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Objetivo</h2>
                    <p>
                        Construir un sistema participativo de identificación, priorización y resolución de barreras a la inclusión
                        de personas con discapacidad, comenzando con una experiencia piloto en distintas localidades del país.
                    </p>

                    <h2><Network size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Componentes</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
                        {[
                            { icon: <PlusCircle size={20} />, title: 'Registro de Barreras', desc: 'Cualquier persona puede reportar barreras estructurales o necesidades individuales.' },
                            { icon: <MapPin size={20} />, title: 'Mapeo Territorial', desc: 'Barreras geolocalizadas en un mapa interactivo del departamento.' },
                            { icon: <Users size={20} />, title: 'Proyectos Colaborativos', desc: 'Las barreras se transforman en proyectos con equipos de trabajo visibles.' },
                            { icon: <Eye size={20} />, title: 'Seguimiento Transparente', desc: 'Estado de cada proyecto, hitos y resultados accesibles para todos.' },
                        ].map((item, i) => (
                            <div key={i} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ color: 'var(--primary-500)', marginBottom: '0.75rem' }}>{item.icon}</div>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>{item.title}</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <h2><BookOpen size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Tipos de Barreras</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
                        <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '0.75rem', borderLeft: '4px solid #ef4444' }}>
                            <strong style={{ fontSize: '0.875rem' }}>Física</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: '0.25rem 0 0' }}>Accesibilidad de edificios, veredas, transporte</p>
                        </div>
                        <div style={{ padding: '1rem', background: '#f5f3ff', borderRadius: '0.75rem', borderLeft: '4px solid #8b5cf6' }}>
                            <strong style={{ fontSize: '0.875rem' }}>Comunicacional</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: '0.25rem 0 0' }}>LSU, braille, formatos accesibles</p>
                        </div>
                        <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '0.75rem', borderLeft: '4px solid #f97316' }}>
                            <strong style={{ fontSize: '0.875rem' }}>Actitudinal</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: '0.25rem 0 0' }}>Discriminación, prejuicios, exclusión</p>
                        </div>
                        <div style={{ padding: '1rem', background: '#ecfeff', borderRadius: '0.75rem', borderLeft: '4px solid #06b6d4' }}>
                            <strong style={{ fontSize: '0.875rem' }}>Institucional</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: '0.25rem 0 0' }}>Normativas, procedimientos, protocolos</p>
                        </div>
                    </div>

                    <p style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <Link to="/reportar" className="btn btn-primary btn-lg">
                            <PlusCircle size={18} /> Comenzá reportando una barrera
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
