import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, MapPin, AlertTriangle, Users, LogIn } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const isGestion = location.pathname.startsWith('/gestion');

    // Don't show on gestion routes once authenticated (they have their own navigation)
    if (isGestion && isAuthenticated) return null;

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
            {isAuthenticated ? (
                <NavLink to="/gestion/perfil" className="bottom-nav-item">
                    <Users size={20} />
                    <span>Mi Cuenta</span>
                </NavLink>
            ) : (
                <NavLink to="/gestion" className="bottom-nav-item">
                    <LogIn size={20} />
                    <span>Ingresar</span>
                </NavLink>
            )}
        </nav>
    );
}
