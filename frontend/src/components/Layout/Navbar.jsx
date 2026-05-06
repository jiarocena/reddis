import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Menu, X, MapPin, FileText, PlusCircle, Shield, Info, Network,
    LogIn, UserPlus, User, LogOut, Clock, List, Briefcase
} from 'lucide-react';

export default function Navbar({ mode = 'public' }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, hasRole, logout } = useAuth();
    const navigate = useNavigate();
    const isGestion = mode === 'gestion';

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/gestion');
    };

    // Prefix for links based on mode
    const prefix = isGestion ? '/gestion' : '';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to={isGestion ? '/gestion/mapa' : '/'} className="navbar-brand">
                    <div className="navbar-brand-icon">
                        <Network size={20} />
                    </div>
                    REDDIS
                    {isGestion && <span className="navbar-mode-badge">Gestión</span>}
                </Link>

                <button className="navbar-mobile-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
                    {/* ═══ PUBLIC MODE ═══ */}
                    {!isGestion && (
                        <>
                            <li>
                                <NavLink to="/" end onClick={() => setIsOpen(false)}>
                                    <FileText size={16} /> Inicio
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/mapa" onClick={() => setIsOpen(false)}>
                                    <MapPin size={16} /> Mapa
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/reportar" onClick={() => setIsOpen(false)}>
                                    <PlusCircle size={16} /> Reportar
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/acerca" onClick={() => setIsOpen(false)}>
                                    <Info size={16} /> Acerca
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* ═══ GESTION MODE ═══ */}
                    {isGestion && isAuthenticated && (
                        <>
                            <li>
                                <NavLink to="/gestion/mapa" onClick={() => setIsOpen(false)}>
                                    <MapPin size={16} /> Mapa
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/gestion/reportar" onClick={() => setIsOpen(false)}>
                                    <PlusCircle size={16} /> Reportar
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/gestion/barreras" onClick={() => setIsOpen(false)}>
                                    <List size={16} /> Barreras
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/gestion/proyectos" onClick={() => setIsOpen(false)}>
                                    <Briefcase size={16} /> Proyectos
                                </NavLink>
                            </li>
                            {hasRole('REFERENTE') && (
                                <li>
                                    <NavLink to="/gestion/pendientes" onClick={() => setIsOpen(false)}>
                                        <Clock size={16} /> Pendientes
                                    </NavLink>
                                </li>
                            )}
                            {hasRole('ADMIN') && (
                                <li>
                                    <NavLink to="/gestion/admin" onClick={() => setIsOpen(false)}>
                                        <Shield size={16} /> Admin
                                    </NavLink>
                                </li>
                            )}
                        </>
                    )}

                    {/* ═══ AUTH SECTION (only in gestion mode) ═══ */}
                    {isGestion && (
                        <>
                            <li className="navbar-auth-divider"></li>
                            {isAuthenticated ? (
                                <>
                                    <li>
                                        <NavLink to="/gestion/perfil" onClick={() => setIsOpen(false)}
                                            className="navbar-user-link">
                                            <User size={16} />
                                            <span className="navbar-user-name">
                                                {user?.nombre?.split(' ')[0]}
                                            </span>
                                            <span className="navbar-user-role">{user?.rol}</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <button className="navbar-logout-btn" onClick={handleLogout}>
                                            <LogOut size={16} /> Salir
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <NavLink to="/gestion" end onClick={() => setIsOpen(false)}>
                                            <LogIn size={16} /> Ingresar
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/gestion/registro" onClick={() => setIsOpen(false)}
                                            className="navbar-register-link">
                                            <UserPlus size={16} /> Registrarse
                                        </NavLink>
                                    </li>
                                </>
                            )}
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
