import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Play, Pause, RotateCcw, Volume2, ArrowRight,
    MapPin, Users, CheckCircle, MessageSquare, Settings, 
    Sparkles, PlusCircle, Shield, Network, Info, Smartphone, Film
} from 'lucide-react';

const TOTAL_DURATION = 50; // Total duration of the simulated video in seconds

const NARRATOR_TRANSCRIPTS = [
    { start: 0, end: 8, text: "¡Bienvenidos a REDDIS! La Red Digital de Inclusión Social. Una plataforma colaborativa donde los ciudadanos, referentes y organizaciones se unen para identificar y eliminar barreras de accesibilidad en nuestras comunidades. Veamos cómo funciona en el día a día." },
    { start: 8, end: 18, text: "Paso 1: Identificar y Reportar. Cuando te encuentres con una barrera, como la falta de una rampa, tomás una foto y la reportás en segundos. El sistema registra tu ubicación automáticamente y la posiciona de forma visible en el mapa público." },
    { start: 18, end: 28, text: "Paso 2: Evaluar y Organizar. El referente departamental recibe el reporte, valida la información y crea un proyecto público para su resolución. Así, el problema se formaliza y se establece un plan de acción concreto." },
    { start: 28, end: 40, text: "Paso 3: Colaborar en Equipo. ¡Cualquier persona u organización puede sumarse a colaborar de inmediato! Dentro del proyecto, se abre un chat en tiempo real para coordinar esfuerzos y un muro para registrar los compromisos." },
    { start: 40, end: 50, text: "Paso 4: Resolver e Impactar. A medida que avanzan los trabajos, se marcan las tareas completadas. Al finalizar, la barrera se declara Resuelta. El caso queda documentado como éxito y las estadísticas de inclusión del departamento se actualizan." }
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
    const currentScene = Math.min(Math.floor(time / 10), 4);
    const sceneTitles = [
        "Introducción",
        "1. Reportar Barrera",
        "2. Crear Proyecto",
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

    // Calculate cursor positions dynamically based on time to simulate clicks
    const getCursorStyle = () => {
        let left = -100;
        let top = -100;
        let opacity = 0;
        let scale = 1;
        let transition = "none";

        // Scene 1: Click "Reportar Barrera"
        if (time >= 8.2 && time < 9.5) {
            // Move cursor from bottom right to button
            const t = (time - 8.2) / 1.3;
            left = 140 - (140 - 75) * t;
            top = 220 - (220 - 130) * t;
            opacity = 1;
            transition = "none";
        } else if (time >= 9.5 && time < 10.0) {
            // Click effect
            left = 75;
            top = 130;
            opacity = 1;
            scale = 0.8;
            transition = "transform 0.1s ease";
        } else if (time >= 13.8 && time < 14.8) {
            // Move to Enviar button
            const t = (time - 13.8) / 1.0;
            left = 75 + (100 - 75) * t;
            top = 130 + (220 - 130) * t;
            opacity = 1;
        } else if (time >= 14.8 && time < 15.3) {
            // Click Enviar
            left = 100;
            top = 220;
            opacity = 1;
            scale = 0.8;
            transition = "transform 0.1s ease";
        }
        // Scene 2: Click "Aprobar"
        else if (time >= 20.0 && time < 21.2) {
            const t = (time - 20.0) / 1.2;
            left = 150 - (150 - 120) * t;
            top = 230 - (230 - 85) * t;
            opacity = 1;
        } else if (time >= 21.2 && time < 21.7) {
            left = 120;
            top = 85;
            opacity = 1;
            scale = 0.8;
            transition = "transform 0.1s ease";
        }
        // Scene 3: Click "Colaborar"
        else if (time >= 29.5 && time < 30.8) {
            const t = (time - 29.5) / 1.3;
            left = 50 + (100 - 50) * t;
            top = 220 - (220 - 140) * t;
            opacity = 1;
        } else if (time >= 30.8 && time < 31.4) {
            left = 100;
            top = 140;
            opacity = 1;
            scale = 0.8;
            transition = "transform 0.1s ease";
        }
        // Scene 4: Click "Marcar como Resuelto"
        else if (time >= 42.5 && time < 43.8) {
            const t = (time - 42.5) / 1.3;
            left = 40 + (110 - 40) * t;
            top = 80 + (165 - 80) * t;
            opacity = 1;
        } else if (time >= 43.8 && time < 44.4) {
            left = 110;
            top = 165;
            opacity = 1;
            scale = 0.8;
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
            background: 'rgba(245, 158, 11, 0.8)',
            border: '2px solid white',
            boxShadow: '0 0 8px rgba(0,0,0,0.5)',
            zIndex: 999,
            pointerEvents: 'none'
        };
    };

    // Helper to render the interactive UI inside the simulated smartphone screen
    const renderPhoneScreen = () => {
        // Scene 0: Introduction (0s - 8s)
        if (time >= 0 && time < 8) {
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
                        fontSize: '0.55rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)'
                    }}>
                        Demo explicativa v1.0
                    </div>
                </div>
            );
        }

        // Scene 1: Reportar Barrera (8s - 18s)
        if (time >= 8 && time < 18) {
            const isFormView = time >= 10 && time < 15.5;
            const isSuccessView = time >= 15.5;

            if (isFormView) {
                const typedTitle = getTypedText("Rampa bloqueada", 10.2, 1.8);
                const showTypeSelected = time >= 12.2;
                const showLocation = time >= 13.0;

                return (
                    <div style={{
                        height: '100%',
                        background: 'var(--gray-50)',
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: '9px',
                        color: 'var(--gray-800)',
                        position: 'relative'
                    }}>
                        {/* Header */}
                        <div style={{ background: 'var(--white)', padding: '8px', borderBottom: '1px solid var(--gray-200)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <PlusCircle size={10} color="var(--primary-500)" />
                            <span>Reportar Barrera</span>
                        </div>
                        {/* Form Body */}
                        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '2px', color: 'var(--gray-500)' }}>Título</label>
                                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '3px', borderRadius: '3px', minHeight: '14px', fontSize: '8px' }}>
                                    {typedTitle}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '2px', color: 'var(--gray-500)' }}>Tipo de Barrera</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ 
                                        padding: '2px 4px', 
                                        borderRadius: '2px', 
                                        border: showTypeSelected ? '1px solid var(--barrier-fisica)' : '1px solid var(--gray-300)',
                                        background: showTypeSelected ? '#fef2f2' : 'var(--white)',
                                        color: showTypeSelected ? 'var(--barrier-fisica)' : 'var(--gray-500)',
                                        fontSize: '7px',
                                        fontWeight: 600
                                    }}>Física</span>
                                    <span style={{ padding: '2px 4px', borderRadius: '2px', border: '1px solid var(--gray-300)', background: 'var(--white)', color: 'var(--gray-400)', fontSize: '7px' }}>Visual</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '2px', color: 'var(--gray-500)' }}>Ubicación</label>
                                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-300)', padding: '3px', borderRadius: '3px', color: showLocation ? 'var(--gray-700)' : 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '7.5px' }}>
                                    <MapPin size={8} />
                                    <span>{showLocation ? "Av. Italia 2450, MVD" : "Obteniendo ubicación..."}</span>
                                </div>
                            </div>
                            <button style={{
                                marginTop: '10px',
                                background: 'var(--primary-600)',
                                color: 'white',
                                border: 'none',
                                padding: '4px',
                                borderRadius: '3px',
                                fontWeight: 700,
                                fontSize: '8px'
                            }}>
                                Enviar Reporte
                            </button>
                        </div>
                    </div>
                );
            }

            if (isSuccessView) {
                const showMapPin = time >= 16.5;
                return (
                    <div style={{
                        height: '100%',
                        background: '#e0f2fe',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '9px',
                        color: 'var(--gray-800)'
                    }}>
                        {/* Simulated Map View */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: '#e2e8f0',
                            backgroundImage: 'radial-gradient(var(--gray-300) 1px, transparent 0), radial-gradient(var(--gray-300) 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 8px 8px'
                        }} />
                        
                        {/* Map lines */}
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                            <line x1="0" y1="120" x2="200" y2="120" stroke="var(--white)" strokeWidth="8" />
                            <line x1="80" y1="0" x2="80" y2="300" stroke="var(--white)" strokeWidth="8" />
                        </svg>

                        {showMapPin && (
                            <div className="bouncing-pin" style={{
                                position: 'absolute',
                                left: '80px',
                                top: '120px',
                                color: 'var(--barrier-fisica)',
                                transform: 'translate(-50%, -100%)',
                                zIndex: 10
                            }}>
                                <MapPin size={24} fill="rgba(239, 68, 68, 0.3)" />
                                <div className="pin-radar" />
                            </div>
                        )}

                        {/* Top banner success */}
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            right: '8px',
                            background: 'var(--white)',
                            border: '1px solid var(--success-200)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: 'var(--shadow-md)',
                            zIndex: 100
                        }}>
                            <CheckCircle size={10} color="var(--success-500)" />
                            <span style={{ fontWeight: 600, fontSize: '7.5px' }}>¡Reporte publicado en el mapa!</span>
                        </div>
                    </div>
                );
            }

            // Normal Home View (8s - 10s)
            return (
                <div style={{
                    height: '100%',
                    background: 'var(--white)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '9px',
                    color: 'var(--gray-800)'
                }}>
                    {/* Fake Navbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid var(--gray-200)' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>REDDIS</span>
                        <Network size={10} color="var(--primary-500)" />
                    </div>
                    {/* Content */}
                    <div style={{ padding: '10px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ background: 'var(--primary-50)', padding: '12px 6px', borderRadius: '4px' }}>
                            <h3 style={{ margin: '0 0 2px', fontSize: '10px', color: 'var(--primary-900)' }}>Comunidad sin barreras</h3>
                            <p style={{ fontSize: '7px', color: 'var(--gray-500)', margin: 0 }}>Reportá barreras de accesibilidad hoy mismo.</p>
                        </div>
                        <button style={{
                            background: 'var(--accent-500)',
                            color: 'white',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px'
                        }}>
                            <PlusCircle size={8} /> Reportar Barrera
                        </button>
                    </div>
                </div>
            );
        }

        // Scene 2: Evaluar y Organizar (18s - 28s)
        if (time >= 18 && time < 28) {
            const isApproved = time >= 21.5;
            return (
                <div style={{
                    height: '100%',
                    background: 'var(--gray-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '9px',
                    color: 'var(--gray-800)'
                }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-800)', color: 'white', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Gestión Referente</span>
                        <Shield size={10} />
                    </div>

                    {/* Pending list */}
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '7.5px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', textAlign: 'left' }}>
                            Reportes entrantes
                        </div>
                        
                        <div style={{
                            background: 'white',
                            border: '1px solid var(--gray-200)',
                            borderRadius: '4px',
                            padding: '6px',
                            textAlign: 'left',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                <span style={{ fontWeight: 700, fontSize: '8px' }}>Rampa bloqueada</span>
                                <span style={{ 
                                    fontSize: '6.5px', 
                                    padding: '1px 3px', 
                                    borderRadius: '2px',
                                    background: isApproved ? 'var(--success-50)' : 'var(--warning-50)',
                                    color: isApproved ? 'var(--success-600)' : 'var(--warning-600)',
                                    fontWeight: 700
                                }}>
                                    {isApproved ? "APROBADO" : "PENDIENTE"}
                                </span>
                            </div>
                            <p style={{ fontSize: '7px', color: 'var(--gray-500)', margin: '0 0 6px' }}>
                                Av. Italia 2450 — Física
                            </p>
                            
                            {!isApproved && (
                                <button style={{
                                    background: 'var(--success-500)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '3px 6px',
                                    borderRadius: '2px',
                                    fontWeight: 600,
                                    fontSize: '7px',
                                    cursor: 'pointer'
                                }}>
                                    Aprobar y Crear Proyecto
                                </button>
                            )}
                        </div>

                        {isApproved && (
                            <div style={{
                                background: 'white',
                                border: '1px solid var(--primary-100)',
                                borderRadius: '4px',
                                padding: '6px',
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                marginTop: '4px'
                            }} className="animate-fadeIn">
                                <div style={{ fontWeight: 700, fontSize: '8px', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Settings size={8} />
                                    <span>Proyecto Creado</span>
                                </div>
                                <div style={{ fontSize: '7px', color: 'var(--gray-600)' }}>
                                    <strong>Nombre:</strong> Proyecto Rampa Av. Italia
                                </div>
                                <div style={{ fontSize: '7px', color: 'var(--gray-600)' }}>
                                    <strong>Referente:</strong> Mesa Montevideo
                                </div>
                                <span style={{
                                    fontSize: '6px',
                                    alignSelf: 'flex-start',
                                    padding: '1px 3px',
                                    borderRadius: '2px',
                                    background: 'var(--primary-50)',
                                    color: 'var(--primary-600)',
                                    fontWeight: 700
                                }}>
                                    INICIANDO
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Scene 3: Colaborar en Chat (28s - 40s)
        if (time >= 28 && time < 40) {
            const isCollaborator = time >= 31.0;
            const showMsg1 = time >= 32.5;
            const showMsg2 = time >= 35.5;
            const showMsg3 = time >= 38.0;

            return (
                <div style={{
                    height: '100%',
                    background: 'var(--gray-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '9px',
                    color: 'var(--gray-800)'
                }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-600)', color: 'white', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontWeight: 700, fontSize: '8px' }}>Proyecto Rampa Av. Italia</span>
                            <span style={{ fontSize: '6px', opacity: 0.8 }}>3 Colaboradores</span>
                        </div>
                        <Users size={10} />
                    </div>

                    {/* Join screen or Chat view */}
                    {!isCollaborator ? (
                        <div style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-50)',
                                color: 'var(--primary-500)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyStyle: 'center',
                                margin: '0 auto'
                            }}>
                                <Users size={16} style={{ margin: 'auto' }} />
                            </div>
                            <div style={{ fontWeight: 700 }}>¿Querés colaborar?</div>
                            <p style={{ fontSize: '7.5px', color: 'var(--gray-500)', margin: 0 }}>Sumate al equipo del proyecto y coordiná en el chat.</p>
                            <button style={{
                                background: 'var(--accent-500)',
                                color: 'white',
                                border: 'none',
                                padding: '5px',
                                borderRadius: '3px',
                                fontWeight: 700,
                                fontSize: '8px',
                                marginTop: '4px'
                            }}>
                                Sumarse a Colaborar
                            </button>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px' }}>
                            {/* Chat messages */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                                {showMsg1 && (
                                    <div className="animate-fadeInUp" style={{ background: 'white', border: '1px solid var(--gray-200)', padding: '4px 6px', borderRadius: '4px 4px 4px 0', maxWidth: '140px', fontSize: '7px' }}>
                                        <strong>Referente:</strong> Hola equipo, gracias por sumarse.
                                    </div>
                                )}
                                {showMsg2 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '4px 6px', borderRadius: '4px 4px 0 4px', alignSelf: 'flex-end', maxWidth: '140px', fontSize: '7px' }}>
                                        <strong>Juan:</strong> Yo llevo la bolsa de cemento el sábado.
                                    </div>
                                )}
                                {showMsg3 && (
                                    <div className="animate-fadeInUp" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '4px 6px', borderRadius: '4px 4px 0 4px', alignSelf: 'flex-end', maxWidth: '140px', fontSize: '7px' }}>
                                        <strong>Ana:</strong> Yo ayudo a colocar las maderas.
                                    </div>
                                )}
                            </div>
                            
                            {/* Message input */}
                            <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '3px', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-400)', fontSize: '7px' }}>Escribí un mensaje...</span>
                                <MessageSquare size={8} color="var(--gray-400)" />
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Scene 4: Resolver Barrera (40s - 50s)
        if (time >= 40 && time <= 50) {
            const isT1Done = time >= 41.0;
            const isT2Done = time >= 42.0;
            const isT3Done = time >= 43.0;
            const isResolved = time >= 44.5;

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
                            width: '48px',
                            height: '48px',
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
                        <p style={{ fontSize: '7.5px', opacity: 0.9, maxWidth: '140px', margin: 0 }}>
                            La barrera física en Av. Italia ha sido eliminada con éxito.
                        </p>

                        <div style={{
                            marginTop: '12px',
                            fontSize: '7px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '3px 8px',
                            borderRadius: '2px',
                            fontWeight: 600
                        }}>
                            +1 Logro Comunitario
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
                <div style={{
                    height: '100%',
                    background: 'var(--white)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '9px',
                    color: 'var(--gray-800)'
                }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary-600)', color: 'white', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>Tareas de Resolución</span>
                        <CheckCircle size={10} />
                    </div>

                    {/* Task checklist */}
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <div style={{ fontSize: '7.5px', fontWeight: 700, color: 'var(--gray-500)', marginBottom: '2px' }}>Checklist</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {isT1Done ? <CheckCircle size={10} color="var(--success-500)" /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid var(--gray-300)' }} />}
                            </span>
                            <span style={{ textDecoration: isT1Done ? 'line-through' : 'none', color: isT1Done ? 'var(--gray-400)' : 'var(--gray-700)', fontSize: '8px' }}>
                                Coordinar materiales
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {isT2Done ? <CheckCircle size={10} color="var(--success-500)" /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid var(--gray-300)' }} />}
                            </span>
                            <span style={{ textDecoration: isT2Done ? 'line-through' : 'none', color: isT2Done ? 'var(--gray-400)' : 'var(--gray-700)', fontSize: '8px' }}>
                                Preparar encofrado
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {isT3Done ? <CheckCircle size={10} color="var(--success-500)" /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid var(--gray-300)' }} />}
                            </span>
                            <span style={{ textDecoration: isT3Done ? 'line-through' : 'none', color: isT3Done ? 'var(--gray-400)' : 'var(--gray-700)', fontSize: '8px' }}>
                                Construir rampa de cemento
                            </span>
                        </div>

                        {isT3Done && (
                            <button style={{
                                background: 'var(--success-500)',
                                color: 'white',
                                border: 'none',
                                padding: '4px',
                                borderRadius: '3px',
                                fontWeight: 700,
                                fontSize: '8px',
                                marginTop: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px'
                            }}>
                                <CheckCircle size={8} /> Marcar como Resuelto
                            </button>
                        )}
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
                    height: 400px;
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
                        height: 480px;
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

                /* Dynamic subtitles */
                .video-subtitles {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                    right: 12px;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 10px 16px;
                    border-radius: var(--radius-xl);
                    color: #e2e8f0;
                    font-size: 0.82rem;
                    line-height: 1.4;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                /* Sound Equalizer waves */
                .eq-bar-container {
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    height: 14px;
                    width: 20px;
                }
                .eq-bar {
                    width: 3px;
                    height: 2px;
                    background: var(--accent-400);
                    border-radius: 1px;
                }
                .eq-active .eq-bar:nth-child(1) { animation: eqJump 0.8s ease-in-out infinite alternate; }
                .eq-active .eq-bar:nth-child(2) { animation: eqJump 0.5s ease-in-out infinite alternate 0.1s; }
                .eq-active .eq-bar:nth-child(3) { animation: eqJump 0.9s ease-in-out infinite alternate 0.2s; }
                .eq-active .eq-bar:nth-child(4) { animation: eqJump 0.6s ease-in-out infinite alternate 0.05s; }

                @keyframes eqJump {
                    0% { height: 2px; }
                    100% { height: 14px; }
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
                        Mirá este video animado explicativo para conocer los objetivos y el uso práctico de la app.
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

                    {/* Main Screen Content */}
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
                                {currentScene === 2 && "Los referentes departamentales crean proyectos específicos y los abren a la comunidad."}
                                {currentScene === 3 && "Participá activamente en chats dedicados a coordinar acciones concretas."}
                                {currentScene === 4 && "Registrá el éxito de la barrera resuelta y ayudá a documentar casos testigo."}
                            </p>
                            
                            {/* Speech Wave Equalizer */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                <div className={`eq-bar-container ${isPlaying ? 'eq-active' : ''}`}>
                                    <div className="eq-bar" />
                                    <div className="eq-bar" />
                                    <div className="eq-bar" />
                                    <div className="eq-bar" />
                                </div>
                                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Audio del Narrador</span>
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

                        {/* Narrator Transcripts Box (Subtitles) */}
                        <div className="video-subtitles">
                            <Volume2 size={16} style={{ minWidth: '16px', marginRight: '10px', color: 'var(--accent-400)' }} />
                            <span>{currentTranscript}</span>
                        </div>
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
                            <span style={{ fontSize: '0.72rem', color: '#64748b', width: '30px' }}>
                                0:{TOTAL_DURATION}
                            </span>
                        </div>

                        {/* Player Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                {[0, 10, 20, 30, 40].map((s, idx) => (
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
