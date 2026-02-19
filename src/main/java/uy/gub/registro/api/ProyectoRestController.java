package uy.gub.registro.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uy.gub.registro.model.*;
import uy.gub.registro.service.ReddisService;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reddis")
public class ProyectoRestController {

    private final ReddisService reddisService;

    public ProyectoRestController(ReddisService reddisService) {
        this.reddisService = reddisService;
    }

    @GetMapping("/proyectos")
    public List<Map<String, Object>> listar() {
        return reddisService.listarProyectos().stream()
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

        Proyecto proyecto = Proyecto.builder()
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .objective((String) body.get("objective"))
                .leader((String) body.get("leader"))
                .resources((String) body.get("resources"))
                .needsHelp(body.get("needsHelp") != null && (Boolean) body.get("needsHelp"))
                .helpDescription((String) body.get("helpDescription"))
                .build();

        Proyecto saved = reddisService.crearProyecto(proyecto, barreraId);
        return ResponseEntity.ok(toMap(saved));
    }

    @PutMapping("/proyectos/{id}/status")
    public ResponseEntity<Map<String, Object>> cambiarStatus(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null)
            return ResponseEntity.badRequest().build();

        Proyecto updated = reddisService.actualizarStatusProyecto(id, status);
        return ResponseEntity.ok(toMap(updated));
    }

    @PutMapping("/proyectos/{id}/finalizar")
    public ResponseEntity<Map<String, Object>> finalizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        reddisService.actualizarStatusProyecto(id, "finalizado");
        Proyecto updated = reddisService.actualizarProyectoFinalizado(id,
                body.get("impact"), body.get("lessons"));
        return ResponseEntity.ok(toMap(updated));
    }

    @PostMapping("/proyectos/{id}/timeline")
    public ResponseEntity<Map<String, Object>> agregarTimeline(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        TimelineEntry entry = TimelineEntry.builder()
                .text((String) body.get("text"))
                .completed(body.get("completed") != null && (Boolean) body.get("completed"))
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
        return ResponseEntity.ok(result);
    }

    @PostMapping("/proyectos/{id}/colaboradores")
    public ResponseEntity<Map<String, Object>> agregarColaborador(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Colaborador col = Colaborador.builder()
                .name(body.get("name"))
                .role(body.get("role"))
                .initials(body.get("initials"))
                .build();

        Colaborador saved = reddisService.agregarColaborador(id, col);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        result.put("role", saved.getRole());
        result.put("initials", saved.getInitials());
        return ResponseEntity.ok(result);
    }

    // ---- mapping helpers ----

    private Map<String, Object> toMap(Proyecto p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("barrierId", p.getBarrera() != null ? p.getBarrera().getId() : null);
        m.put("title", p.getTitle());
        m.put("description", p.getDescription());
        m.put("objective", p.getObjective());
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
}
