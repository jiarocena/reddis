import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, PROJECT_STATUSES } from '../../data/seedData';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createColoredIcon(status) {
    const colors = {
        denuncia: '#fbbf24',
        iniciando: '#60a5fa',
        'en-proceso': '#3b82f6',
        finalizado: '#10b981',
    };
    const color = colors[status] || '#fbbf24';

    return L.divIcon({
        className: '',
        html: `
      <div style="
        width: 28px; height: 28px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px; height: 8px;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
        "></div>
      </div>
    `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });
}

function MapBounds({ barriers }) {
    const map = useMap();
    const hasZoomed = useRef(false);

    useEffect(() => {
        if (barriers.length > 0 && !hasZoomed.current) {
            const bounds = L.latLngBounds(barriers.map(b => [b.location.lat, b.location.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
            hasZoomed.current = true;
        }
    }, [barriers, map]);

    return null;
}

export default function InteractiveMap({ barriers, selectedBarrierId, onMarkerClick, compact = false }) {
    const center = [-33.5432, -56.8998]; // Trinidad, Flores
    const location = useLocation();
    const prefix = location.pathname.startsWith('/gestion') ? '/gestion' : '';

    const filteredBarriers = barriers.filter(b => b.isPublic);

    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ width: '100%', height: '100%', minHeight: compact ? '300px' : '500px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBounds barriers={filteredBarriers} />
            {filteredBarriers.map(barrier => (
                <Marker
                    key={barrier.id}
                    position={[barrier.location.lat, barrier.location.lng]}
                    icon={createColoredIcon(barrier.status)}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(barrier.id),
                    }}
                >
                    <Popup>
                        <div style={{ minWidth: '200px' }}>
                            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                                {barrier.title}
                            </strong>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <span className={`badge badge-${barrier.category}`}>
                                    {CATEGORIES[barrier.category]?.label}
                                </span>
                                <span className={`badge badge-${barrier.status}`}>
                                    {PROJECT_STATUSES[barrier.status]?.label || barrier.status}
                                </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px' }}>
                                {barrier.address}
                            </p>
                            <Link
                                to={`${prefix}/barrera/${barrier.id}`}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '11px' }}
                            >
                                Ver detalle
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
