import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Play, Pause, RotateCcw, ArrowRight,
    MapPin, Users, CheckCircle, MessageSquare, Settings, 
    Sparkles, PlusCircle, Shield, Network, Info, Smartphone, Film,
    ChevronRight, ArrowLeft, Camera, X, Handshake, AlertTriangle, BookOpen, Volume2, Clock,
    Maximize, Minimize, Circle
} from 'lucide-react';

const TOTAL_DURATION = 100; // Explainer duration in seconds (20s per scene)

const NARRATOR_TRANSCRIPTS = [
    { 
        start: 0, 
        end: 20, 
        text: "Te damos la bienvenida a REDDIS, la Red Digital de Inclusión Social. Una plataforma diseñada para identificar y visibilizar de manera colaborativa las barreras de accesibilidad de nuestro entorno, impulsando la planificación y ejecución de soluciones reales entre ciudadanos y organizaciones." 
    },
    { 
        start: 20, 
        end: 40, 
        text: "Paso 1: Reportar Barrera. Cuando encontrás una barrera de accesibilidad, ingresás a 'Reportar'. Seleccionás la categoría (Física, Comunicacional, etc.), completás el título y la descripción, definís su ubicación real en el mapa, adjuntás una foto y enviás el reporte para su publicación." 
    },
    { 
        start: 40, 
        end: 60, 
        text: "Paso 2: Solicitar Colaboración. Para participar en la resolución de una barrera, ingresás a la pestaña 'Colaborar', seleccionás un proyecto activo y enviás tu solicitud de colaboración indicando tu organización y motivo. Una vez que el referente departamental la aprueba, te integrás formalmente al equipo." 
    },
    { 
        start: 60, 
        end: 80, 
        text: "Paso 3: Pestañas de Colaboración. Dentro de la ficha del proyecto tenés tres pestañas clave: la pestaña 'Proyecto' detalla el diseño con objetivos y acciones previstas; la pestaña 'Ejecución' registra el avance de las tareas en la bitácora; y la pestaña 'Chat' permite la comunicación directa con el equipo." 
    },
    { 
        start: 80, 
        end: 100, 
        text: "Paso 4: Resolver e Impactar. A medida que el equipo colabora, completan las tareas de la bitácora en la pestaña 'Ejecución'. Una vez finalizadas todas las acciones, el proyecto se marca como resuelto. La barrera en el mapa cambia a verde, celebrando el éxito de lograr un entorno accesible." 
    }
];

export default function AboutPage() {
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const intervalRef = useRef(null);
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Find current narrator text
    const currentTranscript = NARRATOR_TRANSCRIPTS.find(t => time >= t.start && time < t.end)?.text || "";

    // Determine current scene index (0 to 4)
    const currentScene = Math.min(Math.floor(time / 20), 4);
    const sceneTitles = [
        "Introducción",
        "1. Reportar Barrera",
        "2. Solicitar Colaboración",
        "3. Pestañas de Colaboración",
        "4. Resolver e Impactar"
    ];

    // Helper to calculate text typing effect in the mockup form
    const getTypedText = (fullText, startTime, duration) => {
        if (time < startTime) return "";
        if (time >= startTime + duration) return fullText;
        const progress = (time - startTime) / duration;
        const charCount = Math.floor(fullText.length * progress);
        return fullText.substring(0, charCount);
    };

    // Calculate cursor positions dynamically
    const getCursorStyle = () => {
        let left = -100;
        let top = -100;
        let opacity = 0;
        let scale = 1;
        let transition = "none";

        // Scene 1: Reportar Barrera (20s - 40s)
        if (time >= 20.5 && time < 21.8) {
            const t = (time - 20.5) / 1.3;
            left = 200 - (200 - 140) * t;
            top = 380 - (380 - 190) * t;
            opacity = 1;
        } else if (time >= 21.8 && time < 22.4) {
            left = 140;
            top = 190;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 22.4 && time < 23.4) {
            const t = (time - 22.4) / 1.0;
            left = 140 + (210 - 140) * t;
            top = 190 + (470 - 190) * t;
            opacity = 1;
        } else if (time >= 23.4 && time < 24.0) {
            left = 210;
            top = 470;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 24.0 && time < 24.5) {
            const t = (time - 24.0) / 0.5;
            left = 210 - (210 - 140) * t;
            top = 470 - (470 - 130) * t;
            opacity = 1;
        } else if (time >= 24.5 && time < 28.5) {
            left = 140;
            top = 130;
            opacity = 1;
        } else if (time >= 28.5 && time < 29.0) {
            const t = (time - 28.5) / 0.5;
            left = 140;
            top = 130 + (220 - 130) * t;
            opacity = 1;
        } else if (time >= 29.0 && time < 32.5) {
            left = 140;
            top = 220;
            opacity = 1;
        } else if (time >= 32.5 && time < 33.5) {
            const t = (time - 32.5) / 1.0;
            left = 140;
            top = 220 + (310 - 220) * t;
            opacity = 1;
        } else if (time >= 33.5 && time < 34.0) {
            left = 140;
            top = 310;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 34.0 && time < 35.0) {
            const t = (time - 34.0) / 1.0;
            left = 140 + (200 - 140) * t;
            top = 310 + (470 - 310) * t;
            opacity = 1;
        } else if (time >= 35.0 && time < 35.5) {
            left = 200;
            top = 470;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 37.5 && time < 39.0) {
            const t = (time - 37.5) / 1.5;
            left = 200 - (200 - 140) * t;
            top = 470 - (470 - 330) * t;
            opacity = 1;
        } else if (time >= 39.0 && time < 39.6) {
            left = 140;
            top = 330;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }

        // Scene 2: Cómo postularse a Colaborar (40s - 60s)
        else if (time >= 40.5 && time < 42.0) {
            const t = (time - 40.5) / 1.5;
            left = 140;
            top = 330 - (330 - 160) * t;
            opacity = 1;
        } else if (time >= 42.0 && time < 42.6) {
            left = 140;
            top = 160;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 42.6 && time < 43.5) {
            const t = (time - 42.6) / 0.9;
            left = 140;
            top = 160 + (260 - 160) * t;
            opacity = 1;
        } else if (time >= 43.5 && time < 45.0) {
            left = 140;
            top = 260;
            opacity = 1;
        } else if (time >= 45.0 && time < 48.0) {
            const t = (time - 45.0) / 3.0;
            left = 140;
            top = 260 + (330 - 260) * t;
            opacity = 1;
        } else if (time >= 48.0 && time < 52.5) {
            left = 140;
            top = 330;
            opacity = 1;
        } else if (time >= 52.5 && time < 54.0) {
            const t = (time - 52.5) / 1.5;
            left = 140;
            top = 330 + (400 - 330) * t;
            opacity = 1;
        } else if (time >= 54.0 && time < 54.6) {
            left = 140;
            top = 400;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }

        // Scene 3: Pestañas de Colaboración (60s - 80s)
        else if (time >= 63.5 && time < 65.0) {
            const t = (time - 63.5) / 1.5;
            left = 140;
            top = 400 - (400 - 88) * t;
            opacity = 1;
        } else if (time >= 65.0 && time < 65.6) {
            left = 140;
            top = 88;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 70.0 && time < 71.5) {
            const t = (time - 70.0) / 1.5;
            left = 140 + (230 - 140) * t;
            top = 88;
            opacity = 1;
        } else if (time >= 71.5 && time < 72.1) {
            left = 230;
            top = 88;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 77.5 && time < 79.0) {
            const t = (time - 77.5) / 1.5;
            left = 230 - (230 - 140) * t;
            top = 88;
            opacity = 1;
        } else if (time >= 79.0 && time < 79.6) {
            left = 140;
            top = 88;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        }

        // Scene 4: Resolver e Impactar (80s - 100s)
        else if (time >= 81.0 && time < 83.0) {
            const t = (time - 81.0) / 2.0;
            left = 140 - (140 - 45) * t;
            top = 88 + (230 - 88) * t;
            opacity = 1;
        } else if (time >= 83.0 && time < 83.6) {
            left = 45;
            top = 230;
            opacity = 1;
            scale = 0.85;
            transition = "transform 0.1s ease";
        } else if (time >= 84.5 && time < 86.5) {
            const t = (time - 84.5) / 2.0;
            left = 45 + (140 - 45) * t;
            top = 230 - (230 - 130) * t;
            opacity = 1;
        } else if (time >= 86.5 && time < 87.1) {
            left = 140;
            top = 130;
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
            width: '20px',
            height: '20px',
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
                    padding: '20px',
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <div className="v-logo-float" style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    }}>
                        <Network size={44} color="var(--accent-400)" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>REDDIS</h2>
                    <p style={{ fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.4, maxWidth: '200px' }}>
                        Red Digital de Inclusión Social
                    </p>
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        fontSize: '0.72rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600
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

            // 1. STEP 1: CATEGORY SELECTION
            if (isStep1) {
                const categorySelected = time >= 21.8;
                return (
                    <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '12px', textAlign: 'left' }}>
                        <div style={{ background: 'var(--white)', padding: '12px 14px', borderBottom: '1px solid var(--gray-200)', fontWeight: 700, fontSize: '13px' }}>
                            Reportar una Barrera
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--gray-800)', marginBottom: '10px' }}>¿Qué tipo de barrera es?</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Category Option: FISICA */}
                                <div style={{
                                    border: categorySelected ? '2px solid var(--primary-400)' : '1px solid var(--gray-200)',
                                    background: categorySelected ? 'var(--primary-50)' : 'var(--white)',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--barrier-fisica)', minWidth: '10px' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '11px' }}>Física</div>
                                        <div style={{ fontSize: '8.5px', color: 'var(--gray-400)', marginTop: '1px' }}>Obstáculos en el entorno físico...</div>
                                    </div>
                                </div>
                                {/* Category Option: COMUNICACIONAL */}
                                <div style={{
                                    border: '1px solid var(--gray-200)',
                                    background: 'var(--white)',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center',
                                    opacity: 0.5
                                }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--barrier-comunicacional)', minWidth: '10px' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '11px' }}>Comunicacional</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Footer button */}
                        <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{ background: categorySelected ? 'var(--primary-600)' : 'var(--gray-300)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                );
            }

            // 2. STEP 2: FORM DETAILS
            if (isStep2) {
                const typedTitle = getTypedText("Rampa rota en vereda", 24.5, 4.0);
                const typedDesc = getTypedText("La rampa está rota en la esquina.", 29.0, 3.5);
                const showLocation = time >= 33.5;
                return (
                    <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '11px', textAlign: 'left', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--white)', padding: '10px 12px', borderBottom: '1px solid var(--gray-200)', fontWeight: 700, fontSize: '12px' }}>
                            Describí la barrera
                        </div>
                        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '2px', fontSize: '10px' }}>Título *</label>
                                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '6px', borderRadius: '4px', minHeight: '26px', fontSize: '11px' }}>
                                    {typedTitle}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '2px', fontSize: '10px' }}>Descripción detallada *</label>
                                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '6px', borderRadius: '4px', minHeight: '48px', fontSize: '11px', lineHeight: 1.3 }}>
                                    {typedDesc}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '2px', fontSize: '10px' }}>Ubicación *</label>
                                <div style={{
                                    border: '1px solid var(--gray-300)',
                                    background: 'var(--gray-50)',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: showLocation ? 'var(--gray-800)' : 'var(--gray-400)',
                                    fontSize: '11px'
                                }}>
                                    <MapPin size={12} />
                                    <span>{showLocation ? "Av. Italia 2450, MVD" : "Seleccionar en el mapa..."}</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '2px', fontSize: '10px' }}>Foto de la barrera</label>
                                <div style={{ background: 'var(--gray-50)', border: '1.5px dashed var(--gray-300)', padding: '8px', borderRadius: '4px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <Camera size={14} color="var(--gray-400)" />
                                    <span style={{ color: 'var(--gray-400)', fontSize: '9.5px' }}>foto_vereda.jpg</span>
                                </div>
                            </div>
                        </div>
                        {/* Footer button */}
                        <div style={{ marginTop: 'auto', padding: '10px 12px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                            <button style={{ background: 'transparent', border: '1px solid var(--gray-300)', padding: '4px 10px', borderRadius: '3px', fontSize: '10.5px' }}>
                                ← Anterior
                            </button>
                            <button style={{ background: 'var(--success-500)', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '3px', fontWeight: 700, fontSize: '11px' }}>
                                Enviar Reporte
                            </button>
                        </div>
                    </div>
                );
            }

            // 3. SUCCESS / REDIRECT TO MAP
            if (isSuccess) {
                const showLoader = time >= 34.0 && time < 35.5;
                const showMapPin = time >= 37.0;

                if (showLoader) {
                    return (
                        <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '11px', color: 'var(--gray-500)' }}>
                            <div className="loading-spinner" style={{ width: '28px', height: '28px', borderWidth: '3px', marginBottom: '8px' }} />
                            <span>Registrando barrera...</span>
                        </div>
                    );
                }

                // Show success modal overlay
                const showModal = time >= 35.5;
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
                            <line x1="0" y1="180" x2="280" y2="180" stroke="var(--white)" strokeWidth="8" />
                            <line x1="120" y1="0" x2="120" y2="520" stroke="var(--white)" strokeWidth="8" />
                        </svg>

                        {showMapPin && (
                            <div className="bouncing-pin" style={{ position: 'absolute', left: '120px', top: '180px', color: 'var(--barrier-fisica)', transform: 'translate(-50%, -100%)' }}>
                                <MapPin size={32} fill="rgba(239, 68, 68, 0.35)" />
                                <div className="pin-radar" style={{ top: '75%', width: '30px', height: '12px' }} />
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
                                padding: '16px',
                                zIndex: 100
                            }} className="animate-fadeIn">
                                <div style={{
                                    background: 'var(--white)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    textAlign: 'center',
                                    boxShadow: 'var(--shadow-lg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%'
                                }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#d1fae5', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={20} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--gray-900)' }}>¡Reporte recibido!</h3>
                                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--gray-500)', lineHeight: 1.4 }}>
                                        Tu barrera ha sido registrada exitosamente. Un referente la evaluará a la brevedad.
                                    </p>
                                    <button style={{
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 14px',
                                        borderRadius: '4px',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        marginTop: '6px'
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

        // Scene 2: Cómo postularse a Colaborar (40s - 60s)
        if (time >= 40 && time < 60) {
            const isModalOpen = time >= 42.6 && time < 54.6;
            const isPending = time >= 54.6 && time < 57.5;
            const isApproved = time >= 57.5;

            // 1. APPROVED / JOINED BANNER STAGE
            if (isApproved) {
                return (
                    <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '11px', textAlign: 'left' }}>
                        {/* Header */}
                        <div style={{ background: 'var(--primary-800)', color: 'white', padding: '10px 14px', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>Proyecto Rampa Av. Italia</span>
                            <span style={{ fontSize: '9px', opacity: 0.8 }}>2 colaboradores</span>
                        </div>
                        {/* Navigation Menu */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', padding: '3px' }}>
                            <div style={{ flex: 1, padding: '4px', borderRadius: '4px', background: 'white', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--primary-700)', boxShadow: 'var(--shadow-sm)' }}>
                                proyecto
                            </div>
                            <div style={{ flex: 1, padding: '4px', textAlign: 'center', fontSize: '10px', color: 'var(--gray-500)' }}>
                                ejecucion
                            </div>
                            <div style={{ flex: 1, padding: '4px', textAlign: 'center', fontSize: '10px', color: 'var(--gray-500)' }}>
                                chat
                            </div>
                        </div>
                        {/* Notification Banner & Page Body */}
                        <div style={{ padding: '12px' }}>
                            <div style={{
                                background: 'var(--success-50)',
                                border: '1px solid var(--success-200)',
                                borderRadius: '6px',
                                padding: '8px 10px',
                                color: 'var(--success-700)',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                textAlign: 'center',
                                marginBottom: '12px'
                            }}>
                                ✓ ¡Te sumaste al proyecto como colaborador!
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--gray-600)' }}>
                                <strong>Líder:</strong> Mesa Montevideo
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--gray-600)', marginTop: '4px' }}>
                                <strong>Detalle:</strong> Eliminación de escalón en vereda.
                            </div>
                        </div>
                    </div>
                );
            }

            // 2. PROJECT LIST / PENDING REQUEST CARD
            return (
                <div style={{ height: '100%', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column', fontSize: '11px', textAlign: 'left', position: 'relative' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-800)', color: 'white', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>Colaborar</span>
                        <Users size={14} />
                    </div>

                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Subtitle explanation */}
                        <div style={{ color: 'var(--gray-500)', fontSize: '9.5px', lineHeight: 1.3 }}>
                            Busca en la lista la barrera/proyecto de tu interés y envía tu solicitud.
                        </div>

                        {/* Search bar mock */}
                        <div style={{ background: 'white', border: '1px solid var(--gray-200)', padding: '6px 10px', borderRadius: '4px', fontSize: '10px', color: 'var(--gray-400)' }}>
                            Buscar proyectos...
                        </div>

                        {/* PENDING CARD (Triggered after submitting postulation) */}
                        {isPending && (
                            <div style={{
                                padding: '10px',
                                background: '#fffbeb',
                                border: '1px solid #fef3c7',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px'
                            }} className="animate-fadeIn">
                                <h4 style={{ color: '#b45309', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700 }}>
                                    <Clock size={12} /> Postulación Pendiente
                                </h4>
                                <p style={{ color: '#d97706', margin: 0, fontSize: '9px', lineHeight: 1.3 }}>
                                    Tu solicitud para colaborar en el proyecto está siendo evaluada por un referente departamental. Una vez aprobada, podrás participar.
                                </p>
                            </div>
                        )}

                        {/* Active Project Card */}
                        <div style={{
                            background: 'white',
                            border: '1px solid var(--gray-200)',
                            borderRadius: '6px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{
                                    background: 'var(--primary-50)',
                                    color: 'var(--primary-600)',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '8.5px',
                                    fontWeight: 700
                                }}>
                                    INICIANDO
                                </span>
                            </div>
                            <h3 style={{ margin: '2px 0', fontSize: '12px', fontWeight: 800 }}>Proyecto Rampa Av. Italia</h3>
                            <p style={{ fontSize: '10px', color: 'var(--gray-500)', margin: 0 }}>Av. Italia 2450 · Montevideo</p>

                            {!isPending && (
                                <button style={{
                                    background: 'var(--primary-600)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    fontSize: '9.5px',
                                    marginTop: '6px',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}>
                                    Postularme para colaborar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* POSTULATION DIALOG OVERLAY */}
                    {isModalOpen && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.65)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                            zIndex: 100
                        }} className="animate-fadeIn">
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '14px',
                                width: '100%',
                                boxShadow: 'var(--shadow-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                textAlign: 'left'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 800 }}>Postularse para colaborar</h3>
                                
                                <div>
                                    <label style={{ fontSize: '9px', color: 'var(--gray-500)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Nombre de tu Organización</label>
                                    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '6px', borderRadius: '4px', fontSize: '11px', minHeight: '26px' }}>
                                        {getTypedText("Vecinos Zona 3", 43.5, 1.5)}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '9px', color: 'var(--gray-500)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Motivo por el que querés colaborar</label>
                                    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '6px', borderRadius: '4px', fontSize: '11px', minHeight: '40px', lineHeight: 1.3 }}>
                                        {getTypedText("Quiero ayudar con la vereda", 48.0, 4.5)}
                                    </div>
                                </div>

                                <button style={{
                                    background: 'var(--primary-600)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    marginTop: '4px',
                                    textAlign: 'center'
                                }}>
                                    Postularse para colaborar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Scene 3: Pestañas de Colaboración (60s - 80s)
        if (time >= 60 && time < 80) {
            const activeTab = time < 65.6 ? 'proyecto' : (time < 72.1 ? 'ejecucion' : (time < 79.6 ? 'chat' : 'ejecucion'));
            const showMsg1 = time >= 60.0;
            const showMsg2 = time >= 73.0;
            const showMsg3 = time >= 76.5;

            return (
                <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '11px', textAlign: 'left', position: 'relative' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-800)', color: 'white', padding: '10px 14px', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>Proyecto Rampa Av. Italia</span>
                        <span style={{ fontSize: '9px', opacity: 0.8 }}>2 colaboradores</span>
                    </div>

                    {/* Tab Navigation Menu (proyecto | ejecucion | chat) */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-100)', padding: '4px', gap: '4px' }}>
                        <div style={{ flex: 1, padding: '5px', borderRadius: '4px', background: activeTab === 'proyecto' ? 'white' : 'transparent', textAlign: 'center', fontSize: '10px', fontWeight: activeTab === 'proyecto' ? 700 : 500, color: activeTab === 'proyecto' ? 'var(--primary-700)' : 'var(--gray-600)', boxShadow: activeTab === 'proyecto' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>
                            proyecto
                        </div>
                        <div style={{ flex: 1, padding: '5px', borderRadius: '4px', background: activeTab === 'ejecucion' ? 'white' : 'transparent', textAlign: 'center', fontSize: '10px', fontWeight: activeTab === 'ejecucion' ? 700 : 500, color: activeTab === 'ejecucion' ? 'var(--primary-700)' : 'var(--gray-600)', boxShadow: activeTab === 'ejecucion' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>
                            ejecucion
                        </div>
                        <div style={{ flex: 1, padding: '5px', borderRadius: '4px', background: activeTab === 'chat' ? 'white' : 'transparent', textAlign: 'center', fontSize: '10px', fontWeight: activeTab === 'chat' ? 700 : 500, color: activeTab === 'chat' ? 'var(--primary-700)' : 'var(--gray-600)', boxShadow: activeTab === 'chat' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>
                            chat
                        </div>
                    </div>

                    {/* Tab Content 1: PROYECTO */}
                    {activeTab === 'proyecto' && (
                        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fadeIn">
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 4px' }}>
                                    <Package size={12} color="var(--primary-500)" /> Descripción
                                </h3>
                                <p style={{ fontSize: '10px', color: 'var(--gray-600)', lineHeight: 1.4, margin: 0 }}>
                                    Eliminación de escalón en vereda y construcción de rampa de cemento.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 4px' }}>
                                    <Target size={12} color="var(--primary-500)" /> Objetivo
                                </h3>
                                <p style={{ fontSize: '10px', color: 'var(--gray-600)', lineHeight: 1.4, margin: 0 }}>
                                    Eliminar el escalón para permitir el paso de sillas de ruedas.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 4px' }}>
                                    <CheckCircle size={12} color="var(--primary-500)" /> Acciones Previstas
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9.5px', color: 'var(--gray-600)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Circle size={4} style={{ fill: 'var(--gray-400)', stroke: 'none' }} />
                                        <span>Conseguir materiales</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Circle size={4} style={{ fill: 'var(--gray-400)', stroke: 'none' }} />
                                        <span>Preparar mezcla</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Circle size={4} style={{ fill: 'var(--gray-400)', stroke: 'none' }} />
                                        <span>Construir rampa de cemento</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content 2: EJECUCION */}
                    {activeTab === 'ejecucion' && (
                        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-fadeIn">
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', marginBottom: '2px' }}>Checklist de Avance</div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                                <CheckCircle size={14} color="var(--success-500)" />
                                <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', fontSize: '10px' }}>
                                    Conseguir materiales
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                                <CheckCircle size={14} color="var(--success-500)" />
                                <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', fontSize: '10px' }}>
                                    Preparar mezcla
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid var(--gray-300)', minWidth: '14px' }} />
                                <span style={{ color: 'var(--gray-700)', fontSize: '10px' }}>
                                    Construir rampa de cemento
                                </span>
                            </div>

                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray-400)', marginBottom: '4px' }}>Bitácora de Avance</div>
                                <div style={{ fontSize: '8.5px', color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <div>📅 12:00 · Materiales comprados y listos en vereda.</div>
                                    <div>📅 13:30 · Mezcla de cemento preparada en el lugar.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content 3: CHAT */}
                    {activeTab === 'chat' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px', overflow: 'hidden' }} className="animate-fadeIn">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                                {showMsg1 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--gray-100)', padding: '6px 8px', borderRadius: '6px 6px 6px 0', maxWidth: '210px', fontSize: '10px', lineHeight: 1.3 }}>
                                        <strong>Mesa MVD:</strong> ¡Bienvenidos! Organizamos la jornada para el sábado a las 9hs.
                                    </div>
                                )}
                                {showMsg2 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '6px 8px', borderRadius: '6px 6px 0 6px', alignSelf: 'flex-end', maxWidth: '210px', fontSize: '10px', lineHeight: 1.3 }}>
                                        <strong>Juan:</strong> Perfecto. Yo consigo las herramientas necesarias.
                                    </div>
                                )}
                                {showMsg3 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '6px 8px', borderRadius: '6px 6px 0 6px', alignSelf: 'flex-end', maxWidth: '210px', fontSize: '10px', lineHeight: 1.3 }}>
                                        <strong>Tú:</strong> ¡Excelente! Yo ayudo a colocar el cemento el sábado.
                                    </div>
                                )}
                            </div>
                            {/* Fake input message bar */}
                            <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '4px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                <span style={{ color: 'var(--gray-400)', fontSize: '9.5px' }}>{time >= 76.5 ? "Mensaje enviado..." : "Escribir mensaje..."}</span>
                                <MessageSquare size={10} color="var(--primary-500)" />
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Scene 4: Resolver e Impactar (80s - 100s)
        if (time >= 80 && time <= 100) {
            const isT3Done = time >= 83.6;
            const isResolved = time >= 87.1;

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
                        padding: '16px'
                    }}>
                        <div className="scale-pulse" style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '14px'
                        }}>
                            <CheckCircle size={36} color="var(--white)" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>¡Resuelto!</h3>
                        <p style={{ fontSize: '10px', opacity: 0.9, maxWidth: '200px', margin: 0, lineHeight: 1.3 }}>
                            La rampa en Av. Italia está terminada y habilitada.
                        </p>

                        <div style={{
                            marginTop: '14px',
                            fontSize: '9px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '4px 10px',
                            borderRadius: '3px',
                            fontWeight: 600
                        }}>
                            Estado: FINALIZADO
                        </div>
                    </div>
                );
            }

            return (
                <div style={{ height: '100%', background: 'var(--white)', display: 'flex', flexDirection: 'column', fontSize: '11px', textAlign: 'left' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-800)', color: 'white', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>Proyecto Rampa Av. Italia</span>
                        <Settings size={14} />
                    </div>

                    {/* Tab Navigation Menu */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-100)', padding: '4px' }}>
                        <div style={{ flex: 1, padding: '4px', textAlign: 'center', fontSize: '10px', color: 'var(--gray-500)' }}>
                            proyecto
                        </div>
                        <div style={{ flex: 1, padding: '4px', borderRadius: '4px', background: 'white', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--primary-700)', boxShadow: 'var(--shadow-sm)' }}>
                            ejecucion
                        </div>
                        <div style={{ flex: 1, padding: '4px', textAlign: 'center', fontSize: '10px', color: 'var(--gray-500)' }}>
                            chat
                        </div>
                    </div>

                    {/* Task checklist */}
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Title button resolution (Only for Referente role) */}
                        {isT3Done && (
                            <button style={{
                                background: 'var(--success-500)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                marginBottom: '6px',
                                animation: 'pulseBtn 1s infinite alternate'
                            }}>
                                <CheckCircle size={10} /> Marcar como Resuelto
                            </button>
                        )}

                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', marginBottom: '2px' }}>Checklist de Avance</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                            <CheckCircle size={14} color="var(--success-500)" />
                            <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', fontSize: '10px' }}>
                                Conseguir materiales
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                            <CheckCircle size={14} color="var(--success-500)" />
                            <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', fontSize: '10px' }}>
                                Preparar mezcla
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {isT3Done ? <CheckCircle size={14} color="var(--success-500)" /> : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid var(--gray-300)', minWidth: '14px' }} />}
                            </span>
                            <span style={{ textDecoration: isT3Done ? 'line-through' : 'none', color: isT3Done ? 'var(--gray-400)' : 'var(--gray-700)', fontSize: '10px' }}>
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
                    max-width: 960px;
                    margin: 0 auto;
                }

                .video-screen {
                    min-height: 600px;
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    align-items: center;
                    padding: 32px;
                    gap: 48px;
                    position: relative;
                    background: radial-gradient(circle at 70% 30%, #0f172a 0%, #020617 100%);
                }

                /* Smartphone frame mockup */
                .phone-frame {
                    width: 280px;
                    height: 520px;
                    border: 10px solid #0f172a;
                    border-radius: 40px;
                    background: #000;
                    box-shadow: 0 0 0 1px #334155, 0 25px 50px rgba(0,0,0,0.6);
                    position: relative;
                    overflow: hidden;
                    margin: 0 auto;
                }

                .phone-screen {
                    width: 100%;
                    height: 100%;
                    border-radius: 30px;
                    overflow: hidden;
                    background: #fff;
                    position: relative;
                }

                /* Animations */
                @keyframes pulseBtn {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                .v-logo-float { animation: floatLogo 3s ease-in-out infinite alternate; }
                @keyframes floatLogo { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }

                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

                /* Fullscreen styles */
                .video-container:fullscreen {
                    max-width: 100% !important;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justifyContent: space-between;
                    background: #020617;
                    border: none;
                    border-radius: 0;
                    box-shadow: none;
                    padding: 0;
                }

                .video-container:fullscreen .video-screen {
                    flex: 1;
                    min-height: 0;
                    height: 100%;
                    padding: 40px 80px;
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    align-items: center;
                    background: radial-gradient(circle at 70% 30%, #0f172a 0%, #020617 100%);
                }
                
                .video-container:fullscreen .info-column h2 {
                    font-size: 2.2rem !important;
                }

                .video-container:fullscreen .info-column p {
                    font-size: 1.15rem !important;
                    line-height: 1.6 !important;
                }
            `}</style>

            <div className="container" style={{ maxWidth: '920px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 6px' }}>
                        ¿Cómo funciona <span className="text-gradient">REDDIS</span>?
                    </h1>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)', margin: 0 }}>
                        Mirá este video didáctico interactivo para conocer los objetivos y el uso de la app paso a paso.
                    </p>
                </div>

                {/* Video Explainer Player Card */}
                <div ref={containerRef} className="video-container">
                    
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
                                    title="Reiniciar video"
                                >
                                    <RotateCcw size={14} />
                                </button>
                                
                                <button
                                    onClick={toggleFullscreen}
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
                                    aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                                    title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                                >
                                    {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
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
