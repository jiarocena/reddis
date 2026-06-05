// REDDIS API — relative URL works for both dev (proxy) and production (same origin)
const API_BASE = '/api/reddis';

function getToken() {
    return localStorage.getItem('reddis_token');
}

function authHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const config = {
        headers: authHeaders(),
        ...options,
    };
    // Merge headers so auth isn't lost
    if (options.headers) {
        config.headers = { ...authHeaders(), ...options.headers };
    }
    const response = await fetch(url, config);
    if (response.status === 401 || response.status === 403) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Sin autorización (${response.status})`);
    }
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${response.status}`);
    }
    return response.json();
}

// Public request — never sends auth token
async function publicRequest(path) {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${response.status}`);
    }
    return response.json();
}

// ═══════════════ AUTH ═══════════════

export async function registerUser(nombre, email, password, departamento) {
    return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, password, departamento }),
    });
}

export async function confirmEmail(token) {
    return request(`/auth/confirm?token=${token}`);
}

export async function loginUser(email, password) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function fetchMe() {
    return request('/auth/me');
}

export async function requestRole(message, organization, motive) {
    return request('/auth/role-request', {
        method: 'POST',
        body: JSON.stringify({ message, organization, motive }),
    });
}

// ═══════════════ ADMIN ═══════════════

export async function fetchPendingBarriers() {
    return request('/admin/pending-barriers');
}

export async function approveBarrier(id) {
    return request(`/admin/barriers/${id}/approve`, { method: 'PUT' });
}

export async function rejectBarrier(id) {
    return request(`/admin/barriers/${id}/reject`, { method: 'PUT' });
}

export async function fetchRoleRequests() {
    return request('/admin/role-requests');
}

export async function approveRoleRequest(id) {
    return request(`/admin/role-requests/${id}/approve`, { method: 'PUT' });
}

export async function rejectRoleRequest(id, reason) {
    return request(`/admin/role-requests/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
    });
}

export async function fetchAllUsers() {
    return request('/admin/users');
}

export async function deleteUsuario(id) {
    return request(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function removeCollaborator(id) {
    return request(`/admin/collaborators/${id}`, { method: 'DELETE' });
}

export async function addCollaboratorToProject(projectId, userId, organization) {
    return request(`/admin/projects/${projectId}/collaborators`, {
        method: 'POST',
        body: JSON.stringify({ userId, organization }),
    });
}

export async function confirmUsuarioEmail(email) {
    return request('/admin/confirm-user', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function deleteBarrera(id) {
    return request(`/admin/barriers/${id}`, { method: 'DELETE' });
}

export async function deleteProyecto(id) {
    return request(`/admin/projects/${id}`, { method: 'DELETE' });
}

// ═══════════════ BARRERAS ═══════════════

// Fetches barriers WITH auth (for staff views)
export async function fetchBarreras() {
    return request('/barreras');
}

// Fetches barriers WITHOUT auth (public map — only approved)
export async function fetchBarrerasPublic() {
    return publicRequest('/barreras');
}

export async function fetchBarrera(id) {
    return request(`/barreras/${id}`);
}

export async function createBarrera(data) {
    return request('/barreras', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ═══════════════ PROYECTOS ═══════════════

export async function fetchProyectos() {
    return request('/proyectos');
}

export async function fetchProyecto(id) {
    return request(`/proyectos/${id}`);
}

export async function createProyecto(data) {
    return request('/proyectos', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateProyectoStatus(id, status) {
    return request(`/proyectos/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

export async function finalizarProyecto(id, impact, lessons) {
    return request(`/proyectos/${id}/finalizar`, {
        method: 'PUT',
        body: JSON.stringify({ impact, lessons }),
    });
}

export async function updateProyecto(id, data) {
    return request(`/proyectos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function addTimelineEntry(proyectoId, entry) {
    return request(`/proyectos/${proyectoId}/timeline`, {
        method: 'POST',
        body: JSON.stringify(entry),
    });
}

export async function joinProyecto(proyectoId, organization) {
    return request(`/proyectos/${proyectoId}/colaboradores`, {
        method: 'POST',
        body: JSON.stringify({ organization }),
    });
}

// ═══════════════ STATS ═══════════════

export async function fetchStats() {
    return request('/stats');
}

// ═══════════════ HEALTH CHECK ═══════════════

export async function checkBackendHealth() {
    try {
        await fetch(`${API_BASE}/stats`, { method: 'GET' });
        return true;
    } catch {
        return false;
    }
}

// ═══════════════ PUSH NOTIFICATIONS ═══════════════

export async function getVapidPublicKey() {
    return request('/push/vapid-public-key');
}

export async function subscribePush(subscription) {
    return request('/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
    });
}

// ═══════════════ CHAT ═══════════════

export async function fetchChatMessages(projectId) {
    return request(`/proyectos/${projectId}/chat`);
}

export async function sendChatMessage(projectId, text) {
    return request(`/proyectos/${projectId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
}

