import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, MapPin, PlusCircle, Users, LogIn, Handshake, Briefcase } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const { isAuthenticated, hasRole } = useAuth();
    const isGestion = location.pathname.startsWith('/gestion');

    // Don't show on gestion routes once authenticated as at least a REFERENTE
    const showGestionLayout = isGestion && isAuthenticated && hasRole('REFERENTE');
    if (showGestionLayout) return null;

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
                <PlusCircle size={22} />
                <span>Reportar</span>
            </NavLink>
            <NavLink to="/gestion/proyectos" className="bottom-nav-item">
                <Handshake size={20} />
                <span>Colaborar</span>
            </NavLink>
            {isAuthenticated ? (
                <NavLink to="/gestion/mis-proyectos" className="bottom-nav-item">
                    <Briefcase size={20} />
                    <span>Proyectos</span>
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
