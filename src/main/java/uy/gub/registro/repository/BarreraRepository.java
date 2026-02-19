package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.Barrera;
import java.util.List;

public interface BarreraRepository extends JpaRepository<Barrera, Long> {

    List<Barrera> findByIsPublicTrueOrderByCreatedAtDesc();

    List<Barrera> findByCategoryAndIsPublicTrue(String category);

    List<Barrera> findByStatusAndIsPublicTrue(String status);

    List<Barrera> findByDepartamentoIdAndIsPublicTrue(Long departamentoId);

    long countByStatus(String status);

    long countByCategory(String category);
}
