import { Link } from 'react-router-dom';
import { MapPin, Clock, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { CATEGORIES, PROJECT_STATUSES } from '../../data/seedData';

export default function BarrierCard({ barrier, compact = false }) {
    const category = CATEGORIES[barrier.category];
    const status = PROJECT_STATUSES[barrier.status];

    return (
        <Link to={`/barrera/${barrier.id}`} style={{ textDecoration: 'none' }}>
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
                    <span className={`badge badge-${barrier.type}`}>
                        {barrier.type === 'estructural' ? '🏛️' : '👤'} {barrier.type === 'estructural' ? 'Estructural' : 'Individual'}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {barrier.date}
                    </span>
                </div>
            </div>
        </Link>
    );
}
