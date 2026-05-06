import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Navigation, X } from 'lucide-react';
import L from 'leaflet';

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
            map.flyTo(position, 16, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
}

export default function LocationPicker({ location, onLocationChange, onAddressChange, onClose }) {
    const [marker, setMarker] = useState(
        location?.lat && location?.lng ? [location.lat, location.lng] : null
    );
    const [flyTarget, setFlyTarget] = useState(null);
    const [locating, setLocating] = useState(false);
    const [reverseAddress, setReverseAddress] = useState('');

    // Default center: Trinidad, Flores
    const defaultCenter = [-33.5415, -56.8965];
    const center = marker || defaultCenter;

    // Try to get user location on mount
    useEffect(() => {
        handleGeolocate();
    }, []);

    function handleGeolocate() {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setFlyTarget([latlng.lat, latlng.lng]);
                setLocating(false);
            },
            () => {
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    async function reverseGeocode(lat, lng) {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'es' } }
            );
            const data = await res.json();
            if (data.display_name) {
                setReverseAddress(data.display_name);
                return data.display_name;
            }
        } catch {
            // Nominatim might be down
        }
        return null;
    }

    async function handleLocationSelect(latlng) {
        const pos = [latlng.lat, latlng.lng];
        setMarker(pos);
        onLocationChange({ lat: latlng.lat, lng: latlng.lng });

        // Reverse geocode
        const address = await reverseGeocode(latlng.lat, latlng.lng);
        if (address) {
            onAddressChange(address);
        }
    }

    function handleConfirm() {
        onClose();
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
                    Tocá en el mapa para marcar la ubicación exacta de la barrera
                </p>

                <div className="location-picker-map">
                    <MapContainer
                        center={center}
                        zoom={14}
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
                        disabled={!marker}
                        style={{ opacity: marker ? 1 : 0.5 }}
                    >
                        <MapPin size={14} /> Confirmar ubicación
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
