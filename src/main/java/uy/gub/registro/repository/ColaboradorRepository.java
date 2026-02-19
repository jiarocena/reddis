package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.Colaborador;
import java.util.List;

public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    List<Colaborador> findByProyectoId(Long proyectoId);
}
