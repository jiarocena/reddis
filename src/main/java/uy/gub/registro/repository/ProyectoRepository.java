package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.Proyecto;
import java.util.List;
import java.util.Optional;

public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {

    Optional<Proyecto> findByBarreraId(Long barreraId);

    List<Proyecto> findByStatus(String status);

    long countByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT p.barrera.id FROM Proyecto p WHERE p.barrera IS NOT NULL")
    List<Long> findAllBarrierIdsWithProject();
}
