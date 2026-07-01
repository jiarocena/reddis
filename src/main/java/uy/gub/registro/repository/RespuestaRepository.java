package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uy.gub.registro.model.Respuesta;

@Repository
public interface RespuestaRepository extends JpaRepository<Respuesta, Long> {
}
