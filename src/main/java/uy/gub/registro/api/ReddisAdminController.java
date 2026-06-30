package uy.gub.registro.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.config.JwtUtil;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.*;
import uy.gub.registro.model.ActivityLog;
import uy.gub.registro.repository.ActivityLogRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reddis/admin")
public class ReddisAdminController {

    private final BarreraRepository barreraRepo;
    private final RoleRequestRepository roleRequestRepo;
    private final UsuarioRepository usuarioRepo;
    private final JwtUtil jwtUtil;
    private final ProyectoRepository proyectoRepo;
    private final ColaboradorRepository colaboradorRepo;
    private final ChatMessageRepository chatMessageRepo;
    private final ActivityLogRepository activityLogRepo;
    private final PushSubscriptionRepository pushSubscriptionRepo;
    private final PersonaRepository personaRepo;
 
     public ReddisAdminController(BarreraRepository barreraRepo, RoleRequestRepository roleRequestRepo,
             UsuarioRepository usuarioRepo, JwtUtil jwtUtil, ProyectoRepository proyectoRepo, 
             ColaboradorRepository colaboradorRepo, ChatMessageRepository chatMessageRepo,
             ActivityLogRepository activityLogRepo, PushSubscriptionRepository pushSubscriptionRepo,
             PersonaRepository personaRepo) {
         this.barreraRepo = barreraRepo;
         this.roleRequestRepo = roleRequestRepo;
         this.usuarioRepo = usuarioRepo;
         this.jwtUtil = jwtUtil;
         this.proyectoRepo = proyectoRepo;
         this.colaboradorRepo = colaboradorRepo;
         this.chatMessageRepo = chatMessageRepo;
         this.activityLogRepo = activityLogRepo;
         this.pushSubscriptionRepo = pushSubscriptionRepo;
         this.personaRepo = personaRepo;
     }

    // ═══════ PENDING BARRIERS ═══════

    @GetMapping("/pending-barriers")
    public ResponseEntity<?> pendingBarriers() {
        List<Barrera> pending = barreraRepo.findAll().stream()
                .filter(b -> !b.getApproved())
                .sorted(Comparator.comparing(Barrera::getCreatedAt).reversed())
                .collect(Collectors.toList());

        List<Map<String, Object>> result = pending.stream()
                .map(this::barrierToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/barriers/{id}/approve")
    public ResponseEntity<?> approveBarrier(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        Barrera barrera = barreraRepo.findById(id).orElse(null);
        if (barrera == null) {
            return ResponseEntity.notFound().build();
        }

        Long userId = jwtUtil.getUserId(authHeader.substring(7));
        Usuario approver = usuarioRepo.findById(userId).orElse(null);

        barrera.setApproved(true);
        barrera.setApprovedBy(approver);
        barreraRepo.save(barrera);

        System.out.println("✅ BARRERA APROBADA: #" + id + " - " + barrera.getTitle() + " (por "
                + approver.getNombreCompleto() + ")");

        return ResponseEntity.ok(Map.of("message", "Barrera aprobada y publicada"));
    }

    @PutMapping("/barriers/{id}/reject")
    public ResponseEntity<?> rejectBarrier(@PathVariable Long id) {
        Barrera barrera = barreraRepo.findById(id).orElse(null);
        if (barrera == null) {
            return ResponseEntity.notFound().build();
        }

        barrera.setStatus("rechazada");
        barreraRepo.save(barrera);

        return ResponseEntity.ok(Map.of("message", "Barrera rechazada"));
    }

    // ═══════ ROLE REQUESTS ═══════

    @GetMapping("/role-requests")
    public ResponseEntity<?> roleRequests() {
        List<RoleRequest> pending = roleRequestRepo.findByStatusOrderByCreatedAtDesc("PENDIENTE");

        List<Map<String, Object>> result = pending.stream().map(r -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r.getId());
            map.put("userId", r.getUsuario().getId());
            map.put("userName", r.getUsuario().getNombreCompleto());
            map.put("userEmail", r.getUsuario().getEmail());
            map.put("requestedRole", r.getRequestedRole());
            map.put("message", r.getMessage());
            map.put("organization", r.getOrganization());
            map.put("motive", r.getMotive());
            map.put("status", r.getStatus());
            map.put("createdAt", r.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/role-requests/{id}/approve")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> approveRoleRequest(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        RoleRequest req = roleRequestRepo.findById(id).orElse(null);
        if (req == null) {
            return ResponseEntity.notFound().build();
        }

        Long reviewerId = jwtUtil.getUserId(authHeader.substring(7));
        Usuario reviewer = usuarioRepo.findById(reviewerId).orElse(null);

        // Update the request
        req.setStatus("APROBADA");
        req.setReviewedBy(reviewer);
        req.setReviewedAt(LocalDateTime.now());
        roleRequestRepo.save(req);

        // Update the user's system role to COLABORADOR
        Usuario user = req.getUsuario();
        user.setRol("COLABORADOR");
        usuarioRepo.save(user);

        // Dynamic project collaboration linking
        String message = req.getMessage() != null ? req.getMessage() : "";
        if (message.contains("[PROYECTO_ID:")) {
            try {
                int start = message.indexOf("[PROYECTO_ID:") + 13;
                int end = message.indexOf("]", start);
                if (end > start) {
                    Long projectId = Long.parseLong(message.substring(start, end));
                    Optional<Proyecto> projOpt = proyectoRepo.findById(projectId);
                    if (projOpt.isPresent()) {
                        Proyecto proj = projOpt.get();
                        
                        // Check if not already a collaborator
                        boolean alreadyCollab = proj.getCollaborators().stream()
                                .anyMatch(c -> user.getId().equals(c.getUserId()));
                        if (!alreadyCollab) {
                            String name = user.getNombreCompleto();
                            String initials = name.contains(" ")
                                    ? ("" + name.split(" ")[0].charAt(0) + name.split(" ")[1].charAt(0)).toUpperCase()
                                    : name.substring(0, Math.min(2, name.length())).toUpperCase();

                            Colaborador col = Colaborador.builder()
                                    .name(name)
                                    .role("Colaborador")
                                    .initials(initials)
                                    .proyecto(proj)
                                    .userId(user.getId())
                                    .organization(req.getOrganization())
                                    .build();
                            colaboradorRepo.save(col);
                            System.out.println("👥 COLABORADOR ASOCIADO AUTOMÁTICAMENTE: " + name + " al proyecto #" + projectId);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error al asociar colaborador automáticamente al proyecto: " + e.getMessage());
            }
        }

        System.out.println("✅ ROL APROBADO: " + user.getNombreCompleto() + " → " + req.getRequestedRole());

        return ResponseEntity.ok(Map.of("message", "Rol aprobado para " + user.getNombreCompleto()));
    }

    @PutMapping("/role-requests/{id}/reject")
    public ResponseEntity<?> rejectRoleRequest(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        RoleRequest req = roleRequestRepo.findById(id).orElse(null);
        if (req == null) {
            return ResponseEntity.notFound().build();
        }

        req.setStatus("RECHAZADA");
        req.setRejectionReason(body.getOrDefault("reason", ""));
        req.setReviewedAt(LocalDateTime.now());
        roleRequestRepo.save(req);

        return ResponseEntity.ok(Map.of("message", "Solicitud rechazada"));
    }

    // ═══════ ALL USERS (admin) ═══════

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        List<Map<String, Object>> result = usuarioRepo.findAll().stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("nombre", u.getNombreCompleto());
            map.put("email", u.getEmail());
            map.put("rol", u.getRol());
            map.put("activo", u.getActivo());
            map.put("emailConfirmed", u.getEmailConfirmed());
            map.put("departamento", u.getDepartamento());
            map.put("createdAt", u.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ═══════ HELPERS ═══════

    private Map<String, Object> barrierToMap(Barrera b) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", b.getId());
        map.put("title", b.getTitle());
        map.put("description", b.getDescription());
        map.put("type", b.getType());
        map.put("category", b.getCategory());
        map.put("address", b.getAddress());
        map.put("urgency", b.getUrgency());
        map.put("status", b.getStatus());
        map.put("reportedBy", b.getReportedBy());
        map.put("approved", b.getApproved());
        map.put("createdAt", b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        if (b.getReportedByUser() != null) {
            map.put("reportedByUserName", b.getReportedByUser().getNombreCompleto());
        }
        return map;
    }

    // ═══════ MANUAL USER CONFIRM ═══════

    @PostMapping("/confirm-user")
    public ResponseEntity<?> confirmUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));

        var opt = usuarioRepo.findByEmail(email);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Usuario u = opt.get();
        u.setEmailConfirmed(true);
        u.setConfirmationToken(null);
        usuarioRepo.save(u);

        return ResponseEntity.ok(Map.of("message", "Email confirmado para " + u.getNombreCompleto()));
    }

    private void deleteUserCleanly(Usuario u) {
        Long id = u.getId();

        // 1. Suscripciones push
        pushSubscriptionRepo.findAll().stream()
                .filter(ps -> ps.getUsuario() != null && ps.getUsuario().getId().equals(id))
                .forEach(pushSubscriptionRepo::delete);
        pushSubscriptionRepo.flush();

        // 2. Colaboradores
        colaboradorRepo.findAll().stream()
                .filter(col -> id.equals(col.getUserId()))
                .forEach(colaboradorRepo::delete);
        colaboradorRepo.flush();

        // 3. Barreras reportadas / aprobadas
        barreraRepo.findAll().stream()
                .filter(b -> (b.getReportedByUser() != null && b.getReportedByUser().getId().equals(id)) ||
                             (b.getApprovedBy() != null && b.getApprovedBy().getId().equals(id)))
                .forEach(b -> {
                    if (b.getReportedByUser() != null && b.getReportedByUser().getId().equals(id)) {
                        b.setReportedByUser(null);
                    }
                    if (b.getApprovedBy() != null && b.getApprovedBy().getId().equals(id)) {
                        b.setApprovedBy(null);
                    }
                    barreraRepo.save(b);
                });
        barreraRepo.flush();

        // 4. Personas auditadas
        personaRepo.findAll().stream()
                .filter(p -> p.getRegistradoPor() != null && p.getRegistradoPor().getId().equals(id))
                .forEach(p -> {
                    p.setRegistradoPor(null);
                    personaRepo.save(p);
                });
        personaRepo.flush();

        // 5. Solicitudes de rol (como revisor)
        roleRequestRepo.findAll().stream()
                .filter(r -> r.getReviewedBy() != null && r.getReviewedBy().getId().equals(id))
                .forEach(r -> {
                    r.setReviewedBy(null);
                    roleRequestRepo.save(r);
                });

        // 6. Solicitudes de rol (como solicitante)
        roleRequestRepo.findAll().stream()
                .filter(r -> r.getUsuario() != null && r.getUsuario().getId().equals(id))
                .forEach(roleRequestRepo::delete);
        roleRequestRepo.flush();

        // 7. Finalmente, eliminar el usuario
        usuarioRepo.delete(u);
        usuarioRepo.flush();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        var opt = usuarioRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Usuario u = opt.get();
        
        // Prevent deleting the main admin account
        if ("admin".equals(u.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se puede eliminar la cuenta del administrador principal"));
        }

        // Prevent deleting yourself
        Long currentUserId = jwtUtil.getUserId(authHeader.substring(7));
        if (currentUserId.equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminar tu propio usuario"));
        }

        deleteUserCleanly(u);
        System.out.println("🗑️ USUARIO ELIMINADO: " + u.getEmail());

        return ResponseEntity.ok(Map.of("message", "Usuario eliminado: " + u.getEmail()));
    }

    @DeleteMapping("/users/by-email")
    public ResponseEntity<?> deleteUserByEmail(@RequestParam String email,
            @RequestHeader("Authorization") String authHeader) {
        var opt = usuarioRepo.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = opt.get();
        
        // Prevent deleting the main admin account
        if ("admin".equals(u.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se puede eliminar la cuenta del administrador principal"));
        }

        // Prevent deleting yourself
        Long currentUserId = jwtUtil.getUserId(authHeader.substring(7));
        if (currentUserId.equals(u.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminar tu propio usuario"));
        }

        deleteUserCleanly(u);
        System.out.println("🗑️ USUARIO ELIMINADO POR EMAIL: " + email);

        return ResponseEntity.ok(Map.of("message", "Usuario eliminado: " + email));
    }

    @DeleteMapping("/barriers/{id}")
    public ResponseEntity<?> deleteBarrier(@PathVariable Long id) {
        var opt = barreraRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Barrera b = opt.get();

        // Delete associated project first to avoid constraint violations
        proyectoRepo.findAll().stream()
                .filter(p -> p.getBarrera() != null && p.getBarrera().getId().equals(id))
                .findFirst()
                .ifPresent(p -> {
                    // break association
                    p.setBarrera(null);
                    proyectoRepo.saveAndFlush(p);
                    // delete chat messages
                    chatMessageRepo.deleteAll(chatMessageRepo.findByProyectoIdOrderByCreatedAtAsc(p.getId()));
                    chatMessageRepo.flush();
                    // delete project
                    proyectoRepo.delete(p);
                    proyectoRepo.flush();
                });

        barreraRepo.delete(b);
        barreraRepo.flush();
        System.out.println("🗑️ BARRERA ELIMINADA: #" + id);

        return ResponseEntity.ok(Map.of("message", "Barrera eliminada con éxito"));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        var opt = proyectoRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Proyecto p = opt.get();

        // Reset associated barrier status to "denuncia" and break link
        if (p.getBarrera() != null) {
            Barrera b = p.getBarrera();
            b.setStatus("denuncia");
            barreraRepo.saveAndFlush(b);
            p.setBarrera(null);
            proyectoRepo.saveAndFlush(p);
        }

        // Delete associated chat messages first to avoid constraint violations
        chatMessageRepo.deleteAll(chatMessageRepo.findByProyectoIdOrderByCreatedAtAsc(p.getId()));
        chatMessageRepo.flush();

        proyectoRepo.delete(p);
        proyectoRepo.flush();
        System.out.println("🗑️ PROYECTO ELIMINADO: #" + id);

        return ResponseEntity.ok(Map.of("message", "Proyecto eliminado con éxito"));
    }

    @DeleteMapping("/collaborators/{id}")
    public ResponseEntity<?> removeCollaborator(@PathVariable Long id) {
        Optional<Colaborador> opt = colaboradorRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Colaborador col = opt.get();
        colaboradorRepo.delete(col);
        System.out.println("👥 COLABORADOR REMOVIDO: #" + id + " (" + col.getName() + ") del proyecto #" + col.getProyecto().getId());
        return ResponseEntity.ok(Map.of("message", "Colaborador removido con éxito"));
    }

    @PostMapping("/projects/{projectId}/collaborators")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> addProjectCollaborator(@PathVariable Long projectId,
            @RequestBody Map<String, Object> body) {
        Optional<Proyecto> projOpt = proyectoRepo.findById(projectId);
        if (projOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Proyecto proj = projOpt.get();
        
        if (body.get("userId") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId es obligatorio"));
        }
        Long userId = Long.parseLong(body.get("userId").toString());
        Optional<Usuario> userOpt = usuarioRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }
        Usuario user = userOpt.get();
        
        // Check if not already a collaborator
        boolean alreadyCollab = proj.getCollaborators().stream()
                .anyMatch(c -> user.getId().equals(c.getUserId()));
        if (alreadyCollab) {
            return ResponseEntity.badRequest().body(Map.of("error", "El usuario ya es colaborador de este proyecto"));
        }
        
        String name = user.getNombreCompleto();
        String initials = name.contains(" ")
                ? ("" + name.split(" ")[0].charAt(0) + name.split(" ")[1].charAt(0)).toUpperCase()
                : name.substring(0, Math.min(2, name.length())).toUpperCase();
                
        String organization = (String) body.get("organization");
        
        Colaborador col = Colaborador.builder()
                .name(name)
                .role("Colaborador")
                .initials(initials)
                .proyecto(proj)
                .userId(user.getId())
                .organization(organization)
                .build();
                
        colaboradorRepo.save(col);
        
        // Force upgrade user's system role to COLABORADOR if they are currently just USUARIO
        if ("USUARIO".equals(user.getRol())) {
            user.setRol("COLABORADOR");
            usuarioRepo.save(user);
        }
        
        System.out.println("👥 COLABORADOR ASOCIADO POR REFERENTE: " + name + " al proyecto #" + projectId);
        
        return ResponseEntity.ok(Map.of("message", "Usuario asociado como colaborador exitosamente"));
    }

    // ═══════ TELEMETRY METRICS ═══════

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        LocalDateTime now = LocalDateTime.now();
        List<ActivityLog> logs = activityLogRepo.findByCreatedAtAfter(now.minusYears(1));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("logged", Map.of(
            "dia", getDailyMetrics(logs, now, true),
            "semana", getWeeklyMetrics(logs, now, true),
            "mes", getMonthlyMetrics(logs, now, true),
            "ano", getYearlyMetrics(logs, now, true)
        ));
        response.put("guest", Map.of(
            "dia", getDailyMetrics(logs, now, false),
            "semana", getWeeklyMetrics(logs, now, false),
            "mes", getMonthlyMetrics(logs, now, false),
            "ano", getYearlyMetrics(logs, now, false)
        ));
        response.put("features", getFeatureUsage(logs));
        response.put("userActivities", getUserActivities(logs));

        return ResponseEntity.ok(response);
    }

    private List<Map<String, Object>> getFeatureUsage(List<ActivityLog> logs) {
        long mapCount = logs.stream().filter(l -> "/barreras".equals(l.getDetail()) || "/mapa".equals(l.getDetail()) || "/".equals(l.getDetail())).count();
        long reportCount = logs.stream().filter(l -> "/reportar".equals(l.getDetail()) || "/gestion/reportar".equals(l.getDetail()) || "report_barrier".equals(l.getDetail())).count();
        long projectCount = logs.stream().filter(l -> l.getDetail() != null && (l.getDetail().startsWith("/proyecto") || l.getDetail().startsWith("/gestion/proyecto") || l.getDetail().startsWith("/gestion/mis-proyectos"))).count();
        long chatCount = logs.stream().filter(l -> "chat_message".equals(l.getDetail())).count();
        long adminCount = logs.stream().filter(l -> l.getDetail() != null && l.getDetail().startsWith("/gestion/admin")).count();

        long total = mapCount + reportCount + projectCount + chatCount + adminCount;
        if (total == 0) total = 1;

        return List.of(
            Map.of("name", "Mapa y Consulta de Barreras", "value", mapCount, "percentage", Math.round(mapCount * 100.0 / total), "color", "var(--primary-500)", "icon", "map"),
            Map.of("name", "Registro / Denuncia de Barreras", "value", reportCount, "percentage", Math.round(reportCount * 100.0 / total), "color", "var(--barrier-actitudinal)", "icon", "report"),
            Map.of("name", "Colaboración en Proyectos", "value", projectCount, "percentage", Math.round(projectCount * 100.0 / total), "color", "var(--status-iniciando)", "icon", "project"),
            Map.of("name", "Chat y Mensajería de Proyectos", "value", chatCount, "percentage", Math.round(chatCount * 100.0 / total), "color", "var(--barrier-comunicacional)", "icon", "chat"),
            Map.of("name", "Consola de Administración", "value", adminCount, "percentage", Math.round(adminCount * 100.0 / total), "color", "var(--primary-700)", "icon", "admin")
        );
    }

    private List<Map<String, Object>> getUserActivities(List<ActivityLog> logs) {
        List<Usuario> dbUsers = usuarioRepo.findAll();
        List<Map<String, Object>> list = new ArrayList<>();

        for (Usuario u : dbUsers) {
            String username = u.getUsername();
            List<ActivityLog> userLogs = logs.stream()
                .filter(l -> username.equalsIgnoreCase(l.getUsername()))
                .toList();

            long map = userLogs.stream().filter(l -> "/barreras".equals(l.getDetail()) || "/mapa".equals(l.getDetail()) || "/".equals(l.getDetail())).count();
            long report = userLogs.stream().filter(l -> "/reportar".equals(l.getDetail()) || "/gestion/reportar".equals(l.getDetail()) || "report_barrier".equals(l.getDetail())).count();
            long projects = userLogs.stream().filter(l -> l.getDetail() != null && (l.getDetail().startsWith("/proyecto") || l.getDetail().startsWith("/gestion/proyecto") || l.getDetail().startsWith("/gestion/mis-proyectos"))).count();
            long chat = userLogs.stream().filter(l -> "chat_message".equals(l.getDetail())).count();
            long admin = userLogs.stream().filter(l -> l.getDetail() != null && l.getDetail().startsWith("/gestion/admin")).count();

            long total = map + report + projects + chat + admin;

            if (total > 0 || "admin".equals(username) || "laura".equals(username) || "soledad".equals(username) || "jose".equals(username)) {
                Map<String, Object> actions = new LinkedHashMap<>();
                actions.put("map", map);
                actions.put("report", report);
                actions.put("projects", projects);
                actions.put("chat", chat);
                actions.put("admin", admin);

                Map<String, Object> uMap = new LinkedHashMap<>();
                uMap.put("nombre", u.getNombreCompleto());
                uMap.put("email", u.getEmail());
                uMap.put("rol", u.getRol());
                uMap.put("actions", actions);
                uMap.put("total", total);
                list.add(uMap);
            }
        }

        list.sort((a, b) -> Long.compare((long) b.get("total"), (long) a.get("total")));
        return list;
    }

    private List<Map<String, Object>> getDailyMetrics(List<ActivityLog> logs, LocalDateTime now, boolean logged) {
        List<Map<String, Object>> points = new ArrayList<>();
        for (int i = 7; i >= 0; i--) {
            LocalDateTime end = now.minusHours(i * 3L);
            LocalDateTime start = end.minusHours(3L);

            long count = logs.stream()
                .filter(l -> l.getCreatedAt().isAfter(start) && l.getCreatedAt().isBefore(end))
                .filter(l -> (l.getUsername() != null) == logged)
                .count();

            String dayLabel = end.toLocalDate().isEqual(now.toLocalDate()) ? "Hoy" : "Ayer";
            String label = dayLabel + " " + String.format("%02d:00", end.getHour());

            points.add(Map.of("label", label, "value", count));
        }
        return points;
    }

    private List<Map<String, Object>> getWeeklyMetrics(List<ActivityLog> logs, LocalDateTime now, boolean logged) {
        List<Map<String, Object>> points = new ArrayList<>();
        String[] weekdays = {"Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"};
        for (int i = 6; i >= 0; i--) {
            LocalDateTime day = now.minusDays(i);
            LocalDateTime start = day.toLocalDate().atStartOfDay();
            LocalDateTime end = day.toLocalDate().atTime(23, 59, 59);

            long count = logs.stream()
                .filter(l -> l.getCreatedAt().isAfter(start) && l.getCreatedAt().isBefore(end))
                .filter(l -> (l.getUsername() != null) == logged)
                .count();

            int index = day.getDayOfWeek().getValue() == 7 ? 0 : day.getDayOfWeek().getValue();
            String label = weekdays[index];

            points.add(Map.of("label", label, "value", count));
        }
        return points;
    }

    private List<Map<String, Object>> getMonthlyMetrics(List<ActivityLog> logs, LocalDateTime now, boolean logged) {
        List<Map<String, Object>> points = new ArrayList<>();
        String[] months = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};
        for (int i = 3; i >= 0; i--) {
            LocalDateTime end = now.minusDays(i * 7L);
            LocalDateTime start = end.minusDays(7L);

            long count = logs.stream()
                .filter(l -> l.getCreatedAt().isAfter(start) && l.getCreatedAt().isBefore(end))
                .filter(l -> (l.getUsername() != null) == logged)
                .count();

            String label;
            if (i == 0) {
                label = "Esta sem.";
            } else {
                label = start.getDayOfMonth() + " " + months[start.getMonthValue() - 1] +
                        " a " + end.getDayOfMonth() + " " + months[end.getMonthValue() - 1];
            }
            points.add(Map.of("label", label, "value", count));
        }
        return points;
    }

    private List<Map<String, Object>> getYearlyMetrics(List<ActivityLog> logs, LocalDateTime now, boolean logged) {
        List<Map<String, Object>> points = new ArrayList<>();
        String[] months = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};
        for (int i = 11; i >= 0; i--) {
            LocalDateTime targetMonth = now.minusMonths(i);
            LocalDateTime start = targetMonth.withDayOfMonth(1).toLocalDate().atStartOfDay();
            LocalDateTime end = targetMonth.withDayOfMonth(targetMonth.toLocalDate().lengthOfMonth()).toLocalDate().atTime(23, 59, 59);

            long count = logs.stream()
                .filter(l -> l.getCreatedAt().isAfter(start) && l.getCreatedAt().isBefore(end))
                .filter(l -> (l.getUsername() != null) == logged)
                .count();

            String label = months[targetMonth.getMonthValue() - 1] + " " + String.valueOf(targetMonth.getYear()).substring(2);
            points.add(Map.of("label", label, "value", count));
        }
        return points;
    }
}
