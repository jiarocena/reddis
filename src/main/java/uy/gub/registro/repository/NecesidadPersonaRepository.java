package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.NecesidadPersona;
import java.util.List;

public interface NecesidadPersonaRepository extends JpaRepository<NecesidadPersona, Long> {
    List<NecesidadPersona> findByPersonaId(Long personaId);

    void deleteByPersonaId(Long personaId);
}
