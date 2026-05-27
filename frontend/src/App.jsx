import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import BarrerasListPage from './pages/BarrerasListPage';
import ProyectosListPage from './pages/ProyectosListPage';

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

// After login, redirect to /
function GestionLoginRedirect() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>;
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <LoginPage redirectTo="/" />;
}

function GestionRegisterRedirect() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>;
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <RegisterPage />;
}

function AppContent() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const isGestion = location.pathname.startsWith('/gestion');
    const isDetailPage = /^\/(barrera|proyecto)\//.test(location.pathname);

    // Show administrative layout only if user is on a /gestion path AND is authenticated
    const showGestionLayout = isGestion && isAuthenticated;

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
                    <Route path="/gestion/reportar" element={
                        <ProtectedRoute><ReportPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/barreras" element={
                        <ProtectedRoute><BarrerasListPage /></ProtectedRoute>
                    } />
                    <Route path="/gestion/proyectos" element={
                        <ProtectedRoute><ProyectosListPage /></ProtectedRoute>
                    } />
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
            </main>

            {/* Bottom nav for public mode only */}
            <BottomNav />

            {/* Footer only on gestion */}
            {isGestion && <Footer />}

            <Toast />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <DataProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </DataProvider>
        </BrowserRouter>
    );
}
