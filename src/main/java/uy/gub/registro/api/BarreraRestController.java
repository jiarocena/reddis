package uy.gub.registro.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.config.JwtUtil;
import uy.gub.registro.model.Barrera;
import uy.gub.registro.model.Usuario;
import uy.gub.registro.repository.UsuarioRepository;
import uy.gub.registro.service.ReddisService;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/reddis")
public class BarreraRestController {

    private final ReddisService reddisService;
    private final UsuarioRepository usuarioRepo;
    private final JwtUtil jwtUtil;

    public BarreraRestController(ReddisService reddisService, UsuarioRepository usuarioRepo, JwtUtil jwtUtil) {
        this.reddisService = reddisService;
        this.usuarioRepo = usuarioRepo;
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
        Barrera barrera = Barrera.builder()
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .type((String) body.getOrDefault("type", "estructural"))
                .category((String) body.getOrDefault("category", "fisica"))
                .address((String) body.get("address"))
                .affectedPeople((String) body.get("affectedPeople"))
                .urgency((String) body.getOrDefault("urgency", "media"))
                .reportedBy((String) body.get("reportedBy"))
                .isPublic(body.get("isPublic") == null || (Boolean) body.get("isPublic"))
                .approved(false) // NEW: requires referente approval
                .build();

        // Link to authenticated user
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Long userId = jwtUtil.getUserId(authHeader.substring(7));
                Usuario user = usuarioRepo.findById(userId).orElse(null);
                if (user != null) {
                    barrera.setReportedByUser(user);
                    barrera.setReportedBy(user.getNombreCompleto());
                }
            } catch (Exception ignored) {
            }
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
        return reddisService.obtenerEstadisticas();
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
