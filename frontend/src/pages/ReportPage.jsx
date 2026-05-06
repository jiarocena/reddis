import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CATEGORIES } from '../data/seedData';
import { ArrowLeft, ArrowRight, CheckCircle, MapPin, AlertTriangle, Users, Building, Camera, X, Map } from 'lucide-react';
import LocationPicker from '../components/Map/LocationPicker';

export default function ReportPage() {
    const { addBarrier } = useData();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        type: '',
        category: '',
        title: '',
        description: '',
        address: '',
        location: { lat: null, lng: null },
        affectedPeople: '',
        urgency: 'media',
        reportedBy: '',
        isPublic: true,
        photoBase64: null,
    });

    function compressImage(file, maxWidth = 800) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const compressed = await compressImage(file);
        setPhotoPreview(compressed);
        updateField('photoBase64', compressed);
    }

    function removePhoto() {
        setPhotoPreview(null);
        updateField('photoBase64', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const barrier = await addBarrier(formData);
        if (barrier) {
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 5000);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.type !== '';
            case 2: return formData.category !== '';
            case 3: return formData.title && formData.description && formData.address;
            default: return true;
        }
    };

    const totalSteps = formData.type === 'individual' ? 4 : 3;

    return (
        <div className="report-page">
            <h1>Reportar una Barrera</h1>
            <p className="subtitle">Tu reporte es el primer paso hacia la solución. Completá el formulario para registrar la barrera.</p>

            {/* Progress Steps */}
            <div className="form-steps">
                {['Tipo', 'Categoría', 'Detalle', ...(formData.type === 'individual' ? ['Privacidad'] : [])].map((label, i) => (
                    <div key={i} className={`form-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}>
                        <div className="form-step-number">
                            {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                        </div>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Type */}
            {step === 1 && (
                <div className="animate-fadeIn">
                    <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>
                        ¿Qué tipo de barrera querés reportar?
                    </h3>
                    <div className="type-selector">
                        <div
                            className={`type-option ${formData.type === 'estructural' ? 'selected' : ''}`}
                            onClick={() => updateField('type', 'estructural')}
                        >
                            <div className="type-option-icon">🏛️</div>
                            <h3>Estructural</h3>
                            <p>Vinculada a un lugar o institución (edificio, servicio, espacio público)</p>
                        </div>
                        <div
                            className={`type-option ${formData.type === 'individual' ? 'selected' : ''}`}
                            onClick={() => updateField('type', 'individual')}
                        >
                            <div className="type-option-icon">👤</div>
                            <h3>Necesidad Individual</h3>
                            <p>Vinculada a una persona específica (ayuda técnica, empleo, rehabilitación)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Category */}
            {step === 2 && (
                <div className="animate-fadeIn">
                    <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>
                        ¿Qué tipo de barrera es?
                    </h3>
                    <div className="category-grid">
                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                            <div
                                key={key}
                                className={`category-option ${formData.category === key ? `selected-${key}` : ''}`}
                                onClick={() => updateField('category', key)}
                            >
                                <div className={`category-dot category-dot-${key}`}></div>
                                <div>
                                    <strong style={{ fontSize: 'var(--font-sm)' }}>{cat.label}</strong>
                                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-500)', margin: 0 }}>{cat.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
                <div className="animate-fadeIn">
                    <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>
                        Describí la barrera
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Título *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Escuela sin rampa de acceso"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción detallada *</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describí la barrera con el mayor detalle posible: qué pasa, dónde, cómo afecta..."
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                            Ubicación / Dirección *
                        </label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Calle 18 de Julio esq. Rivera, Trinidad"
                                value={formData.address}
                                onChange={(e) => updateField('address', e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm map-btn"
                                onClick={() => setShowMap(true)}
                                title="Seleccionar en el mapa"
                            >
                                <Map size={16} /> Mapa
                            </button>
                        </div>
                        {formData.location?.lat && (
                            <small className="coords-display">
                                📍 Coordenadas: {formData.location.lat.toFixed(5)}, {formData.location.lng.toFixed(5)}
                            </small>
                        )}
                    </div>

                    {/* Photo Capture */}
                    <div className="form-group">
                        <label className="form-label">
                            <Camera size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                            Foto de la barrera
                        </label>
                        {photoPreview ? (
                            <div className="photo-preview">
                                <img src={photoPreview} alt="Vista previa" />
                                <button className="photo-remove-btn" onClick={removePhoto}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <Camera size={32} />
                                <p>Tocá para sacar una foto o elegir de la galería</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">¿A quiénes afecta?</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Personas con movilidad reducida"
                                value={formData.affectedPeople}
                                onChange={(e) => updateField('affectedPeople', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Urgencia</label>
                            <select
                                className="form-select"
                                value={formData.urgency}
                                onChange={(e) => updateField('urgency', e.target.value)}
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">¿Quién reporta?</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Vecino del barrio, Familiar, Organización..."
                            value={formData.reportedBy}
                            onChange={(e) => updateField('reportedBy', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Privacy (individual only) */}
            {step === 4 && formData.type === 'individual' && (
                <div className="animate-fadeIn">
                    <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>
                        Privacidad
                    </h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-sm)' }}>
                        Como esta es una necesidad individual, podés elegir si la publicación aparece en el mapa
                        público o queda solo para gestión interna.
                    </p>

                    <div className="type-selector">
                        <div
                            className={`type-option ${formData.isPublic ? 'selected' : ''}`}
                            onClick={() => updateField('isPublic', true)}
                        >
                            <div className="type-option-icon">🌐</div>
                            <h3>Publicar en el mapa</h3>
                            <p>La barrera será visible públicamente (solo con los datos que autorices)</p>
                        </div>
                        <div
                            className={`type-option ${!formData.isPublic ? 'selected' : ''}`}
                            onClick={() => updateField('isPublic', false)}
                        >
                            <div className="type-option-icon">🔒</div>
                            <h3>Gestión interna</h3>
                            <p>Solo la referente departamental de MIDES podrá ver este reporte</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)' }}>
                {step > 1 ? (
                    <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                        <ArrowLeft size={16} /> Anterior
                    </button>
                ) : <div />}

                {step < totalSteps ? (
                    <button
                        className="btn btn-primary"
                        onClick={() => setStep(step + 1)}
                        disabled={!canProceed()}
                        style={{ opacity: canProceed() ? 1 : 0.5 }}
                    >
                        Siguiente <ArrowRight size={16} />
                    </button>
                ) : (
                    <button
                        className="btn btn-success btn-lg"
                        onClick={handleSubmit}
                        disabled={!canProceed()}
                        style={{ opacity: canProceed() ? 1 : 0.5 }}
                    >
                        <CheckCircle size={18} /> Enviar Reporte
                    </button>
                )}
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-modal">
                        <div className="success-icon">
                            <CheckCircle size={36} />
                        </div>
                        <h2>¡Reporte recibido!</h2>
                        <p style={{ marginBottom: '0.5rem' }}>
                            Tu barrera ha sido registrada exitosamente.
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                            Será analizada por un referente departamental y, una vez evaluada, se publicará en el mapa.
                            ¡Gracias por contribuir a la inclusión!
                        </p>
                    </div>
                </div>
            )}
            {/* Map Picker Modal */}
            {showMap && (
                <LocationPicker
                    location={formData.location}
                    onLocationChange={(loc) => updateField('location', loc)}
                    onAddressChange={(addr) => updateField('address', addr)}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    );
}
