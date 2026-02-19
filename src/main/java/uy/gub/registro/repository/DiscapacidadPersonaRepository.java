package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.DiscapacidadPersona;
import java.util.List;

public interface DiscapacidadPersonaRepository extends JpaRepository<DiscapacidadPersona, Long> {
    List<DiscapacidadPersona> findByPersonaId(Long personaId);

    void deleteByPersonaId(Long personaId);
}
