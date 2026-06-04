package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.PushSubscription;
import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUsuarioId(Long usuarioId);
    Optional<PushSubscription> findByEndpoint(String endpoint);
    void deleteByEndpoint(String endpoint);
}
