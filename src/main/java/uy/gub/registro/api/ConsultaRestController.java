package uy.gub.registro.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.UsuarioRepository;
import uy.gub.registro.repository.ConsultaRepository;
import uy.gub.registro.repository.RespuestaRepository;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/reddis")
public class ConsultaRestController {

    private final ConsultaRepository consultaRepo;
    private final RespuestaRepository respuestaRepo;
    private final UsuarioRepository usuarioRepo;

    public ConsultaRestController(ConsultaRepository consultaRepo, RespuestaRepository respuestaRepo, UsuarioRepository usuarioRepo) {
        this.consultaRepo = consultaRepo;
        this.respuestaRepo = respuestaRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @GetMapping("/consultas")
    public List<Map<String, Object>> listar() {
        List<Consulta> consultas = consultaRepo.findAll();
        // Sort by date descending (newest first)
        consultas.sort((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()));
        return consultas.stream().map(this::toMap).toList();
    }

    @PostMapping("/consultas")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String title = (String) body.get("title");
        String content = (String) body.get("content");
        String category = (String) body.get("category");

        if (title == null || title.trim().isEmpty() ||
            content == null || content.trim().isEmpty() ||
            category == null || category.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Datos incompletos"));
        }

        Consulta consulta = Consulta.builder()
                .title(title)
                .content(content)
                .category(category)
                .usuario(user)
                .createdAt(LocalDateTime.now())
                .build();

        Consulta saved = consultaRepo.save(consulta);
        return ResponseEntity.ok(toMap(saved));
    }

    @PostMapping("/consultas/{id}/respuestas")
    public ResponseEntity<?> responder(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Usuario user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Optional<Consulta> opt = consultaRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String content = (String) body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El contenido de la respuesta está vacío"));
        }

        Respuesta respuesta = Respuesta.builder()
                .content(content)
                .usuario(user)
                .consulta(opt.get())
                .createdAt(LocalDateTime.now())
                .build();

        Respuesta saved = respuestaRepo.save(respuesta);

        // Return the mapped response
        Map<String, Object> resMap = new LinkedHashMap<>();
        resMap.put("id", saved.getId());
        resMap.put("content", saved.getContent());
        resMap.put("createdAt", saved.getCreatedAt().toString());
        resMap.put("userId", user.getId());
        resMap.put("userName", user.getNombreCompleto());
        resMap.put("username", user.getUsername());

        return ResponseEntity.ok(resMap);
    }

    private Usuario getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String username = auth.getName();
        return usuarioRepo.findByUsername(username).orElse(null);
    }

    private Map<String, Object> toMap(Consulta c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("title", c.getTitle());
        m.put("content", c.getContent());
        m.put("category", c.getCategory());
        m.put("createdAt", c.getCreatedAt().toString());

        // User info
        Usuario user = c.getUsuario();
        m.put("userId", user != null ? user.getId() : null);
        m.put("userName", user != null ? user.getNombreCompleto() : "Anónimo");
        m.put("username", user != null ? user.getUsername() : null);

        // Replies
        List<Map<String, Object>> replies = new ArrayList<>();
        if (c.getRespuestas() != null) {
            for (Respuesta r : c.getRespuestas()) {
                Map<String, Object> rm = new LinkedHashMap<>();
                rm.put("id", r.getId());
                rm.put("content", r.getContent());
                rm.put("createdAt", r.getCreatedAt().toString());
                Usuario rUser = r.getUsuario();
                rm.put("userId", rUser != null ? rUser.getId() : null);
                rm.put("userName", rUser != null ? rUser.getNombreCompleto() : "Anónimo");
                rm.put("username", rUser != null ? rUser.getUsername() : null);
                replies.add(rm);
            }
        }
        m.put("respuestas", replies);

        return m;
    }
}
