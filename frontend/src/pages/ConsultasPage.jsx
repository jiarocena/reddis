import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
    HelpCircle, Search, Plus, ArrowLeft, MessageSquare, Send, 
    Calendar, User, Tag, HelpCircle as AskIcon, Lightbulb, MessageCircle 
} from 'lucide-react';

export default function ConsultasPage() {
    const { consultas, addConsulta, addRespuesta, loading } = useData();
    const { user } = useAuth();
    
    // States
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL'); // ALL, PREGUNTA, PROPUESTA, CONSULTA
    const [activeConsultaId, setActiveConsultaId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    // Create Form States
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('PREGUNTA');
    const [submittingConsulta, setSubmittingConsulta] = useState(false);
    
    // Reply Form States
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    // Helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-UY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'PROPUESTA':
                return { bg: 'var(--success-50)', text: 'var(--success-600)', icon: Lightbulb };
            case 'PREGUNTA':
                return { bg: 'var(--primary-50)', text: 'var(--primary-600)', icon: AskIcon };
            case 'CONSULTA':
            default:
                return { bg: 'var(--barrier-actitudinal)', bgAlpha: '#fff7ed', text: '#c2410c', icon: MessageCircle };
        }
    };

    // Filtered list
    const filteredConsultas = (consultas || []).filter(c => {
        const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
        const matchesSearch = !search || 
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.content?.toLowerCase().includes(search.toLowerCase()) ||
            c.userName?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const activeConsulta = (consultas || []).find(c => String(c.id) === String(activeConsultaId));

    const handleCreateConsulta = async (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        setSubmittingConsulta(true);
        try {
            const res = await addConsulta(newTitle, newContent, newCategory);
            if (res) {
                setNewTitle('');
                setNewContent('');
                setNewCategory('PREGUNTA');
                setShowCreateForm(false);
            }
        } finally {
            setSubmittingConsulta(false);
        }
    };

    const handleCreateReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || !activeConsultaId) return;

        setSubmittingReply(true);
        try {
            const res = await addRespuesta(activeConsultaId, replyContent);
            if (res) {
                setReplyContent('');
            }
        } finally {
            setSubmittingReply(false);
        }
    };

    return (
        <div className="pending-page animate-fadeIn" style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-4)' }}>
            
            {/* VISTA DETALLE */}
            {activeConsultaId && activeConsulta ? (
                <div>
                    <button 
                        onClick={() => setActiveConsultaId(null)}
                        className="btn"
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: 'var(--gray-100)', 
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--space-4)'
                        }}
                    >
                        <ArrowLeft size={16} /> Volver al listado
                    </button>

                    {/* Pregunta principal */}
                    <div style={{
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--gray-200)',
                        padding: 'var(--space-6)',
                        boxShadow: 'var(--shadow-sm)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--space-3)' }}>
                            {(() => {
                                const styles = getCategoryStyles(activeConsulta.category);
                                const CatIcon = styles.icon;
                                return (
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        background: styles.bgAlpha || styles.bg, 
                                        color: styles.text, 
                                        padding: '4px 10px', 
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-xs)',
                                        fontWeight: 600
                                    }}>
                                        <CatIcon size={12} /> {activeConsulta.category}
                                    </span>
                                );
                            })()}
                            
                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} /> {formatDate(activeConsulta.createdAt)}
                            </span>
                        </div>

                        <h2 style={{ color: 'var(--primary-900)', fontSize: 'var(--font-xl)', fontWeight: 700, margin: '0 0 var(--space-4) 0' }}>
                            {activeConsulta.title}
                        </h2>

                        <p style={{ 
                            color: 'var(--gray-700)', 
                            fontSize: 'var(--font-base)', 
                            lineHeight: 1.6, 
                            whiteSpace: 'pre-wrap',
                            margin: '0 0 var(--space-6) 0' 
                        }}>
                            {activeConsulta.content}
                        </p>

                        <div style={{ 
                            borderTop: '1px solid var(--gray-100)', 
                            paddingTop: 'var(--space-4)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px' 
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-700)',
                                fontWeight: 700,
                                fontSize: 'var(--font-xs)'
                            }}>
                                <span style={{ margin: '0 auto' }}>{(activeConsulta.userName || 'U').charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--gray-800)' }}>
                                    {activeConsulta.userName}
                                </p>
                                <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--gray-500)' }}>
                                    @{activeConsulta.username || 'usuario'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Respuestas / Foro */}
                    <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--primary-900)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={20} /> Respuestas ({activeConsulta.respuestas?.length || 0})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                        {activeConsulta.respuestas && activeConsulta.respuestas.length > 0 ? (
                            activeConsulta.respuestas.map((rep) => (
                                <div key={rep.id} style={{
                                    background: 'var(--white)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--gray-200)',
                                    padding: 'var(--space-4)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--gray-800)' }}>
                                                {rep.userName}
                                            </span>
                                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)' }}>
                                                @{rep.username}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-400)' }}>
                                            {formatDate(rep.createdAt)}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: 'var(--font-sm)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                        {rep.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div style={{ 
                                background: 'var(--gray-50)', 
                                border: '1px dashed var(--gray-300)', 
                                borderRadius: 'var(--radius-lg)', 
                                padding: 'var(--space-6)',
                                textAlign: 'center',
                                color: 'var(--gray-500)' 
                            }}>
                                Ninguna respuesta todavía. ¡Sé el primero en responder!
                            </div>
                        )}
                    </div>

                    {/* Formulario de respuesta */}
                    <form onSubmit={handleCreateReply} style={{
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--gray-200)',
                        padding: 'var(--space-4)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                            <label className="form-label" style={{ fontWeight: 600 }}>Escribir respuesta</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                required
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                placeholder="Escribe tu respuesta, aporte o propuesta sobre esta consulta..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                className="btn btn-primary" 
                                type="submit" 
                                disabled={submittingReply}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Send size={14} /> {submittingReply ? 'Enviando...' : 'Enviar respuesta'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : showCreateForm ? (
                // VISTA FORMULARIO CREAR CONSULTA
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <button 
                        onClick={() => setShowCreateForm(false)}
                        className="btn"
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: 'var(--gray-100)', 
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--space-4)'
                        }}
                    >
                        <ArrowLeft size={16} /> Cancelar y volver
                    </button>

                    <div style={{
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--gray-200)',
                        padding: 'var(--space-6)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h2 style={{ color: 'var(--primary-900)', fontSize: 'var(--font-xl)', fontWeight: 700, margin: '0 0 var(--space-4) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle color="var(--primary-500)" /> Crear Nueva Consulta
                        </h2>

                        <form onSubmit={handleCreateConsulta}>
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="form-label">Tipo de consulta</label>
                                <select 
                                    className="form-select"
                                    value={newCategory} 
                                    onChange={e => setNewCategory(e.target.value)}
                                >
                                    <option value="PREGUNTA">❓ Pregunta (Dudas o consultas generales)</option>
                                    <option value="PROPUESTA">💡 Propuesta (Ideas para mejorar la accesibilidad)</option>
                                    <option value="CONSULTA">💬 Consulta (Consultas específicas sobre proyectos)</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="form-label">Título</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="Ej: ¿Cuándo finalizan las rampas de la plaza central?"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                                <label className="form-label">Contenido o descripción</label>
                                <textarea 
                                    className="form-input" 
                                    rows={6} 
                                    required 
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    placeholder="Explica detalladamente tu pregunta, propuesta o consulta..."
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    className="btn" 
                                    onClick={() => setShowCreateForm(false)}
                                    style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={submittingConsulta}
                                >
                                    {submittingConsulta ? 'Publicando...' : 'Publicar consulta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                // VISTA PRINCIPAL (LISTADO)
                <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: 'var(--space-6)' }}>
                        <div>
                            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--primary-900)' }}>
                                <HelpCircle size={28} color="var(--primary-500)" /> Consultas y Propuestas
                            </h1>
                            <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-sm)', marginTop: '0.25rem' }}>
                                Foro comunitario para realizar preguntas, proponer mejoras o evacuar dudas.
                            </p>
                        </div>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setShowCreateForm(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)' }}
                        >
                            <Plus size={16} /> Nueva Consulta
                        </button>
                    </div>

                    {/* Filtros y Buscador */}
                    <div style={{ 
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--gray-200)',
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-3)'
                    }}>
                        {/* Buscador */}
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Buscar en consultas..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>

                        {/* Categorías */}
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {[
                                { id: 'ALL', label: 'Todo' },
                                { id: 'PREGUNTA', label: '❓ Preguntas' },
                                { id: 'PROPUESTA', label: '💡 Propuestas' },
                                { id: 'CONSULTA', label: '💬 Consultas' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    style={{
                                        border: 'none',
                                        background: selectedCategory === cat.id ? 'var(--primary-600)' : 'var(--gray-100)',
                                        color: selectedCategory === cat.id ? 'var(--white)' : 'var(--gray-700)',
                                        padding: '6px 14px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-sm)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Listado de Consultas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {loading ? (
                            <div style={{ 
                                padding: '3rem 1.5rem', 
                                background: 'var(--white)', 
                                borderRadius: 'var(--radius-xl)', 
                                border: '1px solid var(--gray-200)', 
                                textAlign: 'center' 
                            }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ margin: 0, color: 'var(--gray-500)', fontWeight: 500 }}>Cargando foro...</p>
                            </div>
                        ) : filteredConsultas.length === 0 ? (
                            <div style={{ 
                                padding: '3rem 1.5rem', 
                                background: 'var(--white)', 
                                borderRadius: 'var(--radius-xl)', 
                                border: '1px solid var(--gray-200)', 
                                textAlign: 'center',
                                color: 'var(--gray-500)'
                            }}>
                                <HelpCircle size={40} color="var(--gray-300)" style={{ marginBottom: '1rem' }} />
                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--gray-700)' }}>No se encontraron consultas</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-sm)' }}>Sé el primero en realizar una pregunta o propuesta.</p>
                            </div>
                        ) : (
                            filteredConsultas.map((c) => {
                                const styles = getCategoryStyles(c.category);
                                const CatIcon = styles.icon;
                                return (
                                    <div 
                                        key={c.id} 
                                        onClick={() => setActiveConsultaId(c.id)}
                                        style={{
                                            background: 'var(--white)',
                                            borderRadius: 'var(--radius-xl)',
                                            border: '1px solid var(--gray-200)',
                                            padding: 'var(--space-5)',
                                            cursor: 'pointer',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                        }}
                                        className="project-card" // Utiliza hover effects de las cartas de proyectos
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: '8px' }}>
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px',
                                                background: styles.bgAlpha || styles.bg, 
                                                color: styles.text, 
                                                padding: '2px 8px', 
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--font-xs)',
                                                fontWeight: 600
                                            }}>
                                                <CatIcon size={10} /> {c.category}
                                            </span>
                                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} /> {formatDate(c.createdAt)}
                                            </span>
                                        </div>

                                        <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--font-base)', fontWeight: 700, margin: '0 0 var(--space-2) 0', lineHeight: 1.4 }}>
                                            {c.title}
                                        </h3>

                                        <p style={{ 
                                            color: 'var(--gray-600)', 
                                            fontSize: 'var(--font-sm)', 
                                            margin: '0 0 var(--space-4) 0',
                                            lineHeight: 1.5,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {c.content}
                                        </p>

                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            borderTop: '1px solid var(--gray-100)', 
                                            paddingTop: 'var(--space-3)',
                                            flexWrap: 'wrap',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <User size={12} /> {c.userName || 'Usuario'} (@{c.username || 'usuario'})
                                            </span>

                                            <span style={{ 
                                                fontSize: 'var(--font-xs)', 
                                                fontWeight: 600, 
                                                color: 'var(--primary-600)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: 'var(--primary-50)',
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-md)'
                                            }}>
                                                <MessageSquare size={12} /> {c.respuestas?.length || 0} respuesta{c.respuestas?.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
