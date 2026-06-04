import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, DEPARTAMENTOS } from '../data/seedData';
import { ArrowLeft, ArrowRight, CheckCircle, MapPin, AlertTriangle, Users, Building, Camera, X, Map, LogIn } from 'lucide-react';
import LocationPicker from '../components/Map/LocationPicker';

export default function ReportPage() {
    const { addBarrier } = useData();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    // User's department (locked)
    const userDepto = user?.departamento || '';

    const [formData, setFormData] = useState({
        type: 'estructural',
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
        departamento: userDepto,
        localidad: '',
    });

    // Keep departamento synced with user
    if (formData.departamento !== userDepto && userDepto) {
        setFormData(prev => ({ ...prev, departamento: userDepto }));
    }

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
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.category !== '';
            case 2: return formData.title && formData.description && formData.address && formData.departamento;
            default: return true;
        }
    };

    const totalSteps = 2;

    // Auth loading
    if (authLoading) {
        return (
            <div className="report-page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <p style={{ color: 'var(--gray-400)' }}>Cargando...</p>
            </div>
        );
    }

    // Not authenticated — show login/register prompt
    if (!isAuthenticated) {
        return (
            <div className="auth-page animate-fadeIn">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-icon" style={{ background: '#fef3c7' }}>
                        <AlertTriangle size={28} color="#d97706" />
                    </div>
                    <h1>Ingresá para reportar</h1>
                    <p style={{ color: 'var(--gray-500)', margin: '1rem 0 1.5rem' }}>
                        Para reportar una barrera necesitás tener una cuenta.
                        Así podemos asociar tu reporte a tu departamento.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <Link to="/gestion" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                            <LogIn size={18} /> Iniciar Sesión
                        </Link>
                        <Link to="/gestion/registro" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                            Crear Cuenta
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="report-page">
            <h1>Reportar una Barrera</h1>
            <p className="subtitle">Tu reporte es el primer paso hacia la solución. Completá el formulario para registrar la barrera.</p>





            {/* Step 1: Category */}
            {step === 1 && (
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

            {/* Step 2: Details */}
            {step === 2 && (
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Departamento</label>
                            <input
                                type="text"
                                className="form-input"
                                value={userDepto}
                                disabled
                                style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', cursor: 'not-allowed' }}
                            />
                            <small style={{ color: 'var(--gray-400)', fontSize: '0.7rem' }}>
                                Asignado según tu cuenta
                            </small>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Localidad</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.localidad}
                                onChange={(e) => updateField('localidad', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">*</label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Seleccioná la ubicación en el mapa..."
                                value={formData.address}
                                readOnly
                                style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', cursor: 'not-allowed' }}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm map-btn"
                                onClick={() => setShowMap(true)}
                                title="Seleccionar en el mapa"
                            >
                                <Map size={16} /> Ubicación
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



                    {/* Honeypot anti-bot — invisible to humans */}
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
                        <input type="text" name="website" tabIndex={-1} autoComplete="off"
                            value={formData.website || ''}
                            onChange={(e) => updateField('website', e.target.value)} />
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
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}
                            style={{ marginTop: 'var(--space-6)', width: '100%' }}>
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
            {/* Map Picker Modal */}
            {showMap && (
                <LocationPicker
                    location={formData.location}
                    userDepartamento={userDepto}
                    onLocationChange={(loc) => updateField('location', loc)}
                    onAddressChange={(addr) => updateField('address', addr)}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    );
}
