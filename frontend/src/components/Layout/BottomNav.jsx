import { NavLink, useLocation } from 'react-router-dom';
import { Home, MapPin, AlertTriangle, Users } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');

    // Don't show on gestion routes (they have their own navigation)
    if (isGestion) return null;

    return (
        <nav className="bottom-nav">
            <NavLink to="/" end className="bottom-nav-item">
                <Home size={20} />
                <span>Inicio</span>
            </NavLink>
            <NavLink to="/barreras" className="bottom-nav-item">
                <MapPin size={20} />
                <span>Barreras</span>
            </NavLink>
            <NavLink to="/reportar" className="bottom-nav-item">
                <AlertTriangle size={20} />
                <span>Reportar</span>
            </NavLink>
            <NavLink to="/gestion" className="bottom-nav-item">
                <Users size={20} />
                <span>Participar</span>
            </NavLink>
        </nav>
    );
}
