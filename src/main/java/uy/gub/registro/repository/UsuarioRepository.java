package uy.gub.registro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uy.gub.registro.model.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByEmail(String email);

    boolean existsByUsername(String username);
}
