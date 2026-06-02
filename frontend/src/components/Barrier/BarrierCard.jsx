import { Link, useLocation } from 'react-router-dom';
import { MapPin, Clock, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { CATEGORIES, PROJECT_STATUSES } from '../../data/seedData';

export default function BarrierCard({ barrier, compact = false }) {
    const category = CATEGORIES[barrier.category];
    const status = PROJECT_STATUSES[barrier.status];
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');
    const linkTo = isGestion ? `/gestion/barrera/${barrier.id}` : `/barrera/${barrier.id}`;

    return (
        <Link to={linkTo} style={{ textDecoration: 'none' }}>
            <div className="barrier-card">
                <div className="barrier-card-header">
                    <h4>{barrier.title}</h4>
                    {barrier.urgency === 'alta' && (
                        <span className="badge badge-urgente">
                            <AlertTriangle size={10} /> Urgente
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${barrier.category}`}>
                        {category?.label}
                    </span>
                    <span className={`badge badge-${barrier.status}`}>
                        {status?.label}
                    </span>
                </div>
                {!compact && (
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '8px' }}>
                        {barrier.description.substring(0, 120)}...
                    </p>
                )}
                <div className="barrier-card-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {barrier.address}
                    </span>
                    {barrier.departamento && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-500)' }}>
                            📍 {barrier.departamento}{barrier.localidad ? ` — ${barrier.localidad}` : ''}
                        </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {barrier.date}
                    </span>
                </div>
            </div>
        </Link>
    );
}
