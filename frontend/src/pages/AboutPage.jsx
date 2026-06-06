import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Network, Target, MapPin, Users, CheckCircle, HelpCircle, 
    PlusCircle, Play, Pause, ChevronRight, ChevronLeft, ArrowRight,
    MessageSquare, Settings, Sparkles
} from 'lucide-react';

const STEPS = [
    {
        title: "El Propósito",
        subtitle: "REDDIS: Red Digital de Inclusión Social",
        desc: "Nuestro gran objetivo es construir un espacio participativo y transparente donde las barreras a la inclusión de personas con discapacidad sean visibles, los compromisos de acción sean públicos, y la resolución se logre mediante la cooperación colectiva.",
        icon: <Target size={32} />,
        color: "var(--primary-500)",
        bg: "linear-gradient(135deg, rgba(45, 90, 184, 0.05), rgba(45, 90, 184, 0.15))",
        animationClass: "anim-nodos"
    },
    {
        title: "1. Identificar",
        subtitle: "Registrar y Geolocalizar la Barrera",
        desc: "Cualquier persona puede registrar y reportar una barrera física, comunicacional, actitudinal o institucional desde su dispositivo móvil. La barrera queda geolocalizada e identificada públicamente en el mapa departamental.",
        icon: <MapPin size={32} />,
        color: "var(--barrier-fisica)",
        bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.15))",
        animationClass: "anim-reportar"
    },
    {
        title: "2. Organizar",
        subtitle: "Creación de Proyectos de Resolución",
        desc: "Los referentes departamentales evalúan cada reporte y crean proyectos públicos orientados a su resolución, asignándoles objetivos claros, líderes de equipo y definiendo las acciones previstas.",
        icon: <Settings size={32} />,
        color: "var(--accent-500)",
        bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.15))",
        animationClass: "anim-organizar"
    },
    {
        title: "3. Colaborar",
        subtitle: "Trabajo en Equipo y Coordinación",
        desc: "Los ciudadanos y organizaciones se postulan para colaborar. Una vez incorporados al proyecto, pueden conversar y coordinar acciones en el chat integrado en tiempo real y registrar los avances en la línea de tiempo.",
        icon: <Users size={32} />,
        color: "var(--primary-400)",
        bg: "linear-gradient(135deg, rgba(74, 125, 224, 0.05), rgba(74, 125, 224, 0.15))",
        animationClass: "anim-colaborar"
    },
    {
        title: "4. Resolver",
        subtitle: "Impacto y Barreras Eliminadas",
        desc: "Al completarse las acciones, la barrera se marca como resuelta. El caso se documenta públicamente para servir de referencia de éxito a futuros proyectos, y las estadísticas globales se incrementan de inmediato.",
        icon: <CheckCircle size={32} />,
        color: "var(--success-500)",
        bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.15))",
        animationClass: "anim-resolver"
    }
];

export default function AboutPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % STEPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleNext = () => {
        setIsPlaying(false);
        setCurrentStep(prev => (prev + 1) % STEPS.length);
    };

    const handlePrev = () => {
        setIsPlaying(false);
        setCurrentStep(prev => (prev - 1 + STEPS.length) % STEPS.length);
    };

    const handleStepSelect = (idx) => {
        setIsPlaying(false);
        setCurrentStep(idx);
    };

    const step = STEPS[currentStep];

    return (
        <div className="about-page animate-fadeIn" style={{ minHeight: 'calc(100vh - 120px)', padding: 'var(--space-6) 0 var(--space-12)' }}>
            <div className="container" style={{ maxWidth: '850px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 8px' }}>
                        ¿Cómo funciona <span className="text-gradient">REDDIS</span>?
                    </h1>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)', margin: 0 }}>
                        Descubrí los objetivos y el ciclo colaborativo de resolución de barreras.
                    </p>
                </div>

                {/* Progress Indicators */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    gap: '8px', 
                    marginBottom: 'var(--space-8)',
                    background: 'var(--gray-100)',
                    padding: '6px',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--gray-200)'
                }}>
                    {STEPS.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleStepSelect(idx)}
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                borderRadius: 'var(--radius-lg)',
                                border: 'none',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                transition: 'all 0.25s',
                                cursor: 'pointer',
                                background: currentStep === idx ? 'var(--white)' : 'transparent',
                                color: currentStep === idx ? s.color : 'var(--gray-500)',
                                boxShadow: currentStep === idx ? 'var(--shadow-sm)' : 'none',
                                outline: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '50%',
                                background: currentStep === idx ? s.bg : 'transparent',
                                fontSize: '0.75rem'
                            }}>
                                {idx === 0 ? "★" : idx}
                            </span>
                            <span className="hide-mobile">{s.title}</span>
                        </button>
                    ))}
                </div>

                {/* Main Card with Split layout */}
                <div className="card" style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    boxShadow: 'var(--shadow-xl)', 
                    borderRadius: 'var(--radius-2xl)',
                    border: '1px solid var(--gray-200)',
                    background: 'var(--white)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '440px'
                }}>
                    {/* Upper part: Dynamic Animated Illustration Box */}
                    <div style={{ 
                        height: '220px', 
                        background: step.bg, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        position: 'relative',
                        borderBottom: '1px solid var(--gray-100)',
                        overflow: 'hidden',
                        transition: 'background 0.5s ease'
                    }}>
                        <div style={{ position: 'absolute', top: '16px', right: '16px', color: step.color }}>
                            {step.icon}
                        </div>

                        {/* STEP 1 ANIMATION: Network nodes */}
                        {currentStep === 0 && (
                            <div className="anim-box-nodes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '260px', height: '180px' }}>
                                <div className="pulse-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                    <Network size={20} />
                                </div>
                                <div className="node-orbit node-o1" style={{ position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>U</div>
                                <div className="node-orbit node-o2" style={{ position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>R</div>
                                <div className="node-orbit node-o3" style={{ position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>C</div>
                                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
                                    <line className="line-conn1" x1="130" y1="90" x2="60" y2="40" stroke="var(--primary-200)" strokeWidth="2" strokeDasharray="5" />
                                    <line className="line-conn2" x1="130" y1="90" x2="200" y2="60" stroke="var(--primary-200)" strokeWidth="2" strokeDasharray="5" />
                                    <line className="line-conn3" x1="130" y1="90" x2="110" y2="150" stroke="var(--primary-200)" strokeWidth="2" strokeDasharray="5" />
                                </svg>
                            </div>
                        )}

                        {/* STEP 2 ANIMATION: Report / pin bouncing on map */}
                        {currentStep === 1 && (
                            <div className="anim-box-report" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '220px', height: '180px', position: 'relative' }}>
                                <div className="mock-map-bg" style={{ width: '100%', height: '80px', background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--gray-300)', position: 'absolute', bottom: '20px', display: 'flex', flexWrap: 'wrap', overflow: 'hidden', opacity: 0.8 }}>
                                    <div style={{ width: '25%', height: '100%', borderRight: '1px solid var(--gray-200)' }} />
                                    <div style={{ width: '25%', height: '100%', borderRight: '1px solid var(--gray-200)' }} />
                                    <div style={{ width: '25%', height: '100%', borderRight: '1px solid var(--gray-200)' }} />
                                    <div style={{ width: '100%', height: '2px', background: 'var(--gray-200)', position: 'absolute', top: '40px' }} />
                                </div>
                                <div className="bouncing-pin" style={{ color: 'var(--barrier-fisica)', zIndex: 10, position: 'absolute', bottom: '45px' }}>
                                    <MapPin size={48} fill="rgba(239, 68, 68, 0.2)" />
                                    <div className="pin-radar" />
                                </div>
                            </div>
                        )}

                        {/* STEP 3 ANIMATION: Project / Gears spinning */}
                        {currentStep === 2 && (
                            <div className="anim-box-organize" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '200px', height: '180px', position: 'relative' }}>
                                <div className="mock-clipboard" style={{ width: '100px', height: '130px', background: 'white', borderRadius: 'var(--radius-md)', border: '2px solid var(--gray-300)', boxShadow: 'var(--shadow-sm)', padding: '16px 8px 8px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5 }}>
                                    <div style={{ width: '40px', height: '8px', background: 'var(--accent-300)', borderRadius: '4px' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-500)' }} />
                                        <div style={{ width: '30px', height: '6px', background: 'var(--gray-200)', borderRadius: '3px' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-500)' }} />
                                        <div style={{ width: '40px', height: '6px', background: 'var(--gray-200)', borderRadius: '3px' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gray-300)' }} />
                                        <div style={{ width: '35px', height: '6px', background: 'var(--gray-200)', borderRadius: '3px' }} />
                                    </div>
                                </div>
                                <div className="gear-icon gear-large" style={{ color: 'var(--accent-500)', position: 'absolute', top: '25px', right: '35px', zIndex: 10 }}>
                                    <Settings size={36} />
                                </div>
                                <div className="gear-icon gear-small" style={{ color: 'var(--accent-400)', position: 'absolute', top: '65px', right: '20px', zIndex: 10 }}>
                                    <Settings size={24} />
                                </div>
                            </div>
                        )}

                        {/* STEP 4 ANIMATION: Collaboration / Chat bubbles */}
                        {currentStep === 3 && (
                            <div className="anim-box-collab" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '260px', height: '180px', justifyContent: 'center', padding: '10px' }}>
                                <div className="chat-bubble cb-left" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '12px 12px 12px 0', padding: '8px 12px', fontSize: '0.72rem', alignSelf: 'flex-start', maxWidth: '200px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)' }}>
                                    <MessageSquare size={12} color="var(--primary-400)" />
                                    <span>¿Cómo coordinamos las veredas?</span>
                                </div>
                                <div className="chat-bubble cb-right" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: '12px 12px 0 12px', padding: '8px 12px', fontSize: '0.72rem', alignSelf: 'flex-end', maxWidth: '200px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)' }}>
                                    <span>Yo consigo las rampas de madera.</span>
                                    <CheckCircle size={12} color="var(--success-500)" />
                                </div>
                                
                                <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: '4px', marginTop: '10px', overflow: 'hidden', position: 'relative' }}>
                                    <div className="collab-progress-bar" style={{ height: '100%', background: 'var(--primary-500)', width: '65%' }} />
                                </div>
                            </div>
                        )}

                        {/* STEP 5 ANIMATION: Resolved / Confetti / Success */}
                        {currentStep === 4 && (
                            <div className="anim-box-resolved" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '220px', height: '180px', position: 'relative' }}>
                                <div className="success-pulse" style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'var(--success-50)', border: '2px solid var(--success-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-600)', zIndex: 10 }}>
                                    <CheckCircle size={44} />
                                </div>
                                <div className="confetti c1" />
                                <div className="confetti c2" />
                                <div className="confetti c3" />
                                <div className="confetti c4" />
                                <div className="sparkle s1" style={{ position: 'absolute', top: '30px', left: '40px', color: 'var(--accent-400)' }}><Sparkles size={16} /></div>
                                <div className="sparkle s2" style={{ position: 'absolute', bottom: '30px', right: '40px', color: 'var(--accent-400)' }}><Sparkles size={16} /></div>
                            </div>
                        )}
                    </div>

                    {/* Lower part: Info & Text Section */}
                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                            <span style={{ 
                                display: 'inline-block',
                                padding: '4px 10px', 
                                background: step.bg, 
                                color: step.color, 
                                borderRadius: 'var(--radius-full)', 
                                fontSize: '0.72rem', 
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em',
                                marginBottom: '0.5rem'
                            }}>
                                {step.title}
                            </span>
                            <h2 style={{ fontSize: '1.25rem', color: 'var(--gray-900)', margin: '0 0 10px', fontWeight: 700 }}>
                                {step.subtitle}
                            </h2>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)', margin: 0, lineHeight: 1.6 }}>
                                {step.desc}
                            </p>
                        </div>

                        {/* Navigation controls */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            paddingTop: '1rem', 
                            borderTop: '1px solid var(--gray-100)' 
                        }}>
                            {/* Autoplay button */}
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--gray-600)',
                                    padding: '6px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--gray-200)',
                                    background: 'var(--gray-50)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                            >
                                {isPlaying ? (
                                    <>
                                        <Pause size={14} /> Pausar tour
                                    </>
                                ) : (
                                    <>
                                        <Play size={14} /> Reproducir
                                    </>
                                )}
                            </button>

                            {/* Arrow buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handlePrev}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: '1px solid var(--gray-200)',
                                        background: 'var(--white)',
                                        color: 'var(--gray-600)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        outline: 'none'
                                    }}
                                    aria-label="Anterior diapositiva"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: '1px solid var(--gray-200)',
                                        background: 'var(--white)',
                                        color: 'var(--gray-600)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        outline: 'none'
                                    }}
                                    aria-label="Siguiente diapositiva"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to action */}
                <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
                    <Link to="/reportar" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        Comenzar a reportar <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
