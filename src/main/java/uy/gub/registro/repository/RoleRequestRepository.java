package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.RoleRequest;

import java.util.List;

public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {
    List<RoleRequest> findByStatusOrderByCreatedAtDesc(String status);

    List<RoleRequest> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    boolean existsByUsuarioIdAndStatusAndRequestedRole(Long usuarioId, String status, String requestedRole);

    boolean existsByUsuarioIdAndRequestedRole(Long usuarioId, String requestedRole);
}
