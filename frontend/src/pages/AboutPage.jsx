import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Play, Pause, RotateCcw, ArrowRight,
    MapPin, Users, CheckCircle, MessageSquare, Settings, 
    Sparkles, PlusCircle, Shield, Network, Info, Smartphone, Film,
    ChevronRight, ArrowLeft, Camera, X, Handshake, AlertTriangle, BookOpen
} from 'lucide-react';

const TOTAL_DURATION = 100; // Explainer duration in seconds (20s per scene)

const NARRATOR_TRANSCRIPTS = [
    { 
        start: 0, 
        end: 20, 
        text: "Te damos la bienvenida a REDDIS, la Red Digital de Inclusión Social. Una plataforma diseñada para conectar a ciudadanos con referentes departamentales y organizaciones, con un único fin: identificar, visibilizar y resolver las barreras de accesibilidad que limitan la inclusión de personas con discapacidad en nuestro entorno. En este video interactivo te mostramos cómo funciona paso a paso." 
    },
    { 
        start: 20, 
        end: 40, 
        text: "Paso 1: Identificación Ciudadana. Cuando encontrás una barrera de accesibilidad, ingresás a 'Reportar'. Primero seleccionás la categoría (Física, Comunicacional, etc.) y luego ingresás los detalles como el título y la descripción detallada. Finalmente, seleccionás la ubicación real en el mapa, adjuntás una foto de la barrera y enviás el reporte para su revisión." 
    },
    { 
        start: 40, 
        end: 60, 
        text: "Paso 2: Evaluación y Organización. El referente departamental recibe tu reporte en su 'Panel de Gestión' bajo la pestaña 'Identificación de barreras'. Revisa la solicitud y, si es válida, la aprueba. Luego, desde la ficha de la barrera aprobada en el mapa, crea el 'Proyecto de Resolución' asociándole una organización líder." 
    },
    { 
        start: 60, 
        end: 80, 
        text: "Paso 3: Colaboración Comunitaria. Una vez que se crea el proyecto, cualquier colaborador puede ingresar a la ficha y sumarse de forma inmediata ingresando su organización. Esto le da acceso automático al chat en tiempo real del proyecto, donde el equipo se organiza, coordina materiales y planifica las jornadas." 
    },
    { 
        start: 80, 
        end: 100, 
        text: "Paso 4: Resolver e Impactar. En la pestaña 'Ejecución' del proyecto, el equipo sigue el checklist de tareas. Cuando se completan las acciones de resolución de la barrera física, el referente marca el proyecto como Resuelto. El estado global se actualiza a Finalizado, la barrera en el mapa cambia a verde y se guarda como caso de éxito." 
    }
];

export default function AboutPage() {
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setTime(prev => {
                    if (prev >= TOTAL_DURATION) {
                        return 0; // Loop back
                    }
                    return Math.min(prev + 0.1, TOTAL_DURATION);
                });
            }, 100);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setTime(0);
        setIsPlaying(true);
    };

    // Find current narrator text
    const currentTranscript = NARRATOR_TRANSCRIPTS.find(t => time >= t.start && time < t.end)?.text || "";

    // Determine current scene index (0 to 4)
    const currentScene = Math.min(Math.floor(time / 20), 4);
    const sceneTitles = [
        "Introducción",
        "1. Reportar Barrera",
        "2. Evaluar y Organizar",
        "3. Colaborar en Chat",
        "4. Resolver Barrera"
    ];

    // Helper to calculate text typing effect in the mockup form
    const getTypedText = (fullText, startTime, duration) => {
        if (time < startTime) return "";
        if (time >= startTime + duration) return fullText;
        const progress = (time - startTime) / duration;
        const charCount = Math.floor(fullText.length * progress);
        return fullText.substring(0, charCount);
    };

    // Calculate cursor positions dynamically based on time to simulate click interactions
    const getCursorStyle = () => {
        let left = -100;
        let top = -100;
        let opacity = 0;
        let scale = 1;
        let transition = "none";

        // Scene 1: Reportar Barrera (20s - 40s)
        // 20.5s to 21.8s: moves to category card "Física" (75, 115)
        if (time >= 20.5 && time < 21.8) {
            const t = (time - 20.5) / 1.3;
            left = 130 - (130 - 75) * t;
            top = 220 - (220 - 115) * t;
            opacity = 1;
        } else if (time >= 21.8 && time < 22.4) {
            left = 75;
            top = 115;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }
        // 22.4s to 23.4s: moves to "Siguiente" button (130, 245)
        else if (time >= 22.4 && time < 23.4) {
            const t = (time - 22.4) / 1.0;
            left = 75 + (130 - 75) * t;
            top = 115 + (245 - 115) * t;
            opacity = 1;
        } else if (time >= 23.4 && time < 24.0) {
            left = 130;
            top = 245;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }
        // 32.2s to 33.6s: moves to "Enviar Reporte" button (110, 245)
        else if (time >= 32.2 && time < 33.6) {
            const t = (time - 32.2) / 1.4;
            left = 80 + (110 - 80) * t;
            top = 180 + (245 - 180) * t;
            opacity = 1;
        } else if (time >= 33.6 && time < 34.2) {
            left = 110;
            top = 245;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }
        // 37.8s to 39.0s: moves to Success modal CTA button (85, 195)
        else if (time >= 37.8 && time < 39.0) {
            const t = (time - 37.8) / 1.2;
            left = 110 - (110 - 85) * t;
            top = 245 - (245 - 195) * t;
            opacity = 1;
        } else if (time >= 39.0 && time < 39.6) {
            left = 85;
            top = 195;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }

        // Scene 2: Evaluar y Organizar (40s - 60s)
        // 43.5s to 45.0s: moves to "Aprobar" button (50, 180)
        else if (time >= 43.5 && time < 45.0) {
            const t = (time - 43.5) / 1.5;
            left = 140 - (140 - 50) * t;
            top = 240 - (240 - 180) * t;
            opacity = 1;
        } else if (time >= 45.0 && time < 45.6) {
            left = 50;
            top = 180;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }
        // 48.5s to 50.0s: moves to "Trabajar en esto" button (85, 150)
        else if (time >= 48.5 && time < 50.0) {
            const t = (time - 48.5) / 1.5;
            left = 50 + (85 - 50) * t;
            top = 180 - (180 - 150) * t;
            opacity = 1;
        } else if (time >= 50.0 && time < 50.6) {
            left = 85;
            top = 150;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }
        // 53.5s to 55.0s: moves to "Confirmar" in claim Modal (85, 205)
        else if (time >= 53.5 && time < 55.0) {
            const t = (time - 53.5) / 1.5;
            left = 85;
            top = 150 + (205 - 150) * t;
            opacity = 1;
        } else if (time >= 55.0 && time < 55.6) {
            left = 85;
            top = 205;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }

        // Scene 3: Colaborar en Chat (60s - 80s)
        // 62.0s to 63.5s: moves to "Postularse para colaborar" button (85, 235)
        else if (time >= 62.0 && time < 63.5) {
            const t = (time - 62.0) / 1.5;
            left = 130 - (130 - 85) * t;
            top = 120 + (235 - 120) * t;
            opacity = 1;
        } else if (time >= 63.5 && time < 64.1) {
            left = 85;
            top = 235;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }
        // 67.5s to 69.0s: moves to "chat" tab pill (135, 75)
        else if (time >= 67.5 && time < 69.0) {
            const t = (time - 67.5) / 1.5;
            left = 85 + (135 - 85) * t;
            top = 235 - (235 - 75) * t;
            opacity = 1;
        } else if (time >= 69.0 && time < 69.6) {
            left = 135;
            top = 75;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }

        // Scene 4: Resolver Barrera (80s - 100s)
        // 86.2s to 87.8s: moves to "Marcar como Resuelto" button (85, 120)
        else if (time >= 86.2 && time < 87.8) {
            const t = (time - 86.2) / 1.6;
            left = 135 - (135 - 85) * t;
            top = 75 + (120 - 75) * t;
            opacity = 1;
        } else if (time >= 87.8 && time < 88.4) {
            left = 85;
            top = 120;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }

        return {
            position: 'absolute',
            left: `${left}px`,
            top: `${top}px`,
            opacity: opacity,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transition: transition,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.85)',
            border: '2px solid white',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            zIndex: 999,
            pointerEvents: 'none'
        };
    };

    // Helper to render the interactive UI matching the REAL screens of REDDIS
    const renderPhoneScreen = () => {
        // Scene 0: Introduction (0s - 20s)
        if (time >= 0 && time < 20) {
            return (
                <div style={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #1e3a8a, #0d9488)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px',
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <div className="v-logo-float" style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    }}>
                        <Network size={32} color="var(--accent-400)" />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>REDDIS</h2>
                    <p style={{ fontSize: '0.62rem', opacity: 0.9, lineHeight: 1.3, maxWidth: '160px' }}>
                        Red Digital de Inclusión Social
                    </p>
                    <div style={{
                        position: 'absolute',
                        bottom: '24px',
                        fontSize: '0.52rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)'
                    }}>
                        Piloto Uruguay
                    </div>
                </div>
            );
        }

        // Scene 1: Reportar Barrera (20s - 40s)
        if (time >= 20 && time < 40) {
            const isStep1 = time >= 20 && time < 23.8;
            const isStep2 = time >= 23.8 && time < 34.0;
            const isSuccess = time >= 34.0;

            // 1. STEP 1: CATEGORY GRID
            if (isStep1) {
                const categorySelected = time >= 22.0;
                return (
                    <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '9px', textAlign: 'left' }}>
                        <div style={{ background: 'var(--white)', padding: '8px 10px', borderBottom: '1px solid var(--gray-200)', fontWeight: 700, fontSize: '10px' }}>
                            Reportar una Barrera
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                            <div style={{ fontWeight: 600, fontSize: '8px', color: 'var(--gray-800)', marginBottom: '6px' }}>¿Qué tipo de barrera es?</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {/* Category Option: FISICA */}
                                <div style={{
                                    border: categorySelected ? '1px solid var(--primary-400)' : '1px solid var(--gray-200)',
                                    background: categorySelected ? 'var(--primary-50)' : 'var(--white)',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    gap: '6px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--barrier-fisica)' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '7.5px' }}>Física</div>
                                        <div style={{ fontSize: '6px', color: 'var(--gray-400)' }}>Obstáculos en el entorno físico...</div>
                                    </div>
                                </div>
                                {/* Category Option: COMUNICACIONAL */}
                                <div style={{
                                    border: '1px solid var(--gray-200)',
                                    background: 'var(--white)',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    gap: '6px',
                                    alignItems: 'center',
                                    opacity: 0.6
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--barrier-comunicacional)' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '7.5px' }}>Comunicacional</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Footer button */}
                        <div style={{ marginTop: 'auto', padding: '8px 10px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{ background: categorySelected ? 'var(--primary-600)' : 'var(--gray-300)', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', fontWeight: 700, fontSize: '8px' }}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                );
            }

            // 2. STEP 2: FORM DETAILS
            if (isStep2) {
                const typedTitle = getTypedText("Rampa rota en vereda", 24.2, 4.0);
                const typedDesc = getTypedText("La rampa está rota en la esquina.", 28.5, 3.5);
                const showLocation = time >= 31.0;
                return (
                    <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '8px', textAlign: 'left', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--white)', padding: '6px 8px', borderBottom: '1px solid var(--gray-200)', fontWeight: 700, fontSize: '9px' }}>
                            Describí la barrera
                        </div>
                        <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '1px' }}>Título *</label>
                                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '3px', borderRadius: '3px', minHeight: '12px' }}>
                                    {typedTitle}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '1px' }}>Descripción detallada *</label>
                                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '3px', borderRadius: '3px', minHeight: '20px' }}>
                                    {typedDesc}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '1px' }}>Ubicación *</label>
                                <div style={{
                                    border: '1px solid var(--gray-300)',
                                    background: 'var(--gray-50)',
                                    padding: '3px',
                                    borderRadius: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    color: showLocation ? 'var(--gray-800)' : 'var(--gray-400)'
                                }}>
                                    <MapPin size={8} />
                                    <span>{showLocation ? "Av. Italia 2450, MVD" : "Seleccionar en el mapa..."}</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '1px' }}>Foto de la barrera</label>
                                <div style={{ background: 'var(--gray-50)', border: '1.5px dashed var(--gray-300)', padding: '4px', borderRadius: '3px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                    <Camera size={10} color="var(--gray-400)" />
                                    <span style={{ color: 'var(--gray-400)', fontSize: '7px' }}>foto_vereda.jpg</span>
                                </div>
                            </div>
                        </div>
                        {/* Footer button */}
                        <div style={{ marginTop: 'auto', padding: '6px 8px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                            <button style={{ background: 'transparent', border: '1px solid var(--gray-300)', padding: '2px 6px', borderRadius: '2px', fontSize: '7.5px' }}>
                                ← Anterior
                            </button>
                            <button style={{ background: 'var(--success-500)', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '2px', fontWeight: 700, fontSize: '8px' }}>
                                Enviar Reporte
                            </button>
                        </div>
                    </div>
                );
            }

            // 3. SUCCESS / REDIRECT TO MAP
            if (isSuccess) {
                const showLoader = time >= 34.0 && time < 35.5;
                const showMapPin = time >= 38.0;

                if (showLoader) {
                    return (
                        <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '8px', color: 'var(--gray-500)' }}>
                            <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2.5px', marginBottom: '6px' }} />
                            <span>Registrando barrera...</span>
                        </div>
                    );
                }

                // Show success modal overlay
                const showModal = time >= 35.5 && time < 39.0;
                return (
                    <div style={{ height: '100%', background: '#e2e8f0', position: 'relative' }}>
                        {/* Fake Map background */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: '#e2e8f0',
                            backgroundImage: 'radial-gradient(var(--gray-300) 1px, transparent 0), radial-gradient(var(--gray-300) 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 8px 8px'
                        }} />
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                            <line x1="0" y1="120" x2="200" y2="120" stroke="var(--white)" strokeWidth="6" />
                            <line x1="80" y1="0" x2="80" y2="300" stroke="var(--white)" strokeWidth="6" />
                        </svg>

                        {showMapPin && (
                            <div className="bouncing-pin" style={{ position: 'absolute', left: '80px', top: '120px', color: 'var(--barrier-fisica)', transform: 'translate(-50%, -100%)' }}>
                                <MapPin size={22} fill="rgba(239, 68, 68, 0.35)" />
                                <div className="pin-radar" />
                            </div>
                        )}

                        {showModal && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(15, 23, 42, 0.65)',
                                backdropFilter: 'blur(3px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px',
                                zIndex: 100
                            }} className="animate-fadeIn">
                                <div style={{
                                    background: 'var(--white)',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    textAlign: 'center',
                                    boxShadow: 'var(--shadow-lg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    width: '100%'
                                }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#d1fae5', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={16} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '9px', fontWeight: 800, color: 'var(--gray-900)' }}>¡Reporte recibido!</h3>
                                    <p style={{ margin: 0, fontSize: '6.5px', color: 'var(--gray-500)', lineHeight: 1.3 }}>
                                        Tu barrera ha sido registrada exitosamente. Un referente la evaluará a la brevedad.
                                    </p>
                                    <button style={{
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px 10px',
                                        borderRadius: '3px',
                                        fontWeight: 700,
                                        fontSize: '7.5px',
                                        marginTop: '4px'
                                    }}>
                                        Ver en el mapa
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
        }

        // Scene 2: Evaluar y Organizar (40s - 60s)
        if (time >= 40 && time < 60) {
            const isApproved = time >= 45.6;
            const isClaimView = time >= 48.0 && time < 55.6;
            const isProjectCreated = time >= 55.6;

            // 1. PROJECT CREATION / PROJECT DETAIL DISPLAY
            if (isProjectCreated) {
                return (
                    <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '9px', textAlign: 'left' }}>
                        {/* Top navigation header */}
                        <div style={{ background: 'var(--primary-800)', color: 'white', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '7.5px' }}>Proyecto de resolución</span>
                            <Settings size={10} />
                        </div>
                        {/* Project Page */}
                        <div style={{ padding: '8px' }}>
                            <span style={{
                                background: 'var(--primary-50)',
                                color: 'var(--primary-600)',
                                padding: '1px 4px',
                                borderRadius: '2px',
                                fontSize: '6px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>
                                INICIANDO
                            </span>
                            <h3 style={{ margin: '3px 0 2px 0', fontSize: '9px', fontWeight: 800 }}>Proyecto Rampa Av. Italia</h3>
                            <p style={{ fontSize: '7px', color: 'var(--gray-500)', margin: '0 0 8px 0' }}>Av. Italia 2450 · Montevideo</p>

                            <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '4px', padding: '6px' }}>
                                <div style={{ fontSize: '7px', color: 'var(--gray-700)', marginBottom: '4px' }}>
                                    <strong>Organización líder:</strong> Mesa Montevideo
                                </div>
                                <div style={{ fontSize: '7px', color: 'var(--gray-700)' }}>
                                    <strong>Colaboradores:</strong> 1 integrante
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // 2. CLAIM PROJECT VIEW
            if (isClaimView) {
                const showClaimModal = time >= 50.6;
                return (
                    <div style={{ height: '100%', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column', fontSize: '9px', textAlign: 'left', position: 'relative' }}>
                        {/* Header */}
                        <div style={{ background: 'var(--white)', padding: '6px 8px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                            <ArrowLeft size={10} />
                            <span>Detalle de Barrera</span>
                        </div>
                        {/* Detail card */}
                        <div style={{ padding: '6px' }}>
                            <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                                <span style={{ background: '#fef2f2', color: 'var(--barrier-fisica)', padding: '1px 4px', borderRadius: '2px', fontSize: '6px', fontWeight: 700 }}>Física</span>
                                <span style={{ background: 'var(--success-50)', color: 'var(--success-600)', padding: '1px 4px', borderRadius: '2px', fontSize: '6px', fontWeight: 700 }}>APROBADA</span>
                            </div>
                            <h3 style={{ margin: '0 0 2px 0', fontSize: '9px', fontWeight: 800 }}>Rampa rota en vereda</h3>
                            <p style={{ fontSize: '7.5px', color: 'var(--gray-500)', margin: '0 0 6px 0' }}>Av. Italia 2450 · Montevideo</p>

                            {/* Project Box Claim */}
                            <div style={{
                                background: 'var(--accent-50)',
                                border: '1.5px dashed var(--accent-300)',
                                borderRadius: '6px',
                                padding: '8px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                marginTop: '4px'
                            }}>
                                <h4 style={{ margin: 0, fontSize: '8px', color: 'var(--gray-800)', fontWeight: 700 }}>Esta barrera aún no tiene un proyecto asociado</h4>
                                <p style={{ margin: 0, fontSize: '6.5px', color: 'var(--gray-500)' }}>¿Tu organización puede trabajar en esta barrera?</p>
                                <button style={{
                                    background: 'var(--accent-500)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px',
                                    borderRadius: '3px',
                                    fontWeight: 700,
                                    fontSize: '8px',
                                    cursor: 'pointer',
                                    marginTop: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '2px'
                                }}>
                                    <Handshake size={8} /> Trabajar en esto
                                </button>
                            </div>
                        </div>

                        {/* Claim Modal popup */}
                        {showClaimModal && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(15, 23, 42, 0.65)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px',
                                zIndex: 100
                            }} className="animate-fadeIn">
                                <div style={{
                                    background: 'white',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    width: '100%',
                                    boxShadow: 'var(--shadow-lg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '9px', fontWeight: 800 }}>Crear Proyecto de Resolución</h3>
                                    <div>
                                        <label style={{ fontSize: '7px', color: 'var(--gray-500)', display: 'block', marginBottom: '2px' }}>Título del proyecto</label>
                                        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '2px', borderRadius: '2px', fontSize: '7.5px' }}>
                                            Proyecto Rampa Av. Italia
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '7px', color: 'var(--gray-500)', display: 'block', marginBottom: '2px' }}>Organización líder</label>
                                        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '2px', borderRadius: '2px', fontSize: '7.5px' }}>
                                            Mesa Montevideo
                                        </div>
                                    </div>
                                    <button style={{
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px',
                                        borderRadius: '3px',
                                        fontWeight: 700,
                                        fontSize: '7.5px',
                                        marginTop: '4px',
                                        textAlign: 'center'
                                    }}>
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            // 3. REFERENTE MANAGEMENT VIEW
            return (
                <div style={{ height: '100%', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column', fontSize: '9px', textAlign: 'left' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-800)', color: 'white', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>Panel de Gestión</span>
                        <Shield size={10} />
                    </div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: 'white' }}>
                        <div style={{ flex: 1, padding: '4px', borderBottom: '2px solid var(--primary-500)', color: 'var(--primary-600)', fontWeight: 700, textAlign: 'center', fontSize: '7.5px' }}>
                            Identificación de barreras
                        </div>
                        <div style={{ flex: 1, padding: '4px', color: 'var(--gray-400)', textAlign: 'center', fontSize: '7.5px', opacity: 0.6 }}>
                            Gestión de Colaboradores
                        </div>
                    </div>
                    {/* Pending list */}
                    <div style={{ padding: '8px' }}>
                        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '4px', padding: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 800, fontSize: '8px' }}>Rampa rota en vereda</span>
                                <span style={{ fontSize: '6px', padding: '1px 3px', borderRadius: '2px', background: isApproved ? 'var(--success-50)' : 'var(--warning-50)', color: isApproved ? 'var(--success-600)' : 'var(--warning-600)', fontWeight: 700 }}>
                                    {isApproved ? "APROBADA" : "PENDIENTE"}
                                </span>
                            </div>
                            <p style={{ fontSize: '7px', color: 'var(--gray-500)', margin: '0 0 5px 0' }}>Av. Italia 2450 · Física</p>
                            
                            {!isApproved && (
                                <button style={{ background: 'var(--success-500)', color: 'white', border: 'none', padding: '3px 6px', borderRadius: '2px', fontWeight: 700, fontSize: '7px' }}>
                                    Aprobar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Scene 3: Colaborar en Chat (60s - 80s)
        if (time >= 60 && time < 80) {
            const hasJoined = time >= 64.1;
            const activeTab = time >= 69.6 ? 'chat' : 'proyecto';
            const showMsg1 = time >= 68.0;
            const showMsg2 = time >= 72.0;
            const showMsg3 = time >= 76.0;

            return (
                <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '9px', textAlign: 'left', position: 'relative' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-800)', color: 'white', padding: '6px 8px', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontWeight: 700, fontSize: '8px' }}>Proyecto Rampa Av. Italia</span>
                        <span style={{ fontSize: '6px', opacity: 0.8 }}>{hasJoined ? "2 colaboradores" : "1 colaborador"}</span>
                    </div>

                    {/* Tab Navigation Menu (proyecto | ejecucion | chat) */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', padding: '2px' }}>
                        <div style={{ flex: 1, padding: '3px', borderRadius: '3px', background: activeTab === 'proyecto' ? 'white' : 'transparent', textAlign: 'center', fontSize: '7px', fontWeight: activeTab === 'proyecto' ? 700 : 500, color: activeTab === 'proyecto' ? 'var(--primary-700)' : 'var(--gray-500)', boxShadow: activeTab === 'proyecto' ? 'var(--shadow-sm)' : 'none' }}>
                            proyecto
                        </div>
                        <div style={{ flex: 1, padding: '3px', textAlign: 'center', fontSize: '7px', color: 'var(--gray-500)', opacity: 0.6 }}>
                            ejecucion
                        </div>
                        <div style={{ flex: 1, padding: '3px', borderRadius: '3px', background: activeTab === 'chat' ? 'white' : 'transparent', textAlign: 'center', fontSize: '7px', fontWeight: activeTab === 'chat' ? 700 : 500, color: activeTab === 'chat' ? 'var(--primary-700)' : 'var(--gray-500)', boxShadow: activeTab === 'chat' ? 'var(--shadow-sm)' : 'none' }}>
                            chat
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'proyecto' && (
                        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontSize: '7px', color: 'var(--gray-600)' }}>
                                <strong>Líder:</strong> Mesa Montevideo
                            </div>
                            <div style={{ fontSize: '7px', color: 'var(--gray-600)', marginBottom: '4px' }}>
                                <strong>Detalle:</strong> Eliminación de escalón en vereda.
                            </div>

                            {/* Join Project card */}
                            {!hasJoined && (
                                <div style={{
                                    background: 'var(--primary-50)',
                                    border: '1px solid var(--primary-100)',
                                    borderRadius: '4px',
                                    padding: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '3px',
                                    marginTop: '4px'
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: '7.5px' }}>¡Sumate a colaborar en este proyecto!</span>
                                    <div style={{ background: 'white', border: '1px solid var(--gray-300)', padding: '2px', borderRadius: '2px', fontSize: '7.5px' }}>
                                        Vecinos Zona 3
                                    </div>
                                    <button style={{
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px',
                                        borderRadius: '3px',
                                        fontWeight: 700,
                                        fontSize: '7.5px',
                                        cursor: 'pointer',
                                        marginTop: '2px'
                                    }}>
                                        Postularse para colaborar
                                    </button>
                                </div>
                            )}

                            {hasJoined && (
                                <div style={{
                                    background: 'var(--success-50)',
                                    border: '1px solid var(--success-200)',
                                    borderRadius: '4px',
                                    padding: '4px 6px',
                                    color: 'var(--success-700)',
                                    fontSize: '7.5px',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    marginTop: '4px'
                                }}>
                                    ✓ ¡Te sumaste al proyecto como colaborador!
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                                {showMsg1 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--gray-100)', padding: '4px 6px', borderRadius: '4px 4px 4px 0', maxWidth: '140px', fontSize: '7px' }}>
                                        <strong>Mesa MVD:</strong> ¡Bienvenidos! Organizamos la jornada para el sábado.
                                    </div>
                                )}
                                {showMsg2 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '4px 6px', borderRadius: '4px 4px 0 4px', alignSelf: 'flex-end', maxWidth: '140px', fontSize: '7px' }}>
                                        <strong>Juan:</strong> Perfecto. Consigo cemento y arena.
                                    </div>
                                )}
                                {showMsg3 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '4px 6px', borderRadius: '4px 4px 0 4px', alignSelf: 'flex-end', maxWidth: '140px', fontSize: '7px' }}>
                                        <strong>Tú:</strong> ¡Excelente! Yo ayudo a colocar el cemento el sábado.
                                    </div>
                                )}
                            </div>
                            {/* Fake input message bar */}
                            <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '3px', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-400)', fontSize: '7px' }}>Mensaje enviado...</span>
                                <MessageSquare size={8} color="var(--primary-500)" />
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Scene 4: Resolver Barrera (80s - 100s)
        if (time >= 80 && time <= 100) {
            const isT1Done = time >= 81.5;
            const isT2Done = time >= 83.5;
            const isT3Done = time >= 85.5;
            const isResolved = time >= 88.5;

            if (isResolved) {
                return (
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(135deg, #065f46, #047857)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        position: 'relative',
                        padding: '12px'
                    }}>
                        <div className="scale-pulse" style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px'
                        }}>
                            <CheckCircle size={28} color="var(--white)" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 2px' }}>¡Resuelto!</h3>
                        <p style={{ fontSize: '7px', opacity: 0.9, maxWidth: '140px', margin: 0, lineHeight: 1.2 }}>
                            La rampa en Av. Italia está terminada y habilitada.
                        </p>

                        <div style={{
                            marginTop: '10px',
                            fontSize: '6.5px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '3px 8px',
                            borderRadius: '2px',
                            fontWeight: 600
                        }}>
                            Estado: FINALIZADO
                        </div>

                        {/* Confetti particles */}
                        <div className="confetti c1" />
                        <div className="confetti c2" />
                        <div className="confetti c3" />
                        <div className="confetti c4" />
                    </div>
                );
            }

            return (
                <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '9px', textAlign: 'left' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-800)', color: 'white', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '8px' }}>Proyecto Rampa Av. Italia</span>
                        <Settings size={10} />
                    </div>

                    {/* Tab Navigation Menu */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', padding: '2px' }}>
                        <div style={{ flex: 1, padding: '3px', textAlign: 'center', fontSize: '7px', color: 'var(--gray-500)' }}>
                            proyecto
                        </div>
                        <div style={{ flex: 1, padding: '3px', borderRadius: '3px', background: 'white', textAlign: 'center', fontSize: '7px', fontWeight: 700, color: 'var(--primary-700)', boxShadow: 'var(--shadow-sm)' }}>
                            ejecucion
                        </div>
                        <div style={{ flex: 1, padding: '3px', textAlign: 'center', fontSize: '7px', color: 'var(--gray-500)' }}>
                            chat
                        </div>
                    </div>

                    {/* Task checklist */}
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {/* Title button resolution (Only for Referente role) */}
                        {isT3Done && (
                            <button style={{
                                background: 'var(--success-500)',
                                color: 'white',
                                border: 'none',
                                padding: '4px',
                                borderRadius: '3px',
                                fontWeight: 700,
                                fontSize: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                marginBottom: '6px'
                            }}>
                                <CheckCircle size={8} /> Marcar como Resuelto
                            </button>
                        )}

                        <div style={{ fontSize: '7.5px', fontWeight: 700, color: 'var(--gray-500)', marginBottom: '2px' }}>Checklist de Avance</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '3px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {isT1Done ? <CheckCircle size={10} color="var(--success-500)" /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid var(--gray-300)' }} />}
                            </span>
                            <span style={{ textDecoration: isT1Done ? 'line-through' : 'none', color: isT1Done ? 'var(--gray-400)' : 'var(--gray-700)', fontSize: '7.5px' }}>
                                Conseguir materiales
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '3px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {isT2Done ? <CheckCircle size={10} color="var(--success-500)" /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid var(--gray-300)' }} />}
                            </span>
                            <span style={{ textDecoration: isT2Done ? 'line-through' : 'none', color: isT2Done ? 'var(--gray-400)' : 'var(--gray-700)', fontSize: '7.5px' }}>
                                Preparar mezcla
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '3px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {isT3Done ? <CheckCircle size={10} color="var(--success-500)" /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid var(--gray-300)' }} />}
                            </span>
                            <span style={{ textDecoration: isT3Done ? 'line-through' : 'none', color: isT3Done ? 'var(--gray-400)' : 'var(--gray-700)', fontSize: '7.5px' }}>
                                Construir rampa de cemento
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="about-page animate-fadeIn" style={{ minHeight: 'calc(100vh - 120px)', padding: 'var(--space-6) 0 var(--space-12)' }}>
            <style>{`
                /* CSS Custom Styles for Explainer Video Tour */
                .video-container {
                    background: #020617;
                    border-radius: var(--radius-2xl);
                    border: 1px solid #1e293b;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), var(--shadow-glow);
                    overflow: hidden;
                    position: relative;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .video-screen {
                    min-height: 350px;
                    display: grid;
                    grid-template-columns: 1.1fr 0.9fr;
                    align-items: center;
                    padding: 24px;
                    gap: 24px;
                    position: relative;
                    background: radial-gradient(circle at 70% 30%, #0f172a 0%, #020617 100%);
                }

                @media (max-width: 600px) {
                    .video-screen {
                        grid-template-columns: 1fr;
                        min-height: 440px;
                        padding: 16px;
                        gap: 16px;
                    }
                    .info-column {
                        text-align: center !important;
                    }
                }

                /* Smartphone frame mockup */
                .phone-frame {
                    width: 170px;
                    height: 320px;
                    border: 6px solid #1e293b;
                    border-radius: 26px;
                    background: #000;
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.6);
                    position: relative;
                    overflow: hidden;
                    margin: 0 auto;
                }

                /* Phone screen display area */
                .phone-screen {
                    width: 100%;
                    height: 100%;
                    border-radius: 20px;
                    overflow: hidden;
                    background: #fff;
                    position: relative;
                }

                /* Notch */
                .phone-notch {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 70px;
                    height: 12px;
                    background: #1e293b;
                    border-radius: 0 0 8px 8px;
                    z-index: 99;
                }

                /* Logo float animation */
                .v-logo-float {
                    animation: floatLogo 3s ease-in-out infinite alternate;
                }
                @keyframes floatLogo {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-6px); }
                }

                /* Pin radar wave */
                .pin-radar {
                    position: absolute;
                    left: 50%;
                    top: 75%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 8px;
                    border-radius: 50%;
                    border: 1.5px solid var(--barrier-fisica);
                    animation: radarPulse 1.5s ease-out infinite;
                }
                @keyframes radarPulse {
                    0% { width: 5px; height: 2px; opacity: 1; }
                    100% { width: 40px; height: 16px; opacity: 0; }
                }

                /* Confetti particles */
                .confetti {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #fbcfe8;
                    border-radius: 50%;
                }
                .confetti.c1 { left: 20%; top: 20%; animation: particleFall 2s linear infinite; background: #fbbf24; }
                .confetti.c2 { left: 40%; top: 10%; animation: particleFall 2.5s linear infinite 0.2s; background: #38bdf8; }
                .confetti.c3 { left: 65%; top: 15%; animation: particleFall 2.2s linear infinite 0.5s; background: #f472b6; }
                .confetti.c4 { left: 80%; top: 25%; animation: particleFall 1.8s linear infinite 0.1s; background: #34d399; }

                @keyframes particleFall {
                    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(160px) rotate(360deg); opacity: 0; }
                }

                /* Fade In animation */
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="container" style={{ maxWidth: '850px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 6px' }}>
                        ¿Cómo funciona <span className="text-gradient">REDDIS</span>?
                    </h1>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)', margin: 0 }}>
                        Mirá este video didáctico interactivo para conocer los objetivos y el uso de la app paso a paso.
                    </p>
                </div>

                {/* Video Explainer Player Card */}
                <div className="video-container">
                    
                    {/* Scene Indicator Header */}
                    <div style={{
                        background: '#0f172a',
                        borderBottom: '1px solid #1e293b',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#94a3b8',
                        fontSize: '0.78rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Film size={14} color="var(--accent-400)" />
                            <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Video Explicativo REDDIS</span>
                        </div>
                        <span style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--accent-400)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                        }}>
                            {sceneTitles[currentScene]}
                        </span>
                    </div>

                    {/* Main Screen Content Grid */}
                    <div className="video-screen">
                        {/* Info Column (Left Side) */}
                        <div className="info-column" style={{ color: 'white', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span style={{
                                color: 'var(--accent-400)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Escena {currentScene + 1} de 5
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc', lineHeight: 1.2 }}>
                                {sceneTitles[currentScene]}
                            </h2>
                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                                {currentScene === 0 && "Descubrí el impacto de la Red Digital de Inclusión Social en tu departamento."}
                                {currentScene === 1 && "Cualquier persona puede geolocalizar y fotografiar barreras de accesibilidad en el momento."}
                                {currentScene === 2 && "Los referentes departamentales evalúan los reportes y abren un proyecto de resolución público."}
                                {currentScene === 3 && "Postulate a colaborar y coordiná acciones conjuntas mediante el chat en tiempo real."}
                                {currentScene === 4 && "Marcá las tareas como resueltas y celebrá la eliminación de la barrera de accesibilidad."}
                            </p>
                            
                            {/* Subtitle / narrator wave visual indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                <BookOpen size={16} color="var(--accent-400)" />
                                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Locución Narrada (Texto abajo)</span>
                            </div>
                        </div>

                        {/* Smartphone Column (Right Side) */}
                        <div style={{ position: 'relative' }}>
                            <div className="phone-frame">
                                <div className="phone-notch" />
                                <div className="phone-screen">
                                    {renderPhoneScreen()}
                                    {/* Simulated Cursor */}
                                    <div style={getCursorStyle()} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DEDICATED SUBTITLES BAR (Never overlaps the smartphone graphic) */}
                    <div style={{
                        background: '#090d16',
                        borderTop: '1px solid #1e293b',
                        padding: '14px 20px',
                        color: '#cbd5e1',
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '68px',
                        boxSizing: 'border-box'
                    }}>
                        <Volume2 size={16} style={{ minWidth: '16px', marginRight: '10px', color: 'var(--accent-400)' }} />
                        <span style={{ maxWidth: '680px' }}>{currentTranscript}</span>
                    </div>

                    {/* Video Controls Bar */}
                    <div style={{
                        background: '#0f172a',
                        padding: '16px 20px',
                        borderTop: '1px solid #1e293b',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {/* Timeline Scrubber */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', width: '30px', textAlign: 'right' }}>
                                0:{Math.floor(time).toString().padStart(2, '0')}
                            </span>
                            <div style={{ flex: 1, position: 'relative', height: '14px', display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={TOTAL_DURATION} 
                                    step="0.1" 
                                    value={time}
                                    onChange={(e) => {
                                        setIsPlaying(false);
                                        setTime(parseFloat(e.target.value));
                                    }}
                                    style={{
                                        width: '100%',
                                        WebkitAppearance: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        zIndex: 10,
                                        margin: 0
                                    }}
                                    className="scrubber-range"
                                />
                                <style>{`
                                    .scrubber-range::-webkit-slider-runnable-track {
                                        width: 100%;
                                        height: 4px;
                                        background: #1e293b;
                                        border-radius: 2px;
                                    }
                                    .scrubber-range::-webkit-slider-thumb {
                                        height: 12px;
                                        width: 12px;
                                        border-radius: 50%;
                                        background: var(--accent-400);
                                        cursor: pointer;
                                        -webkit-appearance: none;
                                        margin-top: -4px;
                                        box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
                                        transition: transform 0.1s;
                                    }
                                    .scrubber-range::-webkit-slider-thumb:hover {
                                        transform: scale(1.25);
                                    }
                                `}</style>
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '5px',
                                    height: '4px',
                                    background: 'linear-gradient(90deg, var(--accent-400), var(--accent-500))',
                                    borderRadius: '2px',
                                    width: `${(time / TOTAL_DURATION) * 100}%`,
                                    pointerEvents: 'none',
                                    zIndex: 5
                                }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', width: '35px' }}>
                                1:40
                            </span>
                        </div>

                        {/* Player Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyStyle: 'space-between', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handlePlayPause}
                                    style={{
                                        background: 'var(--accent-500)',
                                        color: 'var(--white)',
                                        border: 'none',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 10px rgba(245,158,11,0.25)'
                                    }}
                                    aria-label={isPlaying ? "Pausar" : "Reproducir"}
                                >
                                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '2px' }} />}
                                </button>
                                
                                <button
                                    onClick={handleReset}
                                    style={{
                                        background: 'transparent',
                                        color: '#94a3b8',
                                        border: '1px solid #1e293b',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    aria-label="Reiniciar"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>

                            {/* Navigation steps indicators */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[0, 20, 40, 60, 80].map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setIsPlaying(false);
                                            setTime(s);
                                        }}
                                        style={{
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            background: currentScene === idx ? 'var(--accent-500)' : '#1e293b',
                                            color: currentScene === idx ? 'white' : '#94a3b8',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Call to action */}
                <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
                    <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
                        Volver al inicio
                    </Link>
                    <Link to="/reportar" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        Reportar una Barrera <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
