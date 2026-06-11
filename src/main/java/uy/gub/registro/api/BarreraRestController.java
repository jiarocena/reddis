package uy.gub.registro.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.config.JwtUtil;
import uy.gub.registro.model.Barrera;
import uy.gub.registro.model.Departamento;
import uy.gub.registro.model.Usuario;
import uy.gub.registro.repository.DepartamentoRepository;
import uy.gub.registro.repository.UsuarioRepository;
import uy.gub.registro.service.ReddisService;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/reddis")
public class BarreraRestController {

    // TODO: Temporalmente en true para facilitar pruebas. Cambiar a false para requerir aprobación manual de referentes.
    private static final boolean AUTO_APPROVE_BARRIERS = true;

    private final ReddisService reddisService;
    private final UsuarioRepository usuarioRepo;
    private final DepartamentoRepository departamentoRepo;
    private final JwtUtil jwtUtil;

    public BarreraRestController(ReddisService reddisService, UsuarioRepository usuarioRepo,
            DepartamentoRepository departamentoRepo, JwtUtil jwtUtil) {
        this.reddisService = reddisService;
        this.usuarioRepo = usuarioRepo;
        this.departamentoRepo = departamentoRepo;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/barreras")
    public List<Map<String, Object>> listar(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        boolean isReferente = isReferenteOrAdmin(authHeader);

        return reddisService.listarBarreras().stream()
                .filter(b -> isReferente || Boolean.TRUE.equals(b.getApproved()))
                .map(this::toMap)
                .toList();
    }

    @GetMapping("/barreras/{id}")
    public ResponseEntity<Map<String, Object>> detalle(@PathVariable Long id) {
        Barrera b = reddisService.obtenerBarrera(id);
        if (b == null)
            return ResponseEntity.notFound().build();

        Map<String, Object> data = toMap(b);

        var proyecto = reddisService.obtenerProyectoPorBarrera(id);
        if (proyecto != null) {
            data.put("projectId", proyecto.getId());
        }

        return ResponseEntity.ok(data);
    }

    @PostMapping("/barreras")
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // ── Honeypot anti-bot: if "website" field has any value, it's a bot
        String honeypot = (String) body.get("website");
        if (honeypot != null && !honeypot.isBlank()) {
            System.out.println("🤖 BOT DETECTADO — honeypot field filled: " + honeypot);
            // Return fake success to not alert the bot
            Map<String, Object> fake = new LinkedHashMap<>();
            fake.put("id", -1);
            fake.put("title", body.get("title"));
            return ResponseEntity.ok(fake);
        }

        // ── Rate limiting: max 3 barriers per day per user
        Long userId = null;
        Usuario user = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                userId = jwtUtil.getUserId(authHeader.substring(7));
                user = usuarioRepo.findById(userId).orElse(null);
            } catch (Exception ignored) {}
        }

        if (userId != null) {
            java.time.LocalDateTime since = java.time.LocalDateTime.now().minusHours(24);
            long todayCount = reddisService.countBarrerasByUserSince(userId, since);
            if (todayCount >= 3) {
                System.out.println("⚠️ RATE LIMIT: usuario #" + userId + " ya reportó " + todayCount + " barreras hoy");
                return ResponseEntity.status(429)
                        .body(Map.of("error", "Alcanzaste el límite de 3 reportes por día. Intentá mañana."));
            }
        }

        Barrera barrera = Barrera.builder()
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .photoBase64((String) body.get("photoBase64"))
                .type((String) body.getOrDefault("type", "estructural"))
                .category((String) body.getOrDefault("category", "fisica"))
                .address((String) body.get("address"))
                .affectedPeople((String) body.get("affectedPeople"))
                .urgency((String) body.getOrDefault("urgency", "media"))
                .reportedBy((String) body.get("reportedBy"))
                .isPublic(body.get("isPublic") == null || (Boolean) body.get("isPublic"))
                .approved(AUTO_APPROVE_BARRIERS) // auto-approve if configured
                .localidad((String) body.get("localidad"))
                .build();

        // Link to department
        String deptoName = (String) body.get("departamento");
        if (deptoName != null && !deptoName.isBlank()) {
            Departamento depto = departamentoRepo.findAll().stream()
                    .filter(d -> d.getNombre().equalsIgnoreCase(deptoName.trim()))
                    .findFirst()
                    .orElseGet(() -> departamentoRepo.save(
                            Departamento.builder().nombre(deptoName.trim()).build()));
            barrera.setDepartamento(depto);
        }

        // Link to authenticated user
        if (user != null) {
            barrera.setReportedByUser(user);
            barrera.setReportedBy(user.getNombreCompleto());
        }

        // Parse location
        if (body.get("location") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> loc = (Map<String, Object>) body.get("location");
            barrera.setLat(toBigDecimal(loc.get("lat")));
            barrera.setLng(toBigDecimal(loc.get("lng")));
        }

        Barrera saved = reddisService.crearBarrera(barrera);

        System.out.println("📋 NUEVA BARRERA (pendiente aprobación): #" + saved.getId() + " - " + saved.getTitle());

        return ResponseEntity.ok(toMap(saved));
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of("status", "UP");
    }

    @GetMapping("/departamentos")
    public List<Map<String, Object>> listarDepartamentos() {
        return departamentoRepo.findAll().stream()
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", d.getId());
                    m.put("nombre", d.getNombre());
                    m.put("codigo", d.getCodigo());
                    return m;
                }).toList();
    }

    // ---- helpers ----

    private boolean isReferenteOrAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return false;
        try {
            String role = jwtUtil.getRole(authHeader.substring(7));
            return "REFERENTE".equals(role) || "ADMIN".equals(role);
        } catch (Exception e) {
            return false;
        }
    }

    private Map<String, Object> toMap(Barrera b) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", b.getId());
        m.put("title", b.getTitle());
        m.put("description", b.getDescription());
        m.put("type", b.getType());
        m.put("category", b.getCategory());
        m.put("address", b.getAddress());
        m.put("affectedPeople", b.getAffectedPeople());
        m.put("urgency", b.getUrgency());
        m.put("status", b.getStatus());
        m.put("reportedBy", b.getReportedBy());
        m.put("isPublic", b.getIsPublic());
        m.put("approved", b.getApproved());
        m.put("date", b.getCreatedAt() != null ? b.getCreatedAt().toLocalDate().toString() : null);
        m.put("departamento", b.getDepartamento() != null ? b.getDepartamento().getNombre() : null);
        m.put("localidad", b.getLocalidad());
        if (b.getPhotoBase64() != null) m.put("photoBase64", b.getPhotoBase64());

        Map<String, Object> loc = new LinkedHashMap<>();
        loc.put("lat", b.getLat() != null ? b.getLat().doubleValue() : null);
        loc.put("lng", b.getLng() != null ? b.getLng().doubleValue() : null);
        m.put("location", loc);

        return m;
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null)
            return null;
        if (val instanceof Number)
            return BigDecimal.valueOf(((Number) val).doubleValue());
        try {
            return new BigDecimal(val.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
