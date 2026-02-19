package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uy.gub.registro.model.Persona;

import java.util.List;
import java.util.Optional;

public interface PersonaRepository extends JpaRepository<Persona, Long> {

    Optional<Persona> findByCedula(String cedula);

    boolean existsByCedula(String cedula);

    @Query("SELECT p FROM Persona p LEFT JOIN FETCH p.departamento WHERE " +
            "LOWER(p.cedula) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
            "LOWER(p.nombres) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
            "LOWER(p.apellidos) LIKE LOWER(CONCAT('%', :busqueda, '%'))")
    List<Persona> buscar(@Param("busqueda") String busqueda);

    @Query("SELECT COUNT(p) FROM Persona p WHERE p.departamento.id = :depId")
    Long contarPorDepartamento(@Param("depId") Long departamentoId);

    @Query("SELECT p.departamento.nombre, COUNT(p) FROM Persona p " +
            "WHERE p.departamento IS NOT NULL GROUP BY p.departamento.nombre ORDER BY COUNT(p) DESC")
    List<Object[]> estadisticasPorDepartamento();

    @Query("SELECT dp.categoria.nombre, COUNT(dp) FROM DiscapacidadPersona dp " +
            "GROUP BY dp.categoria.nombre ORDER BY COUNT(dp) DESC")
    List<Object[]> estadisticasPorDiscapacidad();

    @Query("SELECT np.categoriaNecesidad.nombre, COUNT(np) FROM NecesidadPersona np " +
            "GROUP BY np.categoriaNecesidad.nombre ORDER BY COUNT(np) DESC")
    List<Object[]> estadisticasPorNecesidad();
}
