import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
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

    if (!isAuthenticated) return <Navigate to="/login" replace />;

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

function AppContent() {
    return (
        <>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/mapa" element={<MapPage />} />
                    <Route path="/reportar" element={
                        <ProtectedRoute><ReportPage /></ProtectedRoute>
                    } />
                    <Route path="/barrera/:id" element={<BarrierDetailPage />} />
                    <Route path="/proyecto/:id" element={<ProjectDetailPage />} />
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>
                    } />
                    <Route path="/acerca" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegisterPage />} />
                    <Route path="/confirmar" element={<ConfirmPage />} />
                    <Route path="/perfil" element={
                        <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/pendientes" element={
                        <ProtectedRoute requiredRole="REFERENTE"><PendingBarriersPage /></ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
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
