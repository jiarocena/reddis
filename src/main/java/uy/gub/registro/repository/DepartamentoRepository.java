package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.Departamento;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
}
