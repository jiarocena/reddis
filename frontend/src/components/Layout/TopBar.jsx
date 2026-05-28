import { useLocation } from 'react-router-dom';
import { Network, Home, MapPin, AlertTriangle, Users, Info, LogIn, UserPlus, User, Handshake } from 'lucide-react';

const PAGE_TITLES = {
    '/': { title: 'REDDIS', subtitle: 'Red Digital de Inclusión Social', icon: Network },
    '/barreras': { title: 'Mapa de Barreras', subtitle: 'Barreras reportadas en Uruguay', icon: MapPin },
    '/reportar': { title: 'Reportar Barrera', subtitle: 'Identificá una barrera de accesibilidad', icon: AlertTriangle },
    '/participar': { title: 'Participar', subtitle: 'Participar o colaborar en un proyecto', icon: Users },
    '/acerca': { title: 'Acerca de REDDIS', subtitle: 'Información del proyecto', icon: Info },
    '/gestion': { title: 'Iniciar Sesión', subtitle: 'Accedé a tu cuenta REDDIS', icon: LogIn },
    '/gestion/registro': { title: 'Crear Cuenta', subtitle: 'Registrate para reportar y colaborar', icon: UserPlus },
    '/gestion/confirmar': { title: 'Confirmar Cuenta', subtitle: 'Verificá tu dirección de correo', icon: Info },
    '/gestion/perfil': { title: 'Mi Cuenta', subtitle: 'Detalles de tu cuenta REDDIS', icon: User },
    '/gestion/proyectos': { title: 'Proyectos Colaborativos', subtitle: 'Sumate a colaborar en proyectos activos', icon: Handshake },
};

export default function TopBar() {
    const location = useLocation();

    let page = PAGE_TITLES[location.pathname];

    if (!page) {
        if (location.pathname.startsWith('/barrera/')) {
            page = { title: 'Barrera reportada', subtitle: 'Detalle de la barrera de accesibilidad', icon: AlertTriangle };
        } else if (location.pathname.startsWith('/proyecto/')) {
            page = { title: 'Proyecto de resolución', subtitle: 'Detalle del proyecto colaborativo', icon: Users };
        } else {
            page = PAGE_TITLES['/'];
        }
    }

    const Icon = page.icon;

    return (
        <header className="top-bar">
            <div className="top-bar-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="top-bar-icon">
                        <Icon size={20} />
                    </div>
                    <div>
                        <h1 className="top-bar-title">{page.title}</h1>
                        <p className="top-bar-subtitle">{page.subtitle}</p>
                    </div>
                </div>
                <div className="top-bar-logo">
                    <span className="top-bar-logo-yellow">Comunidad</span>
                    <span className="top-bar-logo-white">sin barreras</span>
                </div>
            </div>
        </header>
    );
}
