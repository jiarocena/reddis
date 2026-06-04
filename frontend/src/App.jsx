import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import TopBar from './components/Layout/TopBar';
import BottomNav from './components/Layout/BottomNav';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import BarrerasPage from './pages/BarrerasPage';
import MapPage from './pages/MapPage';
import ReportPage from './pages/ReportPage';
import BarrierDetailPage from './pages/BarrierDetailPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmPage from './pages/ConfirmPage';
import ProfilePage from './pages/ProfilePage';
import PendingBarriersPage from './pages/PendingBarriersPage';
import ProyectosListPage from './pages/ProyectosListPage';
import MisProyectosPage from './pages/MisProyectosPage';

function Toast() {
    const { toast } = useData();
    if (!toast) return null;
    return (
        <div className={`toast toast-${toast.type}`}>
            {toast.message}
        </div>
    );
}

function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, loading, hasRole } = useAuth();

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>;

    if (!isAuthenticated) return <Navigate to="/gestion" replace />;

    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Acceso restringido</h2>
                <p style={{ color: 'var(--gray-500)' }}>No tenés permisos para acceder a esta sección.</p>
            </div>
        );
    }

    return children;
}

// After login, redirect to target or default
function GestionLoginRedirect() {
    const { isAuthenticated, loading } = useAuth();
    const [searchParams] = useSearchParams();
    const redirectParam = searchParams.get('redirect') || '/';
    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>;
    if (isAuthenticated) return <Navigate to={redirectParam} replace />;
    return <LoginPage redirectTo={redirectParam} />;
}

function GestionRegisterRedirect() {
    const { isAuthenticated, loading } = useAuth();
    const [searchParams] = useSearchParams();
    const redirectParam = searchParams.get('redirect') || '/reportar';
    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>;
    if (isAuthenticated) return <Navigate to={redirectParam} replace />;
    return <RegisterPage redirectTo={redirectParam} />;
}

function AppContent() {
    const location = useLocation();
    const { isAuthenticated, hasRole, refreshUser } = useAuth();
    const { refreshData } = useData();
    const isGestion = location.pathname.startsWith('/gestion');
    const isDetailPage = /^\/(barrera|proyecto)\//.test(location.pathname);

    const [installPrompt, setInstallPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) {
            setInstallPrompt(null);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        setInstallPrompt(null);
    };

    // Poll backend every 8 seconds to automatically update role request approvals in real-time
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            refreshUser();
            refreshData(true);
        }, 8000);

        return () => clearInterval(interval);
    }, [isAuthenticated, refreshUser, refreshData]);

    // Show administrative layout only if user is on a /gestion path AND is authenticated AND is at least a COLABORADOR
    const showGestionLayout = isGestion && isAuthenticated && hasRole('COLABORADOR');

    return (
        <>
            {/* Gestion mode: keep the old Navbar */}
            {showGestionLayout && <Navbar mode="gestion" />}

            {/* Public mode: TopBar */}
            {!showGestionLayout && <TopBar />}

            <main className={`app-main ${!showGestionLayout ? 'has-bottom-nav' : ''}`}>
                <Routes>
                    {/* ═══ PUBLIC ROUTES ═══ */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/barreras" element={<MapPage />} />
                    <Route path="/mapa" element={<Navigate to="/barreras" replace />} />
                    <Route path="/reportar" element={<ReportPage />} />
                    <Route path="/barrera/:id" element={<BarrierDetailPage />} />
                    <Route path="/proyecto/:id" element={<ProjectDetailPage />} />
                    <Route path="/acerca" element={<AboutPage />} />
                    <Route path="/participar" element={<LoginPage redirectTo="/gestion/mapa" />} />

                    {/* ═══ GESTION (STAFF) ROUTES ═══ */}
                    <Route path="/gestion" element={<GestionLoginRedirect />} />
                    <Route path="/gestion/registro" element={<GestionRegisterRedirect />} />
                    <Route path="/gestion/confirmar" element={<ConfirmPage />} />
                    <Route path="/gestion/mapa" element={
                        <ProtectedRoute><MapPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/pendientes" element={
                        <ProtectedRoute requiredRole="REFERENTE"><PendingBarriersPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/admin" element={
                        <ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/perfil" element={
                        <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/mis-proyectos" element={
                        <ProtectedRoute><MisProyectosPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/reportar" element={
                        <ProtectedRoute><ReportPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/barreras" element={
                        <ProtectedRoute><MapPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/proyectos" element={<ProyectosListPage />} />
                    <Route path="/gestion/barrera/:id" element={
                        <ProtectedRoute><BarrierDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/proyecto/:id" element={
                        <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>
                    } />

                    {/* Legacy routes → redirect */}
                    <Route path="/login" element={<Navigate to="/gestion" replace />} />
                    <Route path="/registro" element={<Navigate to="/gestion/registro" replace />} />
                    <Route path="/confirmar" element={<Navigate to="/gestion/confirmar" replace />} />
                    <Route path="/pendientes" element={<Navigate to="/gestion/pendientes" replace />} />
                    <Route path="/admin" element={<Navigate to="/gestion/admin" replace />} />
                    <Route path="/perfil" element={<Navigate to="/gestion/perfil" replace />} />
                </Routes>

                {/* Install App Promotion */}
                {installPrompt && (
                    <div style={{
                        padding: '1.25rem var(--space-6)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'var(--white)',
                        borderTop: '1px solid var(--gray-200)',
                        textAlign: 'center',
                        gap: '0.5rem',
                        marginTop: '2rem'
                    }} className="animate-fadeIn">
                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: 0 }}>
                            ¿Querés acceder más rápido? Instalá REDDIS en tu pantalla de inicio.
                        </p>
                        <button
                            onClick={handleInstallClick}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                maxWidth: '350px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '0.65rem 1.25rem',
                                fontSize: '0.85rem',
                                borderRadius: 'var(--radius-lg)'
                            }}
                        >
                            Instalar app
                        </button>
                    </div>
                )}
            </main>

            {/* Bottom nav for public mode only */}
            <BottomNav />

            <Toast />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <DataProvider>
                    <AppContent />
                </DataProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
