import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SEED_BARRIERS, SEED_PROJECTS } from '../data/seedData';
import * as api from '../api/api';

const DataContext = createContext(null);

// localStorage keys (fallback)
const STORAGE_KEYS = {
    barriers: 'reddis_barriers',
    projects: 'reddis_projects',
};

function loadFromStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
}

export function DataProvider({ children }) {
    const [barriers, setBarriers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [toast, setToast] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [backendAvailable, setBackendAvailable] = useState(null); // null = checking
    const [loading, setLoading] = useState(true);

    // ═══════════════ TOAST ═══════════════

    function showToast(message, type = 'info') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }

    // ═══════════════ LOAD DATA ═══════════════

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const isUp = await api.checkBackendHealth();
            setBackendAvailable(isUp);

            if (isUp) {
                // If user has a token, fetch all barriers (including unapproved for staff)
                // Otherwise fetch only public/approved barriers
                const hasToken = !!localStorage.getItem('reddis_token');
                const [barreras, proyectos] = await Promise.all([
                    hasToken ? api.fetchBarreras() : api.fetchBarrerasPublic(),
                    api.fetchProyectos(),
                ]);
                setBarriers(barreras);
                setProjects(proyectos);
            } else {
                console.warn('Backend no disponible.');
                setBarriers([]);
                setProjects([]);
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            setBackendAvailable(false);
            setBarriers([]);
            setProjects([]);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ═══════════════ BARRIER OPERATIONS ═══════════════

    async function addBarrier(barrierData) {
        if (backendAvailable) {
            try {
                const saved = await api.createBarrera(barrierData);
                await loadData();
                showToast('¡Barrera reportada exitosamente!', 'success');
                return saved;
            } catch (err) {
                console.error('Error creando barrera:', err);
                // Show specific error messages
                const msg = err.message || '';
                if (msg.includes('límite') || msg.includes('429')) {
                    showToast('Alcanzaste el límite de 3 reportes por día.', 'error');
                } else if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized')) {
                    showToast('Debés iniciar sesión para reportar.', 'error');
                } else {
                    showToast(msg || 'Error al reportar barrera', 'error');
                }
                return null;
            }
        } else {
            // localStorage fallback
            const newBarrier = {
                ...barrierData,
                id: 'b' + Date.now(),
                status: 'denuncia',
                date: new Date().toISOString().split('T')[0],
                isPublic: barrierData.isPublic !== false,
            };
            setBarriers(prev => [newBarrier, ...prev]);
            showToast('¡Barrera reportada exitosamente! (modo local)', 'success');
            addNotification('Nueva barrera reportada: ' + newBarrier.title);
            return newBarrier;
        }
    }

    // ═══════════════ PROJECT OPERATIONS ═══════════════

    async function createProject(barrierId, projectData) {
        if (backendAvailable) {
            try {
                const saved = await api.createProyecto({ ...projectData, barrierId });
                setProjects(prev => [...prev, saved]);
                // Also update barrier status locally
                setBarriers(prev =>
                    prev.map(b => (b.id == barrierId ? { ...b, status: 'iniciando' } : b))
                );
                showToast('¡Proyecto creado exitosamente!', 'success');
                return saved;
            } catch (err) {
                console.error('Error creando proyecto:', err);
                showToast('Error al crear proyecto', 'error');
                return null;
            }
        } else {
            // localStorage fallback
            const newProject = {
                ...projectData,
                id: 'p' + Date.now(),
                barrierId,
                status: 'iniciando',
                collaborators: [{ name: projectData.leader, role: 'Líder de proyecto', initials: projectData.leader?.split(' ').map(w => w[0]).join('').substring(0, 2) || 'LD' }],
                timeline: [{ date: new Date().toISOString().split('T')[0], text: 'Proyecto creado', completed: true }],
                startDate: new Date().toISOString().split('T')[0],
            };
            setProjects(prev => [...prev, newProject]);
            setBarriers(prev =>
                prev.map(b => (b.id === barrierId) ? { ...b, status: 'iniciando' } : b)
            );
            showToast('¡Proyecto creado! (modo local)', 'success');
            return newProject;
        }
    }

    async function updateProject(projectId, data) {
        if (backendAvailable) {
            try {
                const updated = await api.updateProyecto(projectId, data);
                setProjects(prev => prev.map(p => p.id == projectId ? updated : p));
                if (data.status && updated.barrierId) {
                    setBarriers(prev =>
                        prev.map(b => (b.id == updated.barrierId ? { ...b, status: data.status } : b))
                    );
                }
                showToast('Proyecto actualizado', 'success');
                return updated;
            } catch (err) {
                console.error('Error actualizando proyecto:', err);
                showToast(err.message || 'Error al actualizar proyecto', 'error');
                return null;
            }
        } else {
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    return { ...p, ...data };
                }
                return p;
            }));
            showToast('Proyecto actualizado (modo local)', 'success');
        }
    }

    async function updateProjectStatus(projectId, status) {
        if (backendAvailable) {
            try {
                const updated = await api.updateProyectoStatus(projectId, status);
                setProjects(prev => prev.map(p => p.id == projectId ? updated : p));
                setBarriers(prev =>
                    prev.map(b => (b.id == updated.barrierId ? { ...b, status } : b))
                );
                showToast('Estado actualizado', 'success');
                return updated;
            } catch (err) {
                console.error('Error actualizando estado:', err);
                showToast('Error al actualizar estado', 'error');
            }
        } else {
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    return { ...p, status, endDate: status === 'finalizado' ? new Date().toISOString().split('T')[0] : p.endDate };
                }
                return p;
            }));
            showToast('Estado actualizado (modo local)', 'success');
        }
    }

    async function addCollaborator(projectId) {
        if (backendAvailable) {
            try {
                const saved = await api.joinProyecto(projectId);
                // Refresh the project to get updated collaborators list
                const updated = await api.fetchProyecto(projectId);
                setProjects(prev => prev.map(p => p.id == projectId ? updated : p));
                showToast(`Te sumaste al proyecto como colaborador`, 'success');
                return saved;
            } catch (err) {
                console.error('Error sumándose al proyecto:', err);
                showToast(err.message || 'Error al sumarse al proyecto', 'error');
            }
        }
    }

    async function addTimelineEntry(projectId, entry) {
        if (backendAvailable) {
            try {
                await api.addTimelineEntry(projectId, entry);
                const updated = await api.fetchProyecto(projectId);
                setProjects(prev => prev.map(p => p.id == projectId ? updated : p));
                showToast('Avance registrado', 'success');
            } catch (err) {
                console.error('Error agregando avance:', err);
                showToast('Error al registrar avance', 'error');
            }
        } else {
            const newEntry = {
                ...entry,
                date: entry.date || new Date().toISOString().split('T')[0],
            };
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    return { ...p, timeline: [...(p.timeline || []), newEntry] };
                }
                return p;
            }));
            showToast('Avance registrado (modo local)', 'success');
        }
    }

    // ═══════════════ NOTIFICATIONS ═══════════════

    function addNotification(message) {
        setNotifications(prev => [
            { id: Date.now(), message, date: new Date().toISOString(), read: false },
            ...prev,
        ]);
    }

    // ═══════════════ STATS ═══════════════

    const stats = {
        totalBarriers: barriers.length,
        activeProjects: projects.filter(p => p.status === 'iniciando' || p.status === 'en-proceso').length,
        resolvedProjects: projects.filter(p => p.status === 'finalizado').length,
        totalCollaborators: projects.reduce((sum, p) => sum + (p.collaborators?.length || 0), 0),
    };

    // ═══════════════ RESET ═══════════════

    function resetData() {
        localStorage.removeItem(STORAGE_KEYS.barriers);
        localStorage.removeItem(STORAGE_KEYS.projects);
        loadData();
        showToast('Datos reiniciados', 'info');
    }

    const value = {
        barriers,
        projects,
        stats,
        toast,
        notifications,
        loading,
        backendAvailable,
        addBarrier,
        createProject,
        updateProject,
        updateProjectStatus,
        addCollaborator,
        addTimelineEntry,
        resetData,
        refreshData: loadData,
        showToast,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
