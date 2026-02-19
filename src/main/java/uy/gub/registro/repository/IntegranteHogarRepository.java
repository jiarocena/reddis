package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.IntegranteHogar;
import java.util.List;

public interface IntegranteHogarRepository extends JpaRepository<IntegranteHogar, Long> {
    List<IntegranteHogar> findByPersonaId(Long personaId);

    void deleteByPersonaId(Long personaId);
}
