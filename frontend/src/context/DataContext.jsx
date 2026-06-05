import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SEED_BARRIERS, SEED_PROJECTS } from '../data/seedData';
import * as api from '../api/api';
import { useAuth } from './AuthContext';

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
                let barreras = [];
                let proyectos = [];
                
                try {
                    barreras = await (hasToken ? api.fetchBarreras() : api.fetchBarrerasPublic());
                } catch (bErr) {
                    console.error('Error cargando barreras:', bErr);
                }
                
                try {
                    proyectos = await api.fetchProyectos();
                } catch (pErr) {
                    console.error('Error cargando proyectos:', pErr);
                }
                
                setBarriers(barreras || []);
                setProjects(proyectos || []);
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

    async function deleteBarrier(id) {
        if (backendAvailable) {
            try {
                await api.deleteBarrera(id);
                showToast('Barrera eliminada con éxito', 'success');
                await loadData(true);
                return true;
            } catch (err) {
                console.error('Error al eliminar barrera:', err);
                showToast(err.message || 'Error al eliminar barrera', 'error');
                return false;
            }
        } else {
            setBarriers(prev => prev.filter(b => b.id != id));
            setProjects(prev => prev.filter(p => p.barrierId != id));
            showToast('Barrera eliminada (modo local)', 'success');
            return true;
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

    async function addCollaborator(projectId, organization) {
        if (backendAvailable) {
            try {
                const saved = await api.joinProyecto(projectId, organization);
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

    async function deleteProject(id) {
        if (backendAvailable) {
            try {
                await api.deleteProyecto(id);
                showToast('Proyecto eliminado con éxito', 'success');
                await loadData(true);
                return true;
            } catch (err) {
                console.error('Error al eliminar proyecto:', err);
                showToast(err.message || 'Error al eliminar proyecto', 'error');
                return false;
            }
        } else {
            setProjects(prev => prev.filter(p => p.id != id));
            setBarriers(prev => prev.map(b => {
                const associatedProj = projects.find(p => p.id == id);
                if (associatedProj && b.id == associatedProj.barrierId) {
                    return { ...b, status: 'denuncia' };
                }
                return b;
            }));
            showToast('Proyecto eliminado (modo local)', 'success');
            return true;
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

    // ═══════════════ NOTIFICATIONS PERMISSION ═══════════════

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }, []);

    // ═══════════════ CHAT OPERATIONS ═══════════════

    const auth = useAuth();
    const user = auth?.user;
    const isAuthenticated = auth?.isAuthenticated;

    const triggerNativeNotification = useCallback((title, body) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, { body });
            } catch (err) {
                console.warn('Native notification failed, attempting SW:', err);
                navigator.serviceWorker?.ready.then(registration => {
                    registration.showNotification(title, { body });
                }).catch(() => {});
            }
        }
        showToast(`${title}: ${body}`, 'info');
    }, []);

    async function getChatMessages(projectId) {
        if (backendAvailable) {
            try {
                return await api.fetchChatMessages(projectId);
            } catch (err) {
                console.error('Error fetching chat messages:', err);
                return [];
            }
        } else {
            return loadFromStorage(`reddis_chat_messages_${projectId}`, []);
        }
    }

    async function sendProjectMessage(projectId, text) {
        if (backendAvailable) {
            try {
                return await api.sendChatMessage(projectId, text);
            } catch (err) {
                console.error('Error sending chat message:', err);
                showToast(err.message || 'Error al enviar mensaje', 'error');
                return null;
            }
        } else {
            const newMsg = {
                id: Date.now(),
                text: text,
                senderName: user?.nombre || 'Usuario Local',
                senderId: user?.id || 999,
                createdAt: new Date().toISOString(),
            };
            const currentMsgs = loadFromStorage(`reddis_chat_messages_${projectId}`, []);
            const updated = [...currentMsgs, newMsg];
            saveToStorage(`reddis_chat_messages_${projectId}`, updated);

            // Trigger self-reply for wow/demo effect in local mode
            setTimeout(() => {
                const replyMsg = {
                    id: Date.now() + 1,
                    text: `¡Hola! Mensaje recibido. Vamos a coordinar el próximo avance.`,
                    senderName: 'Coordinador del Proyecto',
                    senderId: 888,
                    createdAt: new Date().toISOString(),
                };
                const updatedWithReply = [...updated, replyMsg];
                saveToStorage(`reddis_chat_messages_${projectId}`, updatedWithReply);
            }, 3000);

            return newMsg;
        }
    }

    // Background polling for project chat notifications
    useEffect(() => {
        if (!isAuthenticated || !user || projects.length === 0) return;

        const myProjects = projects.filter(p => p.collaborators?.some(c => Number(c.userId) === Number(user.id)));
        if (myProjects.length === 0) return;

        const lastMsgIdsKey = `reddis_last_msg_ids_${user.id}`;
        let lastMsgIds = loadFromStorage(lastMsgIdsKey, {});

        const initLastMsgIds = async () => {
            for (const p of myProjects) {
                if (lastMsgIds[p.id] === undefined) {
                    try {
                        let msgs = [];
                        if (backendAvailable) {
                            msgs = await api.fetchChatMessages(p.id);
                        } else {
                            msgs = loadFromStorage(`reddis_chat_messages_${p.id}`, []);
                        }
                        if (msgs.length > 0) {
                            lastMsgIds[p.id] = msgs[msgs.length - 1].id;
                        } else {
                            lastMsgIds[p.id] = 0;
                        }
                    } catch (err) {
                        lastMsgIds[p.id] = 0;
                    }
                }
            }
            saveToStorage(lastMsgIdsKey, lastMsgIds);
        };
        initLastMsgIds();

        const interval = setInterval(async () => {
            for (const p of myProjects) {
                try {
                    let msgs = [];
                    if (backendAvailable) {
                        msgs = await api.fetchChatMessages(p.id);
                    } else {
                        msgs = loadFromStorage(`reddis_chat_messages_${p.id}`, []);
                    }

                    if (msgs.length > 0) {
                        const lastKnownId = lastMsgIds[p.id];
                        const lastMsg = msgs[msgs.length - 1];

                        if (lastKnownId !== undefined && lastMsg.id > lastKnownId) {
                            const newMsgs = msgs.filter(m => m.id > lastKnownId && Number(m.senderId) !== Number(user.id));
                            for (const nm of newMsgs) {
                                triggerNativeNotification(
                                    `Proyecto: ${p.title}`,
                                    `${nm.senderName}: ${nm.text}`
                                );
                            }
                        }
                        lastMsgIds[p.id] = lastMsg.id;
                    }
                } catch (err) {
                    // Ignore errors during background polling
                }
            }
            saveToStorage(lastMsgIdsKey, lastMsgIds);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAuthenticated, user, projects, backendAvailable, triggerNativeNotification]);

    const value = {
        barriers,
        projects,
        stats,
        toast,
        notifications,
        loading,
        backendAvailable,
        addBarrier,
        deleteBarrier,
        createProject,
        updateProject,
        updateProjectStatus,
        deleteProject,
        addCollaborator,
        addTimelineEntry,
        resetData,
        refreshData: loadData,
        showToast,
        getChatMessages,
        sendProjectMessage,
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
