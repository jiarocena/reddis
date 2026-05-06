import { useLocation } from 'react-router-dom';
import { Network, Home, MapPin, AlertTriangle, Users, Info } from 'lucide-react';

const PAGE_TITLES = {
    '/': { title: 'REDDIS', subtitle: 'Red Digital de Inclusión Social', icon: Network },
    '/barreras': { title: 'Barreras', subtitle: 'Mapa y listado de barreras reportadas', icon: MapPin },
    '/mapa': { title: 'Mapa de Barreras', subtitle: 'Departamento de Flores', icon: MapPin },
    '/reportar': { title: 'Reportar Barrera', subtitle: 'Identificá una barrera de accesibilidad', icon: AlertTriangle },
    '/acerca': { title: 'Acerca de REDDIS', subtitle: 'Información del proyecto', icon: Info },
};

export default function TopBar() {
    const location = useLocation();
    const isGestion = location.pathname.startsWith('/gestion');

    // Don't show on gestion routes or detail routes
    if (isGestion) return null;

    const page = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];
    const Icon = page.icon;

    return (
        <header className="top-bar">
            <div className="top-bar-inner">
                <div className="top-bar-icon">
                    <Icon size={20} />
                </div>
                <div>
                    <h1 className="top-bar-title">{page.title}</h1>
                    <p className="top-bar-subtitle">{page.subtitle}</p>
                </div>
            </div>
        </header>
    );
}
