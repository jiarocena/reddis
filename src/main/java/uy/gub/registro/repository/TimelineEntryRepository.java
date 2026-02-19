package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.TimelineEntry;
import java.util.List;

public interface TimelineEntryRepository extends JpaRepository<TimelineEntry, Long> {
    List<TimelineEntry> findByProyectoIdOrderByDateAsc(Long proyectoId);
}
