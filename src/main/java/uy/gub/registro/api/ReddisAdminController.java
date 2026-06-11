package uy.gub.registro.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.config.JwtUtil;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.*;

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

    public ReddisAdminController(BarreraRepository barreraRepo, RoleRequestRepository roleRequestRepo,
            UsuarioRepository usuarioRepo, JwtUtil jwtUtil, ProyectoRepository proyectoRepo, 
            ColaboradorRepository colaboradorRepo, ChatMessageRepository chatMessageRepo) {
        this.barreraRepo = barreraRepo;
        this.roleRequestRepo = roleRequestRepo;
        this.usuarioRepo = usuarioRepo;
        this.jwtUtil = jwtUtil;
        this.proyectoRepo = proyectoRepo;
        this.colaboradorRepo = colaboradorRepo;
        this.chatMessageRepo = chatMessageRepo;
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

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        var opt = usuarioRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Usuario u = opt.get();
        // Don't allow deleting system accounts
        if ("ADMIN".equals(u.getRol()) || "REFERENTE".equals(u.getRol())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se puede eliminar cuentas de sistema"));
        }

        // Delete associated role requests
        roleRequestRepo.findAll().stream()
                .filter(r -> r.getUsuario().getId().equals(id))
                .forEach(roleRequestRepo::delete);

        usuarioRepo.delete(u);
        System.out.println("🗑️ USUARIO ELIMINADO: " + u.getEmail());

        return ResponseEntity.ok(Map.of("message", "Usuario eliminado: " + u.getEmail()));
    }

    @DeleteMapping("/users/by-email")
    public ResponseEntity<?> deleteUserByEmail(@RequestParam String email) {
        var opt = usuarioRepo.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = opt.get();
        if ("ADMIN".equals(u.getRol()) || "REFERENTE".equals(u.getRol())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se puede eliminar cuentas de sistema"));
        }

        // Delete associated role requests
        roleRequestRepo.findAll().stream()
                .filter(r -> r.getUsuario().getId().equals(u.getId()))
                .forEach(roleRequestRepo::delete);

        usuarioRepo.delete(u);
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
                    chatMessageRepo.deleteAll(chatMessageRepo.findByProyectoIdOrderByCreatedAtAsc(p.getId()));
                    proyectoRepo.delete(p);
                });

        barreraRepo.delete(b);
        System.out.println("🗑️ BARRERA ELIMINADA: #" + id);

        return ResponseEntity.ok(Map.of("message", "Barrera eliminada con éxito"));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        var opt = proyectoRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Proyecto p = opt.get();

        // Reset associated barrier status to "denuncia"
        if (p.getBarrera() != null) {
            Barrera b = p.getBarrera();
            b.setStatus("denuncia");
            barreraRepo.save(b);
        }

        // Delete associated chat messages first to avoid constraint violations
        chatMessageRepo.deleteAll(chatMessageRepo.findByProyectoIdOrderByCreatedAtAsc(p.getId()));

        proyectoRepo.delete(p);
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
}
