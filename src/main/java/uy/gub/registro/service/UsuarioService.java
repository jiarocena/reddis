package uy.gub.registro.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uy.gub.registro.model.Usuario;
import uy.gub.registro.repository.UsuarioRepository;

import java.util.Collections;
import java.util.List;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (!usuario.getActivo()) {
            throw new UsernameNotFoundException("Usuario desactivado: " + username);
        }

        return new User(
                usuario.getUsername(),
                usuario.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRol())));
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public Usuario buscarPorUsername(String username) {
        return usuarioRepository.findByUsername(username).orElse(null);
    }

    @Transactional
    public Usuario guardar(Usuario usuario) {
        if (usuario.getId() == null) {
            // nuevo usuario - encriptar contraseña
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizar(Usuario usuario, String nuevaPassword) {
        Usuario existente = usuarioRepository.findById(usuario.getId()).orElseThrow();
        existente.setNombreCompleto(usuario.getNombreCompleto());
        existente.setEmail(usuario.getEmail());
        existente.setRol(usuario.getRol());
        existente.setActivo(usuario.getActivo());
        if (nuevaPassword != null && !nuevaPassword.isBlank()) {
            existente.setPassword(passwordEncoder.encode(nuevaPassword));
        }
        return usuarioRepository.save(existente);
    }

    public boolean existeUsername(String username) {
        return usuarioRepository.existsByUsername(username);
    }

    @Transactional
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
}
