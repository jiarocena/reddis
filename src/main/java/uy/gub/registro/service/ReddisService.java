package uy.gub.registro.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uy.gub.registro.model.*;
import uy.gub.registro.repository.*;

import java.time.LocalDate;
import java.util.*;

@Service
public class ReddisService {

    private final BarreraRepository barreraRepository;
    private final ProyectoRepository proyectoRepository;
    private final ColaboradorRepository colaboradorRepository;
    private final TimelineEntryRepository timelineEntryRepository;

    public ReddisService(BarreraRepository barreraRepository,
            ProyectoRepository proyectoRepository,
            ColaboradorRepository colaboradorRepository,
            TimelineEntryRepository timelineEntryRepository) {
        this.barreraRepository = barreraRepository;
        this.proyectoRepository = proyectoRepository;
        this.colaboradorRepository = colaboradorRepository;
        this.timelineEntryRepository = timelineEntryRepository;
    }

    // ═══════════════════ BARRERAS ═══════════════════

    public List<Barrera> listarBarreras() {
        return barreraRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    public Barrera obtenerBarrera(Long id) {
        return barreraRepository.findById(id).orElse(null);
    }

    @Transactional
    public Barrera crearBarrera(Barrera barrera) {
        if (barrera.getStatus() == null)
            barrera.setStatus("denuncia");
        if (barrera.getIsPublic() == null)
            barrera.setIsPublic(true);
        return barreraRepository.save(barrera);
    }

    @Transactional
    public Barrera actualizarStatusBarrera(Long id, String status) {
        Barrera b = barreraRepository.findById(id).orElseThrow();
        b.setStatus(status);
        return barreraRepository.save(b);
    }

    // ═══════════════════ PROYECTOS ═══════════════════

    public List<Proyecto> listarProyectos() {
        return proyectoRepository.findAll();
    }

    public Proyecto obtenerProyecto(Long id) {
        return proyectoRepository.findById(id).orElse(null);
    }

    public Proyecto obtenerProyectoPorBarrera(Long barreraId) {
        return proyectoRepository.findByBarreraId(barreraId).orElse(null);
    }

    @Transactional
    public Proyecto crearProyecto(Proyecto proyecto, Long barreraId) {
        Barrera barrera = barreraRepository.findById(barreraId).orElseThrow();
        barrera.setStatus("iniciando");
        barreraRepository.save(barrera);

        proyecto.setBarrera(barrera);
        if (proyecto.getStatus() == null)
            proyecto.setStatus("iniciando");
        if (proyecto.getStartDate() == null)
            proyecto.setStartDate(LocalDate.now());

        Proyecto saved = proyectoRepository.save(proyecto);

        // Create initial timeline entry
        TimelineEntry initial = TimelineEntry.builder()
                .date(LocalDate.now())
                .text("Proyecto creado - " + proyecto.getTitle())
                .completed(true)
                .proyecto(saved)
                .build();
        timelineEntryRepository.save(initial);

        return saved;
    }

    @Transactional
    public Proyecto actualizarStatusProyecto(Long id, String status) {
        Proyecto p = proyectoRepository.findById(id).orElseThrow();
        p.setStatus(status);

        // Update barrier status accordingly
        if (p.getBarrera() != null) {
            p.getBarrera().setStatus(status);
            barreraRepository.save(p.getBarrera());
        }

        if ("finalizado".equals(status)) {
            p.setEndDate(LocalDate.now());
        }

        // Add timeline entry for status change
        TimelineEntry entry = TimelineEntry.builder()
                .date(LocalDate.now())
                .text("Estado cambiado a: " + status)
                .completed(true)
                .proyecto(p)
                .build();
        timelineEntryRepository.save(entry);

        return proyectoRepository.save(p);
    }

    @Transactional
    public Proyecto actualizarProyectoFinalizado(Long id, String impact, String lessons) {
        Proyecto p = proyectoRepository.findById(id).orElseThrow();
        p.setImpact(impact);
        p.setLessons(lessons);
        return proyectoRepository.save(p);
    }

    // ═══════════════════ COLABORADORES ═══════════════════

    @Transactional
    public Colaborador agregarColaborador(Long proyectoId, Colaborador colaborador) {
        Proyecto p = proyectoRepository.findById(proyectoId).orElseThrow();
        colaborador.setProyecto(p);

        if (colaborador.getInitials() == null || colaborador.getInitials().isBlank()) {
            String[] parts = colaborador.getName().trim().split("\\s+");
            StringBuilder initials = new StringBuilder();
            for (String part : parts) {
                if (!part.isEmpty())
                    initials.append(Character.toUpperCase(part.charAt(0)));
            }
            colaborador.setInitials(initials.toString().substring(0, Math.min(initials.length(), 3)));
        }

        // Add timeline entry
        TimelineEntry entry = TimelineEntry.builder()
                .date(LocalDate.now())
                .text(colaborador.getName() + " se sumó como "
                        + (colaborador.getRole() != null ? colaborador.getRole() : "colaborador"))
                .completed(true)
                .proyecto(p)
                .build();
        timelineEntryRepository.save(entry);

        return colaboradorRepository.save(colaborador);
    }

    // ═══════════════════ TIMELINE ═══════════════════

    @Transactional
    public TimelineEntry agregarTimelineEntry(Long proyectoId, TimelineEntry entry) {
        Proyecto p = proyectoRepository.findById(proyectoId).orElseThrow();
        entry.setProyecto(p);
        if (entry.getDate() == null)
            entry.setDate(LocalDate.now());
        return timelineEntryRepository.save(entry);
    }

    // ═══════════════════ ESTADÍSTICAS ═══════════════════

    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBarriers", barreraRepository.count());
        stats.put("activeProjects",
                proyectoRepository.countByStatus("iniciando") + proyectoRepository.countByStatus("en-proceso"));
        stats.put("resolvedProjects", proyectoRepository.countByStatus("finalizado"));

        // Count all collaborators
        long totalCollaborators = colaboradorRepository.count();
        stats.put("totalCollaborators", totalCollaborators);

        // Count by category
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (String cat : List.of("fisica", "comunicacional", "actitudinal", "institucional")) {
            byCategory.put(cat, barreraRepository.countByCategory(cat));
        }
        stats.put("byCategory", byCategory);

        // Count by status
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (String st : List.of("denuncia", "iniciando", "en-proceso", "finalizado")) {
            byStatus.put(st, barreraRepository.countByStatus(st));
        }
        stats.put("byStatus", byStatus);

        return stats;
    }
}
