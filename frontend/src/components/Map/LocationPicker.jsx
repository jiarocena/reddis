import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Navigation, X, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import { DEPARTAMENTOS } from '../../data/seedData';

// Custom marker icon for the selected point
const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Component that handles click events on the map
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

// Component to fly the map to a location
function FlyTo({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 14, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
}

export default function LocationPicker({ location, userDepartamento, onLocationChange, onAddressChange, onClose }) {
    const [marker, setMarker] = useState(
        location?.lat && location?.lng ? [location.lat, location.lng] : null
    );
    const [flyTarget, setFlyTarget] = useState(null);
    const [locating, setLocating] = useState(false);
    const [reverseAddress, setReverseAddress] = useState('');
    const [isLocationValid, setIsLocationValid] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    // Get user's department center
    const deptoData = DEPARTAMENTOS.find(d => d.nombre === userDepartamento);
    const defaultCenter = deptoData ? deptoData.center : [-32.5228, -55.7658]; // fallback to Uruguay Center
    const center = marker || defaultCenter;

    // Try to get user location on mount, matching user department checks
    useEffect(() => {
        if (location?.lat && location?.lng) {
            setFlyTarget([location.lat, location.lng]);
        } else {
            handleGeolocate();
        }
    }, []);

    function handleGeolocate() {
        if (!navigator.geolocation) {
            // Default center if no geolocation
            setFlyTarget(defaultCenter);
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                let isInside = false;
                try {
                    // Quick high-level reverse geocode to verify department
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
                        { headers: { 'Accept-Language': 'es' } }
                    );
                    const data = await res.json();
                    const addressStr = JSON.stringify(data.address || {}).toLowerCase();
                    const deptoNameLower = userDepartamento?.toLowerCase() || '';
                    isInside = addressStr.includes(deptoNameLower);
                } catch {
                    // Fallback to false if Nominatim fails
                }

                if (isInside) {
                    setFlyTarget([lat, lng]);
                } else {
                    // GPS is outside department, center on the user's department center instead
                    setFlyTarget(defaultCenter);
                }
                setLocating(false);
            },
            () => {
                setFlyTarget(defaultCenter);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    async function handleLocationSelect(latlng) {
        setIsValidating(true);
        setIsLocationValid(true);

        const pos = [latlng.lat, latlng.lng];
        setMarker(pos);
        onLocationChange({ lat: latlng.lat, lng: latlng.lng });

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'es' } }
            );
            const data = await res.json();
            if (data.display_name) {
                setReverseAddress(data.display_name);
                onAddressChange(data.display_name);
            }

            // Enforce department boundary check
            const addressStr = JSON.stringify(data.address || {}).toLowerCase();
            const deptoNameLower = userDepartamento?.toLowerCase() || '';

            if (userDepartamento && !addressStr.includes(deptoNameLower)) {
                setIsLocationValid(false);
            } else {
                setIsLocationValid(true);
            }
        } catch {
            // Safe fallback: allow if API fails
            setIsLocationValid(true);
        } finally {
            setIsValidating(false);
        }
    }

    function handleConfirm() {
        if (isLocationValid) {
            onClose();
        }
    }

    return (
        <div className="location-picker-overlay">
            <div className="location-picker-modal">
                <div className="location-picker-header">
                    <h3><MapPin size={18} /> Seleccionar ubicación</h3>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <p className="location-picker-hint">
                    Tocá en el mapa para marcar la ubicación exacta de la barrera dentro del departamento de <strong>{userDepartamento || 'tu cuenta'}</strong>.
                </p>

                <div className="location-picker-map">
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onLocationSelect={handleLocationSelect} />
                        {flyTarget && <FlyTo position={flyTarget} />}
                        {marker && <Marker position={marker} icon={selectedIcon} />}
                    </MapContainer>
                </div>

                {/* Validation Warning Container */}
                {!isLocationValid && (
                    <div style={{
                        color: 'var(--danger-500)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--font-sm)',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertTriangle size={16} />
                        <span>La ubicación debe estar dentro de tu departamento asignado (<strong>{userDepartamento}</strong>).</span>
                    </div>
                )}

                <div className="location-picker-controls">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleGeolocate}
                        disabled={locating}
                    >
                        <Navigation size={14} />
                        {locating ? 'Buscando...' : 'Mi ubicación'}
                    </button>

                    {marker && (
                        <div className="location-picker-coords">
                            <span>📍 {marker[0].toFixed(5)}, {marker[1].toFixed(5)}</span>
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleConfirm}
                        disabled={!marker || !isLocationValid || isValidating}
                        style={{ opacity: (marker && isLocationValid && !isValidating) ? 1 : 0.5 }}
                    >
                        <MapPin size={14} /> {isValidating ? 'Validando...' : 'Confirmar ubicación'}
                    </button>
                </div>

                {reverseAddress && (
                    <div className="location-picker-address">
                        <small>📫 {reverseAddress}</small>
                    </div>
                )}
            </div>
        </div>
    );
}
