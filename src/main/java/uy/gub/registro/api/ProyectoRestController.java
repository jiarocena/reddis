package uy.gub.registro.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.UsuarioRepository;
import uy.gub.registro.repository.RoleRequestRepository;
import uy.gub.registro.repository.ChatMessageRepository;
import uy.gub.registro.service.ReddisService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/reddis")
public class ProyectoRestController {

    private final ReddisService reddisService;
    private final UsuarioRepository usuarioRepo;
    private final RoleRequestRepository roleRequestRepo;
    private final ChatMessageRepository chatMessageRepo;

    public ProyectoRestController(ReddisService reddisService, UsuarioRepository usuarioRepo, RoleRequestRepository roleRequestRepo, ChatMessageRepository chatMessageRepo) {
        this.reddisService = reddisService;
        this.usuarioRepo = usuarioRepo;
        this.roleRequestRepo = roleRequestRepo;
        this.chatMessageRepo = chatMessageRepo;
    }

    @GetMapping("/diagnostico")
    public ResponseEntity<?> diagnostico() {
        Map<String, Object> diag = new LinkedHashMap<>();
        
        List<Map<String, Object>> users = usuarioRepo.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("email", u.getEmail());
            m.put("nombre", u.getNombreCompleto());
            m.put("rol", u.getRol());
            return m;
        }).toList();
        diag.put("usuarios", users);
        
        List<Map<String, Object>> requests = roleRequestRepo.findAll().stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("userId", r.getUsuario().getId());
            m.put("userName", r.getUsuario().getNombreCompleto());
            m.put("requestedRole", r.getRequestedRole());
            m.put("status", r.getStatus());
            m.put("message", r.getMessage());
            return m;
        }).toList();
        diag.put("solicitudes_rol", requests);
        
        List<Map<String, Object>> projs = reddisService.listarProyectos().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("title", p.getTitle());
            m.put("collaborators", p.getCollaborators().stream().map(c -> c.getName() + " (userId: " + c.getUserId() + ")").toList());
            return m;
        }).toList();
        diag.put("proyectos", projs);
        
        return ResponseEntity.ok(diag);
    }

    @GetMapping("/proyectos")
    public List<Map<String, Object>> listar() {
        reddisService.ensureProyectosForPublicBarreras();
        return reddisService.listarProyectos().stream()
                .filter(p -> !"finalizado".equals(p.getStatus()))
                .map(this::toMap)
                .toList();
    }

    @GetMapping("/proyectos/{id}")
    public ResponseEntity<Map<String, Object>> detalle(@PathVariable Long id) {
        Proyecto p = reddisService.obtenerProyecto(id);
        if (p == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toMap(p));
    }

    @PostMapping("/proyectos")
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Map<String, Object> body) {
        Long barreraId = toLong(body.get("barrierId"));
        if (barreraId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if project already exists for this barrier
        Proyecto existing = reddisService.obtenerProyectoPorBarrera(barreraId);
        if (existing != null) {
            existing.setTitle((String) body.get("title"));
            if (body.get("objective") != null) existing.setObjective((String) body.get("objective"));
            if (body.get("leader") != null) existing.setLeader((String) body.get("leader"));
            if (body.get("resources") != null) existing.setResources((String) body.get("resources"));
            if (body.get("needsHelp") != null) existing.setNeedsHelp((Boolean) body.get("needsHelp"));
            if (body.get("helpDescription") != null) existing.setHelpDescription((String) body.get("helpDescription"));
            if (body.containsKey("accionesPrevistas")) {
                List<String> list = (List<String>) body.get("accionesPrevistas");
                existing.getAccionesPrevistas().clear();
                if (list != null) {
                    existing.getAccionesPrevistas().addAll(list);
                }
            }
            
            // Set status to "iniciando" when claimed
            existing.setStatus("iniciando");
            reddisService.actualizarStatusBarrera(barreraId, "iniciando");
            
            Proyecto saved = reddisService.saveProyecto(existing);
            return ResponseEntity.ok(toMap(saved));
        }

        Proyecto proyecto = Proyecto.builder()
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .objective((String) body.get("objective"))
                .leader((String) body.get("leader"))
                .resources((String) body.get("resources"))
                .needsHelp(body.get("needsHelp") != null && (Boolean) body.get("needsHelp"))
                .helpDescription((String) body.get("helpDescription"))
                .build();
        if (body.containsKey("accionesPrevistas")) {
            List<String> list = (List<String>) body.get("accionesPrevistas");
            if (list != null) {
                proyecto.getAccionesPrevistas().addAll(list);
            }
        }

        Proyecto saved = reddisService.crearProyecto(proyecto, barreraId);
        return ResponseEntity.ok(toMap(saved));
    }

    @PutMapping("/proyectos/{id}/status")
    public ResponseEntity<?> cambiarStatus(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null)
            return ResponseEntity.badRequest().build();

        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Proyecto proyecto = reddisService.obtenerProyecto(id);
        if (proyecto == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isCollab = "REFERENTE".equalsIgnoreCase(user.getRol())
                || "ADMIN".equalsIgnoreCase(user.getRol())
                || proyecto.getCollaborators().stream().anyMatch(c -> user.getId().equals(c.getUserId()));
        if (!isCollab) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para modificar este proyecto"));
        }

        String authorName = user.getNombreCompleto();
        Proyecto updated = reddisService.actualizarStatusProyecto(id, status, authorName);
        return ResponseEntity.ok(toMap(updated));
    }

    @PutMapping("/proyectos/{id}/finalizar")
    public ResponseEntity<?> finalizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Proyecto proyecto = reddisService.obtenerProyecto(id);
        if (proyecto == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isCollab = "REFERENTE".equalsIgnoreCase(user.getRol())
                || "ADMIN".equalsIgnoreCase(user.getRol())
                || proyecto.getCollaborators().stream().anyMatch(c -> user.getId().equals(c.getUserId()));
        if (!isCollab) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para modificar este proyecto"));
        }

        String authorName = user.getNombreCompleto();
        reddisService.actualizarStatusProyecto(id, "finalizado", authorName);
        Proyecto updated = reddisService.actualizarProyectoFinalizado(id,
                body.get("impact"), body.get("lessons"));
        return ResponseEntity.ok(toMap(updated));
    }

    @PutMapping("/proyectos/{id}")
    public ResponseEntity<?> actualizarProyecto(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Proyecto proyecto = reddisService.obtenerProyecto(id);
        if (proyecto == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isCollab = "REFERENTE".equalsIgnoreCase(user.getRol())
                || "ADMIN".equalsIgnoreCase(user.getRol())
                || proyecto.getCollaborators().stream().anyMatch(c -> user.getId().equals(c.getUserId()));
        if (!isCollab) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para modificar este proyecto"));
        }

        if (body.containsKey("title")) {
            proyecto.setTitle((String) body.get("title"));
        }
        if (body.containsKey("description")) {
            proyecto.setDescription((String) body.get("description"));
        }
        if (body.containsKey("objective")) {
            proyecto.setObjective((String) body.get("objective"));
        }
        if (body.containsKey("leader")) {
            proyecto.setLeader((String) body.get("leader"));
        }
        if (body.containsKey("resources")) {
            proyecto.setResources((String) body.get("resources"));
        }
        if (body.containsKey("needsHelp")) {
            proyecto.setNeedsHelp((Boolean) body.get("needsHelp"));
        }
        if (body.containsKey("helpDescription")) {
            proyecto.setHelpDescription((String) body.get("helpDescription"));
        }
        if (body.containsKey("accionesPrevistas")) {
            List<String> list = (List<String>) body.get("accionesPrevistas");
            proyecto.getAccionesPrevistas().clear();
            if (list != null) {
                proyecto.getAccionesPrevistas().addAll(list);
            }
        }

        if (body.containsKey("status")) {
            String status = (String) body.get("status");
            String authorName = user.getNombreCompleto();
            proyecto = reddisService.actualizarStatusProyecto(id, status, authorName);
        } else {
            proyecto = reddisService.saveProyecto(proyecto);
        }

        return ResponseEntity.ok(toMap(proyecto));
    }

    @PostMapping("/proyectos/{id}/timeline")
    public ResponseEntity<?> agregarTimeline(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        // Get current user for author name
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Proyecto proyecto = reddisService.obtenerProyecto(id);
        if (proyecto == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isCollab = "REFERENTE".equalsIgnoreCase(user.getRol())
                || "ADMIN".equalsIgnoreCase(user.getRol())
                || proyecto.getCollaborators().stream().anyMatch(c -> user.getId().equals(c.getUserId()));
        if (!isCollab) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para modificar este proyecto"));
        }

        TimelineEntry entry = TimelineEntry.builder()
                .text((String) body.get("text"))
                .completed(body.get("completed") != null && (Boolean) body.get("completed"))
                .authorName(user.getNombreCompleto())
                .build();

        if (body.get("date") != null) {
            entry.setDate(LocalDate.parse((String) body.get("date")));
        }

        TimelineEntry saved = reddisService.agregarTimelineEntry(id, entry);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId());
        result.put("date", saved.getDate().toString());
        result.put("text", saved.getText());
        result.put("completed", saved.getCompleted());
        result.put("authorName", saved.getAuthorName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/proyectos/{id}/colaboradores")
    public ResponseEntity<?> agregarColaborador(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        // Get current user - they join with their own name
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        // Check user has COLABORADOR or REFERENTE role
        String rol = user.getRol();
        if (!"COLABORADOR".equalsIgnoreCase(rol) && !"REFERENTE".equalsIgnoreCase(rol) && !"ADMIN".equalsIgnoreCase(rol)) {
            return ResponseEntity.status(403).body(Map.of("error", "Debes ser aprobado como Colaborador por un Referente para sumarte"));
        }

        // Check not already a collaborator
        Proyecto proyecto = reddisService.obtenerProyecto(id);
        if (proyecto == null) {
            return ResponseEntity.notFound().build();
        }
        boolean alreadyJoined = proyecto.getCollaborators().stream()
                .anyMatch(c -> user.getId().equals(c.getUserId()));
        if (alreadyJoined) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya sos colaborador de este proyecto"));
        }

        String nombre = user.getNombreCompleto();
        String initials = nombre.contains(" ")
                ? ("" + nombre.split(" ")[0].charAt(0) + nombre.split(" ")[1].charAt(0)).toUpperCase()
                : nombre.substring(0, Math.min(2, nombre.length())).toUpperCase();

        String organization = body != null ? body.get("organization") : null;

        Colaborador col = Colaborador.builder()
                .name(nombre)
                .role(user.getRol())
                .initials(initials)
                .userId(user.getId())
                .organization(organization)
                .build();

        Colaborador saved = reddisService.agregarColaborador(id, col);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        result.put("role", saved.getRole());
        result.put("initials", saved.getInitials());
        result.put("userId", saved.getUserId());
        return ResponseEntity.ok(result);
    }

    // ---- helpers ----

    private Usuario getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String username = auth.getName();
        return usuarioRepo.findByUsername(username).orElse(null);
    }

    private Map<String, Object> toMap(Proyecto p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("barrierId", p.getBarrera() != null ? p.getBarrera().getId() : null);
        m.put("title", p.getTitle());
        m.put("description", p.getDescription());
        m.put("objective", p.getObjective());
        m.put("accionesPrevistas", p.getAccionesPrevistas());
        m.put("status", p.getStatus());
        m.put("leader", p.getLeader());
        m.put("resources", p.getResources());
        m.put("needsHelp", p.getNeedsHelp());
        m.put("helpDescription", p.getHelpDescription());
        m.put("startDate", p.getStartDate() != null ? p.getStartDate().toString() : null);
        m.put("endDate", p.getEndDate() != null ? p.getEndDate().toString() : null);
        m.put("impact", p.getImpact());
        m.put("lessons", p.getLessons());

        // Collaborators
        List<Map<String, Object>> collabs = new ArrayList<>();
        for (Colaborador c : p.getCollaborators()) {
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("id", c.getId());
            cm.put("name", c.getName());
            cm.put("role", c.getRole());
            cm.put("initials", c.getInitials());
            cm.put("userId", c.getUserId());
            cm.put("organization", c.getOrganization());
            collabs.add(cm);
        }
        m.put("collaborators", collabs);

        // Timeline
        List<Map<String, Object>> tl = new ArrayList<>();
        for (TimelineEntry t : p.getTimeline()) {
            Map<String, Object> tm = new LinkedHashMap<>();
            tm.put("id", t.getId());
            tm.put("date", t.getDate().toString());
            tm.put("text", t.getText());
            tm.put("completed", t.getCompleted());
            tm.put("authorName", t.getAuthorName());
            tl.add(tm);
        }
        m.put("timeline", tl);

        return m;
    }

    private Long toLong(Object val) {
        if (val == null)
            return null;
        if (val instanceof Number)
            return ((Number) val).longValue();
        try {
            return Long.parseLong(val.toString());
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/proyectos/{id}/chat")
    public ResponseEntity<?> obtenerChat(@PathVariable Long id) {
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Proyecto proyecto = reddisService.obtenerProyecto(id);
        if (proyecto == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isMember = proyecto.getCollaborators().stream()
                .anyMatch(c -> user.getId().equals(c.getUserId()));
        if (!isMember) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes acceso a este chat porque no eres integrante del proyecto"));
        }

        List<Map<String, Object>> messages = chatMessageRepo.findByProyectoIdOrderByCreatedAtAsc(id).stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("text", m.getText());
            map.put("senderName", m.getSenderName());
            map.put("senderId", m.getSenderId());
            map.put("createdAt", m.getCreatedAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/proyectos/{id}/chat")
    public ResponseEntity<?> enviarMensajeChat(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Proyecto proyecto = reddisService.obtenerProyecto(id);
        if (proyecto == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isMember = proyecto.getCollaborators().stream()
                .anyMatch(c -> user.getId().equals(c.getUserId()));
        if (!isMember) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes acceso a este chat porque no eres integrante del proyecto"));
        }

        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El mensaje no puede estar vacío"));
        }

        ChatMessage message = ChatMessage.builder()
                .text(text.trim())
                .proyecto(proyecto)
                .senderName(user.getNombreCompleto())
                .senderId(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepo.save(message);

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", saved.getId());
        map.put("text", saved.getText());
        map.put("senderName", saved.getSenderName());
        map.put("senderId", saved.getSenderId());
        map.put("createdAt", saved.getCreatedAt().toString());

        return ResponseEntity.ok(map);
    }
}
